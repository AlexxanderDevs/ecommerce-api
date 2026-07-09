import app from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/database';

async function bootstrap(): Promise<void> {
  try {
    await testDatabaseConnection();

    app.listen(env.PORT, () => {
      console.log(`API ejecutándose en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();