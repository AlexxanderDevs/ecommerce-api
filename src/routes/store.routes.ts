import { Router } from 'express';
import {
  approveStoreController,
  createStoreController,
  getAdminNotificationsController,
  getMyStoresController,
  getPendingStoresController,
  getPublicStoresController,
  markNotificationAsReadController,
  rejectStoreController,
  getAdminDashboardController
} from '../controllers/store.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createStoreSchema,
  notificationIdParamSchema,
  storeIdParamSchema
} from '../validators/store.validator';

const router = Router();

/*
|--------------------------------------------------------------------------
| Rutas públicas
|--------------------------------------------------------------------------
*/

router.get('/public', getPublicStoresController);

/*
|--------------------------------------------------------------------------
| Rutas del vendedor
|--------------------------------------------------------------------------
*/

router.post(
  '/',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(createStoreSchema),
  createStoreController
);

router.get(
  '/my',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  getMyStoresController
);

/*
|--------------------------------------------------------------------------
| Rutas del administrador
|--------------------------------------------------------------------------
*/

router.get(
  '/admin/pending',
  authMiddleware,
  roleMiddleware('ADMIN'),
  getPendingStoresController
);

router.get(
  '/admin/dashboard',
  authMiddleware,
  roleMiddleware('ADMIN'),
  getAdminDashboardController
);


router.post(
  '/admin/:id/approve',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(storeIdParamSchema),
  approveStoreController
);

router.post(
  '/admin/:id/reject',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(storeIdParamSchema),
  rejectStoreController
);

router.get(
  '/admin/notifications',
  authMiddleware,
  roleMiddleware('ADMIN'),
  getAdminNotificationsController
);

router.patch(
  '/admin/notifications/:id/read',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(notificationIdParamSchema),
  markNotificationAsReadController
);


export default router;