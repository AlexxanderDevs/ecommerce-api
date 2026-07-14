import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import {
  changeUserStatusAdmin,
  getAdminUsers
} from '../services/user.service';

function getParamAsString(req: Request, paramName: string): string {
  const value = req.params[paramName];

  if (Array.isArray(value)) {
    return value[0];
  }

  if (!value || typeof value !== 'string') {
    throw new AppError(`Parámetro inválido: ${paramName}`, 400);
  }

  return value;
}

export async function getAdminUsersController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const users = await getAdminUsers(req.user.id_usuario);

    res.json({
      ok: true,
      users
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateUserAdminController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const userId = getParamAsString(req, 'id');

    const user = await changeUserStatusAdmin(
      req.user.id_usuario,
      userId,
      'INACTIVO',
      req.body?.observacion
    );

    res.json({
      ok: true,
      message: 'Usuario desactivado correctamente.',
      user
    });
  } catch (error) {
    next(error);
  }
}

export async function activateUserAdminController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const userId = getParamAsString(req, 'id');

    const user = await changeUserStatusAdmin(
      req.user.id_usuario,
      userId,
      'ACTIVO',
      req.body?.observacion
    );

    res.json({
      ok: true,
      message: 'Usuario activado correctamente.',
      user
    });
  } catch (error) {
    next(error);
  }
}