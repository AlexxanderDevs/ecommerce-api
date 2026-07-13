import { Router } from 'express';
import {
  cancelOrderController,
  confirmOrderController,
  createOrderController,
  deliverOrderController,
  getSellerOrderDetailController,
  getSellerOrdersByStoreController,
  getSellerDashboardByStoreController,
  markWhatsAppSentController
} from '../controllers/order.controller';

import {
  authMiddleware,
  optionalAuthMiddleware
} from '../middlewares/auth.middleware';

import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

import {
  createOrderSchema,
  orderActionSchema,
  orderIdParamSchema,
  storeIdParamSchema
} from '../validators/order.validator';

const router = Router();

router.post(
  '/',
  optionalAuthMiddleware,
  validate(createOrderSchema),
  createOrderController
);

router.patch(
  '/:id/whatsapp-sent',
  validate(orderIdParamSchema),
  markWhatsAppSentController
);

router.get(
  '/seller/stores/:storeId/dashboard',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  getSellerDashboardByStoreController
);

router.get(
  '/seller/stores/:storeId',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(storeIdParamSchema),
  getSellerOrdersByStoreController
);

router.get(
  '/seller/:id',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(orderIdParamSchema),
  getSellerOrderDetailController
);

router.post(
  '/seller/:id/confirm',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(orderActionSchema),
  confirmOrderController
);

router.post(
  '/seller/:id/cancel',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(orderActionSchema),
  cancelOrderController
);

router.post(
  '/seller/:id/deliver',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(orderActionSchema),
  deliverOrderController
);

export default router;