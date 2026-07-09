import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/error.middleware';

export function uploadSingleImageController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    if (!req.file) {
      throw new AppError('No se envió ninguna imagen.', 400);
    }

    const fileUrl = `/uploads/${req.file.path.replace(/\\/g, '/').replace('uploads/', '')}`;

    res.status(201).json({
      ok: true,
      message: 'Imagen subida correctamente.',
      file: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    next(error);
  }
}