import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import {
  generateAndSendInvoiceByOrder,
  getInvoiceByOrder
} from '../services/invoice.service';

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

export async function getInvoiceByOrderController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const orderId = getParamAsString(req, 'orderId');

    const invoice = await getInvoiceByOrder(req.user.id_usuario, orderId);

    res.json({
      ok: true,
      invoice
    });
  } catch (error) {
    next(error);
  }
}

export async function sendInvoiceByEmailController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const orderId = getParamAsString(req, 'orderId');

    const result = await generateAndSendInvoiceByOrder(
      req.user.id_usuario,
      orderId
    );

    res.json({
      ok: true,
      message: 'Factura generada y enviada correctamente.',
      result
    });
  } catch (error) {
    next(error);
  }
}