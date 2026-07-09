import { Router } from 'express';
import {
  login,
  logout,
  me,
  refresh,
  registerCustomer,
  registerSeller
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register/customer', validate(registerSchema), registerCustomer);

router.post('/register/seller', validate(registerSchema), registerSeller);

router.post('/login', validate(loginSchema), login);

router.post('/refresh', refresh);

router.post('/logout', logout);

router.get('/me', authMiddleware, me);

export default router;