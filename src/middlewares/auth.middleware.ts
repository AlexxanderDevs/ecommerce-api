import { NextFunction, Request, Response } from 'express';
import { AppError } from './error.middleware';
import { AuthTokenPayload, verifyAccessToken } from '../utils/jwt.util';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AppError('Token de acceso no enviado.', 401);
    }

    const token = authorization.split(' ')[1];
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    next(new AppError('Token inválido o expirado.', 401));
  }
}

export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authorization.split(' ')[1];
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    next(new AppError('Token inválido o expirado.', 401));
  }
}