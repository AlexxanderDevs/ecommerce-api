import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import storeRoutes from './routes/store.routes';
import path from 'path';
import uploadRoutes from './routes/upload.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import invoiceRoutes from './routes/invoice.routes';
import userRoutes from './routes/user.routes';

import { env } from './config/env';
import healthRoutes from './routes/health.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.'
  }
});


app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);

if (env.NODE_ENV !== 'development') {
  app.use(limiter);
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API Ecommerce Multi-Tienda'
  });
});



app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/catalog', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);


export default app;