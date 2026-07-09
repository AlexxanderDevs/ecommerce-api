import { NextFunction, Response } from 'express';
import { AppError } from './error.middleware';
import { AuthenticatedRequest } from './auth.middleware';

export function roleMiddleware(...allowedRoles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      next(new AppError('Usuario no autenticado.', 401));
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      next(new AppError('No tienes permisos para realizar esta acción.', 403));
      return;
    }

    next();
  };
}