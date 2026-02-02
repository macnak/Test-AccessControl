#!/usr/bin/env node
/**
 * Database Management CLI
 * Provides commands for managing the shopping database
 */

const { getDatabase, closeDatabase } = require('../dist/database/database.service');
const { seedDatabase } = require('../dist/database/seed');
const fs = require('fs');
const path = require('path');

const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'seed':
        console.log('Seeding database...');
        await seedDatabase();
        break;

      case 'reset':
        console.log('Resetting database...');
        const db = getDatabase();
        db.resetDatabase();
        console.log('Database reset complete. Run "npm run db:seed" to populate with data.');
        break;

      case 'stats':
        console.log('Fetching database statistics...');
        const statsDb = getDatabase();
        const stats = statsDb.getDatabaseStats();
        console.log('\n=== Database Statistics ===');
        console.log(`Users:    ${stats.users}`);
        console.log(`Products: ${stats.products}`);
        console.log(`Orders:   ${stats.orders}`);
        console.log(`Sessions: ${stats.sessions}`);
        console.log('==========================\n');
        break;

      case 'clean-sessions':
        console.log('Cleaning expired sessions...');
        const cleanDb = getDatabase();
        cleanDb.cleanExpiredSessions();
        cleanDb.cleanExpiredPendingAuth();
        console.log('Expired sessions and pending auth cleaned');
        break;

      case 'export-users':
        console.log('Exporting user credentials...');
        const exportDb = getDatabase();
        const users = exportDb.getAllUsers(1000);
        const csvContent =
          'email,password,name\n' +
          users.map((u) => `${u.email},${u.password},"${u.name}"`).join('\n');

        const outputPath = path.join(process.cwd(), 'data', 'users-export.csv');
        fs.writeFileSync(outputPath, csvContent, 'utf-8');
        console.log(`✓ Exported ${users.length} users to: ${outputPath}`);
        break;

      case 'export-products':
        console.log('Exporting products...');
        const productsDb = getDatabase();
        const products = productsDb.getAllProducts();
        const productsCsv =
          'productId,name,category,price,stock\n' +
          products.map((p) => `${p.id},"${p.name}",${p.category},${p.price},${p.stock}`).join('\n');

        const productsPath = path.join(process.cwd(), 'data', 'products-export.csv');
        fs.writeFileSync(productsPath, productsCsv, 'utf-8');
        console.log(`✓ Exported ${products.length} products to: ${productsPath}`);
        break;

      case 'delete':
        console.log('Deleting database file...');
        const dataDir = process.env.DB_PATH || path.join(process.cwd(), 'data');
        const dbPath = path.join(dataDir, 'shopping.db');

        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
          console.log(`✓ Database deleted: ${dbPath}`);

          // Also delete WAL and SHM files
          const walPath = `${dbPath}-wal`;
          const shmPath = `${dbPath}-shm`;
          if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
          if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

          console.log('Database will be recreated on next start.');
        } else {
          console.log('Database file not found.');
        }
        break;

      case 'restock':
        console.log('Restocking all products...');
        const restockDb = getDatabase();
        const restocked = restockDb.restockAllProducts(500, 2000);
        console.log(`✓ Restocked ${restocked} products to high levels (500-2000 stock each)`);
        console.log('Products are ready for performance testing!');
        break;

      case 'help':
      default:
        console.log(`
Database Management Commands:

  npm run db:seed            - Seed database with test data (150 users, 300+ products)
  npm run db:reset           - Reset database (delete all data but keep schema)
  npm run db:restock         - Restock all products to high levels (500-2000 each)
  npm run db:stats           - Show database statistics
  npm run db:clean-sessions  - Clean expired sessions and pending auth
  npm run db:export-users    - Export user credentials to CSV
  npm run db:export-products - Export products to CSV (for JMeter testing)
  npm run db:delete          - Delete database file (fresh start)
  npm run db:help            - Show this help message

Environment Variables:
  DB_PATH                    - Custom database path (default: ./data)

Examples:
  npm run db:seed
  npm run db:export-products  # Use in JMeter for cart/purchase testing
  npm run db:restock          # Run between performance tests
  DB_PATH=/custom/path npm run db:stats
        `);
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

main();
