import { Router } from 'express';
import {
  getInvoiceByOrderController,
  sendInvoiceByEmailController
} from '../controllers/invoice.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const orderIdParamSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('ID de pedido inválido.')
  })
});

router.get(
  '/seller/orders/:orderId',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(orderIdParamSchema),
  getInvoiceByOrderController
);

router.post(
  '/seller/orders/:orderId/send-email',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(orderIdParamSchema),
  sendInvoiceByEmailController
);

export default router;