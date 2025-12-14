import { buildApp } from './app';
import { config } from './config/app.config';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    app.log.info(`Server is running on http://${config.host}:${config.port}`);
    app.log.info(
      `Swagger documentation available at http://${config.host}:${config.port}/documentation`,
    );
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
