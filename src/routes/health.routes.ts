import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW() AS fecha_servidor');

    res.json({
      ok: true,
      message: 'API funcionando correctamente',
      database: 'PostgreSQL conectado',
      fecha_servidor: result.rows[0].fecha_servidor
    });
  } catch (error) {
    next(error);
  }
});

export default router;