import { buildApp } from './app';
import { config } from './config/app.config';
import { getDatabase } from './database/database.service';
import { seedDatabase } from './database/seed';

async function start() {
  try {
    // Initialize database
    console.log('Initializing database...');
    const db = getDatabase();
    console.log('Database initialized');

    // Auto-seed if empty
    const userCount = db.getUserCount();
    if (userCount === 0) {
      console.log('Database is empty. Seeding with test data...');
      await seedDatabase();
    } else {
      console.log(`Database contains ${userCount} users. Skipping auto-seed.`);
    }

    // Clean up expired sessions on start
    db.cleanExpiredSessions();
    db.cleanExpiredPendingAuth();

    const app = await buildApp();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    app.log.info(`Server is running on http://${config.host}:${config.port}`);
    app.log.info(
      `Swagger documentation available at http://${config.host}:${config.port}/documentation`,
    );
    app.log.info(
      `Database statistics: Users: ${db.getUserCount()}, Products: ${db.getProductCount()}`,
    );
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
