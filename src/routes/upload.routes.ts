import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { uploadSingleImageController } from '../controllers/upload.controller';

const router = Router();

router.post(
  '/stores/logo',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  uploadImage('store-logo').single('image'),
  uploadSingleImageController
);

router.post(
  '/stores/cover',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  uploadImage('store-cover').single('image'),
  uploadSingleImageController
);

router.post(
  '/stores/label',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  uploadImage('store-label').single('image'),
  uploadSingleImageController
);

router.post(
  '/products',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  uploadImage('product').single('image'),
  uploadSingleImageController
);

export default router;