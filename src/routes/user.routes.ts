import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import {
  activateUserAdminController,
  deactivateUserAdminController,
  getAdminUsersController
} from '../controllers/user.controller';

const router = Router();

router.get(
  '/admin',
  authMiddleware,
  roleMiddleware('ADMIN'),
  getAdminUsersController
);

router.patch(
  '/admin/:id/deactivate',
  authMiddleware,
  roleMiddleware('ADMIN'),
  deactivateUserAdminController
);

router.patch(
  '/admin/:id/activate',
  authMiddleware,
  roleMiddleware('ADMIN'),
  activateUserAdminController
);

export default router;