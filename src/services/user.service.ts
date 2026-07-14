import { pool } from '../config/database';

export async function getAdminUsers(idAdmin: string) {
  const result = await pool.query(
    `
    SELECT seguridad.fn_usuarios_admin_api($1) AS data
    `,
    [idAdmin]
  );

  return result.rows[0].data;
}

export async function changeUserStatusAdmin(
  idAdmin: string,
  idUsuario: string,
  nuevoEstado: 'ACTIVO' | 'INACTIVO',
  observacion?: string
) {
  const result = await pool.query(
    `
    SELECT seguridad.fn_cambiar_estado_usuario_admin_api($1, $2, $3, $4) AS data
    `,
    [
      idAdmin,
      idUsuario,
      nuevoEstado,
      observacion ?? null
    ]
  );

  return result.rows[0].data;
}