import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import {
  getAdminReport,
  getSellerStoreReport
} from '../services/report.service';

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

function getQueryAsString(req: Request, queryName: string): string | null {
  const value = req.query[queryName];

  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return String(value[0]);
  }

  return String(value);
}

export async function getAdminReportController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const report = await getAdminReport(req.user.id_usuario, {
      startDate: getQueryAsString(req, 'startDate'),
      endDate: getQueryAsString(req, 'endDate'),
      storeId: getQueryAsString(req, 'storeId')
    });

    res.json({
      ok: true,
      report
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerStoreReportController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const storeId = getParamAsString(req, 'storeId');

    const report = await getSellerStoreReport(
      req.user.id_usuario,
      storeId,
      {
        startDate: getQueryAsString(req, 'startDate'),
        endDate: getQueryAsString(req, 'endDate')
      }
    );

    res.json({
      ok: true,
      report
    });
  } catch (error) {
    next(error);
  }
}