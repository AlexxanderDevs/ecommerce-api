import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export async function testDatabaseConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT NOW() AS fecha_servidor');
    console.log('PostgreSQL conectado:', result.rows[0].fecha_servidor);
  } finally {
    client.release();
  }
}