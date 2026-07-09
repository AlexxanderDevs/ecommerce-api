import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from './error.middleware';

type UploadFolder = 'store-logo' | 'store-cover' | 'store-label' | 'product';

const folderMap: Record<UploadFolder, string> = {
  'store-logo': 'uploads/stores/logos',
  'store-cover': 'uploads/stores/covers',
  'store-label': 'uploads/stores/labels',
  product: 'uploads/products'
};

function ensureFolderExists(folder: string): void {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

function createStorage(uploadFolder: UploadFolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = folderMap[uploadFolder];
      ensureFolderExists(folder);
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, filename);
    }
  });
}

function imageFileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new AppError('Solo se permiten imágenes JPG, PNG o WEBP.', 400));
    return;
  }

  cb(null, true);
}

export function uploadImage(uploadFolder: UploadFolder) {
  return multer({
    storage: createStorage(uploadFolder),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024
    }
  });
}