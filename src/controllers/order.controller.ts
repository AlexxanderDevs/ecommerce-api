import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import {
  cancelOrder,
  confirmOrder,
  createOrder,
  deliverOrder,
  getSellerOrderDetail,
  getSellerDashboardByStore,
  getSellerOrdersByStore,
  markWhatsAppSent,
  getCustomerOrderDetail,
  getCustomerOrders
} from '../services/order.service';

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

export async function createOrderController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idUsuarioCliente = req.user?.id_usuario ?? null;

    const order = await createOrder(idUsuarioCliente, req.body);

    res.status(201).json({
      ok: true,
      message: 'Pedido creado correctamente.',
      order
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerOrdersByStoreController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const storeId = getParamAsString(req, 'storeId');

    const orders = await getSellerOrdersByStore(req.user.id_usuario, storeId);

    res.json({
      ok: true,
      orders
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerOrderDetailController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const orderId = getParamAsString(req, 'id');

    const order = await getSellerOrderDetail(req.user.id_usuario, orderId);

    res.json({
      ok: true,
      order
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmOrderController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const orderId = getParamAsString(req, 'id');

    const order = await confirmOrder(
      req.user.id_usuario,
      orderId,
      req.body?.observacion
    );

    res.json({
      ok: true,
      message: 'Pedido confirmado correctamente.',
      order
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrderController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const orderId = getParamAsString(req, 'id');

    const order = await cancelOrder(
      req.user.id_usuario,
      orderId,
      req.body?.observacion
    );

    res.json({
      ok: true,
      message: 'Pedido cancelado correctamente.',
      order
    });
  } catch (error) {
    next(error);
  }
}

export async function deliverOrderController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const orderId = getParamAsString(req, 'id');

    const order = await deliverOrder(
      req.user.id_usuario,
      orderId,
      req.body?.observacion
    );

    res.json({
      ok: true,
      message: 'Pedido marcado como entregado.',
      order
    });
  } catch (error) {
    next(error);
  }
}

export async function markWhatsAppSentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orderId = getParamAsString(req, 'id');

    const order = await markWhatsAppSent(orderId);

    res.json({
      ok: true,
      message: 'Pedido marcado como enviado por WhatsApp.',
      order
    });
  } catch (error) {
    next(error);
  }
}
export async function getSellerDashboardByStoreController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const storeId = getParamAsString(req, 'storeId');

    const dashboard = await getSellerDashboardByStore(
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

export async function getCustomerOrdersController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const orders = await getCustomerOrders(req.user.id_usuario);

    res.json({
      ok: true,
      orders
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerOrderDetailController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const orderId = getParamAsString(req, 'id');

    const order = await getCustomerOrderDetail(
      req.user.id_usuario,
      orderId
    );

    res.json({
      ok: true,
      order
    });
  } catch (error) {
    next(error);
  }
}