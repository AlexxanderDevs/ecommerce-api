import { CookieOptions, Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUserWithRole
} from '../services/auth.service';
import { AppError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    ...refreshCookieOptions,
    maxAge: undefined
  });
}

export async function registerCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = await registerUserWithRole(
      req.body,
      'CLIENTE',
      req.headers['user-agent'],
      req.ip
    );

    setRefreshCookie(res, auth.refreshToken);

    res.status(201).json({
      ok: true,
      message: 'Cliente registrado correctamente.',
      user: auth.user,
      accessToken: auth.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function registerSeller(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = await registerUserWithRole(
      req.body,
      'VENDEDOR',
      req.headers['user-agent'],
      req.ip
    );

    setRefreshCookie(res, auth.refreshToken);

    res.status(201).json({
      ok: true,
      message: 'Vendedor registrado correctamente.',
      user: auth.user,
      accessToken: auth.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = await loginUser(
      req.body,
      req.headers['user-agent'],
      req.ip
    );

    setRefreshCookie(res, auth.refreshToken);

    res.json({
      ok: true,
      message: 'Inicio de sesión correcto.',
      user: auth.user,
      accessToken: auth.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token no enviado.', 401);
    }

    const auth = await refreshSession(
      refreshToken,
      req.headers['user-agent'],
      req.ip
    );

    setRefreshCookie(res, auth.refreshToken);

    res.json({
      ok: true,
      message: 'Sesión renovada correctamente.',
      user: auth.user,
      accessToken: auth.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    clearRefreshCookie(res);

    res.json({
      ok: true,
      message: 'Sesión cerrada correctamente.'
    });
  } catch (error) {
    next(error);
  }
}

export function me(
  req: AuthenticatedRequest,
  res: Response
): void {
  res.json({
    ok: true,
    user: req.user
  });
}