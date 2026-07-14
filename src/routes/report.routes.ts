import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import {
  getAdminReportController,
  getSellerStoreReportController
} from '../controllers/report.controller';

const router = Router();

router.get(
  '/admin',
  authMiddleware,
  roleMiddleware('ADMIN'),
  getAdminReportController
);

router.get(
  '/seller/stores/:storeId',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  getSellerStoreReportController
);

export default router;