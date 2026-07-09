import { pool } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { comparePassword, hashPassword } from '../utils/password.util';
import { hashToken, parseDurationToMs } from '../utils/token.util';
import {
  AuthTokenPayload,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.util';

interface RegisterInput {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  password: string;
}

interface LoginInput {
  correo: string;
  password: string;
}

interface AuthUser {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  roles: string[];
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

async function getUserRoles(idUsuario: string): Promise<string[]> {
  const result = await pool.query(
    `
    SELECT r.codigo
    FROM seguridad.usuario_roles ur
    INNER JOIN seguridad.roles r
      ON r.id_rol = ur.id_rol
    WHERE ur.id_usuario = $1
      AND r.estado = 'ACTIVO'
    `,
    [idUsuario]
  );

  return result.rows.map((row) => row.codigo);
}

async function saveRefreshToken(
  idUsuario: string,
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string
): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

  await pool.query(
    `
    INSERT INTO seguridad.refresh_tokens (
      id_usuario,
      token_hash,
      user_agent,
      ip_address,
      fecha_expiracion
    )
    VALUES ($1, $2, $3, $4, $5)
    `,
    [idUsuario, tokenHash, userAgent ?? null, ipAddress ?? null, expiresAt]
  );
}

async function buildAuthResponse(
  user: AuthUser,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthResponse> {
  const payload: AuthTokenPayload = {
    id_usuario: user.id_usuario,
    correo: user.correo,
    roles: user.roles
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await saveRefreshToken(user.id_usuario, refreshToken, userAgent, ipAddress);

  return {
    user,
    accessToken,
    refreshToken
  };
}

export async function registerUserWithRole(
  input: RegisterInput,
  roleCode: 'CLIENTE' | 'VENDEDOR',
  userAgent?: string,
  ipAddress?: string
): Promise<AuthResponse> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingUser = await client.query(
      `
      SELECT id_usuario
      FROM seguridad.usuarios
      WHERE correo = $1
      `,
      [input.correo]
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
      throw new AppError('Ya existe un usuario registrado con ese correo.', 409);
    }

    const passwordHash = await hashPassword(input.password);

    const userResult = await client.query(
      `
      INSERT INTO seguridad.usuarios (
        nombres,
        apellidos,
        correo,
        telefono,
        password_hash
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_usuario, nombres, apellidos, correo, telefono
      `,
      [
        input.nombres,
        input.apellidos,
        input.correo,
        input.telefono ?? null,
        passwordHash
      ]
    );

    const roleResult = await client.query(
      `
      SELECT id_rol
      FROM seguridad.roles
      WHERE codigo = $1
        AND estado = 'ACTIVO'
      `,
      [roleCode]
    );

    if (roleResult.rowCount === 0) {
      throw new AppError(`El rol ${roleCode} no existe en la base de datos.`, 500);
    }

    await client.query(
      `
      INSERT INTO seguridad.usuario_roles (
        id_usuario,
        id_rol
      )
      VALUES ($1, $2)
      `,
      [userResult.rows[0].id_usuario, roleResult.rows[0].id_rol]
    );

    await client.query('COMMIT');

    const user: AuthUser = {
      ...userResult.rows[0],
      roles: [roleCode]
    };

    return buildAuthResponse(user, userAgent, ipAddress);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function loginUser(
  input: LoginInput,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthResponse> {
  const result = await pool.query(
    `
    SELECT
      id_usuario,
      nombres,
      apellidos,
      correo,
      telefono,
      password_hash,
      estado
    FROM seguridad.usuarios
    WHERE correo = $1
    `,
    [input.correo]
  );

  if (result.rowCount === 0) {
    throw new AppError('Correo o contraseña incorrectos.', 401);
  }

  const userRow = result.rows[0];

  if (userRow.estado !== 'ACTIVO') {
    throw new AppError('El usuario no se encuentra activo.', 403);
  }

  const passwordIsValid = await comparePassword(input.password, userRow.password_hash);

  if (!passwordIsValid) {
    throw new AppError('Correo o contraseña incorrectos.', 401);
  }

  const roles = await getUserRoles(userRow.id_usuario);

  const user: AuthUser = {
    id_usuario: userRow.id_usuario,
    nombres: userRow.nombres,
    apellidos: userRow.apellidos,
    correo: userRow.correo,
    telefono: userRow.telefono,
    roles
  };

  return buildAuthResponse(user, userAgent, ipAddress);
}

export async function refreshSession(
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthResponse> {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const result = await pool.query(
    `
    SELECT
      rt.id_refresh_token,
      u.id_usuario,
      u.nombres,
      u.apellidos,
      u.correo,
      u.telefono,
      u.estado
    FROM seguridad.refresh_tokens rt
    INNER JOIN seguridad.usuarios u
      ON u.id_usuario = rt.id_usuario
    WHERE rt.token_hash = $1
      AND rt.id_usuario = $2
      AND rt.estado = 'ACTIVO'
      AND rt.revocado = FALSE
      AND rt.fecha_expiracion > NOW()
    `,
    [tokenHash, payload.id_usuario]
  );

  if (result.rowCount === 0) {
    throw new AppError('Refresh token inválido o expirado.', 401);
  }

  const userRow = result.rows[0];

  if (userRow.estado !== 'ACTIVO') {
    throw new AppError('El usuario no se encuentra activo.', 403);
  }

  await pool.query(
    `
    UPDATE seguridad.refresh_tokens
    SET estado = 'REVOCADO',
        revocado = TRUE,
        fecha_revocacion = NOW()
    WHERE id_refresh_token = $1
    `,
    [userRow.id_refresh_token]
  );

  const roles = await getUserRoles(userRow.id_usuario);

  const user: AuthUser = {
    id_usuario: userRow.id_usuario,
    nombres: userRow.nombres,
    apellidos: userRow.apellidos,
    correo: userRow.correo,
    telefono: userRow.telefono,
    roles
  };

  return buildAuthResponse(user, userAgent, ipAddress);
}

export async function logoutUser(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);

  await pool.query(
    `
    UPDATE seguridad.refresh_tokens
    SET estado = 'REVOCADO',
        revocado = TRUE,
        fecha_revocacion = NOW()
    WHERE token_hash = $1
      AND estado = 'ACTIVO'
      AND revocado = FALSE
    `,
    [tokenHash]
  );
}