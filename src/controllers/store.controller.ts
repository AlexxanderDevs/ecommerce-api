import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  approveStore,
  createStore,
  getAdminNotifications,
  getMyStores,
  getPendingStores,
  getPublicStores,
  markNotificationAsRead,
  rejectStore,
  getAdminDashboard
} from '../services/store.service';
import { AppError } from '../middlewares/error.middleware';

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

export async function createStoreController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const store = await createStore(req.user.id_usuario, req.body);

    res.status(201).json({
      ok: true,
      message: 'Solicitud de tienda creada correctamente. Queda pendiente de aprobación.',
      store
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyStoresController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const stores = await getMyStores(req.user.id_usuario);

    res.json({
      ok: true,
      stores
    });
  } catch (error) {
    next(error);
  }
}

export async function getPendingStoresController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stores = await getPendingStores();

    res.json({
      ok: true,
      stores
    });
  } catch (error) {
    next(error);
  }
}

export async function approveStoreController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const idTienda = getParamAsString(req, 'id');

    const store = await approveStore(
      idTienda,
      req.user.id_usuario,
      req.body?.observacion
    );

    res.json({
      ok: true,
      message: 'Tienda aprobada correctamente.',
      store
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectStoreController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const idTienda = getParamAsString(req, 'id');

    const store = await rejectStore(
      idTienda,
      req.user.id_usuario,
      req.body?.observacion
    );

    res.json({
      ok: true,
      message: 'Tienda rechazada correctamente.',
      store
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notifications = await getAdminNotifications();

    res.json({
      ok: true,
      notifications
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idNotificacion = getParamAsString(req, 'id');

    await markNotificationAsRead(idNotificacion);

    res.json({
      ok: true,
      message: 'Notificación marcada como leída.'
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicStoresController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stores = await getPublicStores();

    res.json({
      ok: true,
      stores
    });
  } catch (error) {
    next(error);
  }
}
// Admin dashboard controller
export async function getAdminDashboardController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const rawStoreId = req.query.storeId;
    const storeId =
      typeof rawStoreId === 'string' && rawStoreId.trim().length > 0
        ? rawStoreId
        : null;

    const dashboard = await getAdminDashboard(
      req.user.id_usuario,
      storeId
    );

    res.json({
      ok: true,
      dashboard
    });
  } catch (error) {
    next(error);
  }
}