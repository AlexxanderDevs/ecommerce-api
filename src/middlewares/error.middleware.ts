import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  res.status(statusCode).json({
    ok: false,
    message: error.message || 'Error interno del servidor'
  });
}