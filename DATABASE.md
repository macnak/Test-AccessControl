# Database Documentation

## Overview

The Test-AccessControl application uses **SQLite** as its embedded database. This provides zero-configuration deployment, excellent performance for concurrent users (100+), and easy Docker deployment.

## Database Configuration

### Location

- Default: `./data/shopping.db`
- Configurable via `DB_PATH` environment variable
- Automatically created on first startup

### Features

- **WAL Mode**: Write-Ahead Logging enabled for better concurrency
- **Foreign Keys**: Enabled for referential integrity
- **Auto-seeding**: Automatically populates test data on first startup
- **Session Cleanup**: Expired sessions automatically cleaned on startup

## Schema

### Tables

#### 1. users

Stores user accounts for authentication and shopping.

```sql
- id: INTEGER PRIMARY KEY
- email: TEXT UNIQUE (indexed)
- password_hash: TEXT
- first_name: TEXT
- last_name: TEXT
- phone: TEXT
- role: TEXT DEFAULT 'user'
- created_at: DATETIME
```

**Seeded Data**: 150 users with realistic names and emails

#### 2. products

Product catalog for the shopping workflow.

```sql
- id: INTEGER PRIMARY KEY
- name: TEXT (indexed)
- description: TEXT
- price: REAL
- category: TEXT (indexed)
- stock: INTEGER
- image_url: TEXT
- created_at: DATETIME
```

**Seeded Data**: 75 products across Electronics, Clothing, Home & Garden categories

#### 3. sessions

Active user sessions for cookie-based authentication.

```sql
- session_id: TEXT PRIMARY KEY
- user_id: INTEGER (indexed, foreign key)
- expires_at: DATETIME (indexed)
- created_at: DATETIME
```

**Auto-cleanup**: Expired sessions removed on startup

#### 4. pending_auth

Temporary authentication requests awaiting approval.

```sql
- request_id: TEXT PRIMARY KEY
- email: TEXT (indexed)
- status: TEXT DEFAULT 'pending'
- expires_at: DATETIME (indexed)
- created_at: DATETIME
```

#### 5. cart_items

Shopping cart items for each user.

```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (indexed, foreign key)
- product_id: INTEGER (foreign key)
- quantity: INTEGER
- added_at: DATETIME
```

#### 6. orders

Customer orders.

```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (indexed, foreign key)
- status: TEXT DEFAULT 'pending'
- total_amount: REAL
- shipping_address: TEXT
- created_at: DATETIME
- updated_at: DATETIME
```

**Seeded Data**: 20 sample orders with various statuses

#### 7. order_items

Line items for each order.

```sql
- id: INTEGER PRIMARY KEY
- order_id: INTEGER (indexed, foreign key)
- product_id: INTEGER (foreign key)
- quantity: INTEGER
- price: REAL
- created_at: DATETIME
```

#### 8. payment_methods

Saved payment methods for users.

```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (indexed, foreign key)
- type: TEXT
- last_four: TEXT
- expiry_month: INTEGER
- expiry_year: INTEGER
- is_default: INTEGER DEFAULT 0
- created_at: DATETIME
```

**Seeded Data**: 30 payment methods (cards) across users

#### 9. addresses

Saved shipping addresses.

```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (indexed, foreign key)
- street: TEXT
- city: TEXT
- state: TEXT
- zip_code: TEXT
- country: TEXT
- is_default: INTEGER DEFAULT 0
- created_at: DATETIME
```

#### 10. schema_version

Tracks database schema version for migrations.

```sql
- version: INTEGER PRIMARY KEY
- applied_at: DATETIME
```

## Database Management

### Command Line Tools

The `db-manager.js` script provides easy database management:

```bash
# Seed the database with test data
npm run db:seed

# Reset database (delete and re-seed)
npm run db:reset

# Show database statistics
npm run db:stats

# Clean expired sessions
npm run db:clean-sessions

# Export user credentials to CSV
npm run db:export-users

# Delete database completely
npm run db:delete

# Show help
npm run db:help
```

### Database Statistics

Running `npm run db:stats` shows:

```
Database Statistics:
Users: 150
Products: 75
Active Sessions: X
Pending Auth Requests: X
Cart Items: X
Orders: 20
Order Items: X
Payment Methods: 30
Addresses: X
Database Size: X MB
```

### User Credentials Export

For JMeter load testing, export user credentials:

```bash
npm run db:export-users
```

Creates `users-export.csv`:

```csv
email,password,userId
user1@example.com,password123,1
user2@example.com,password123,2
...
```

Or use the API endpoint:

```bash
GET /api/cookie-session/credentials/export
```

## Auto-Seeding

### Behavior

On application startup:

1. Database is initialized if it doesn't exist
2. If database is empty (0 users), auto-seeding runs
3. Creates 150 users, 75 products, 20 sample orders, 30 payment methods
4. All users have password: `password123`

### Controlling Auto-Seed

To start with empty database:

```bash
# Delete existing database
npm run db:delete

# Start without seeding (requires code modification)
# Or seed manually later:
npm run db:seed
```

## Seed Data Details

### Users

- **Count**: 150
- **Email Format**: `user{N}@example.com` (N = 1-150)
- **Password**: `password123` (hashed with bcrypt)
- **Names**: Randomized realistic first/last names
- **Roles**: All users have role 'user'

### Products

- **Count**: 75 (25 per category)
- **Categories**:
  - Electronics (phones, laptops, cameras)
  - Clothing (shirts, pants, shoes)
  - Home & Garden (furniture, tools, decor)
- **Prices**: Randomized realistic pricing
- **Stock**: Random stock levels (10-100)

### Orders

- **Count**: 20 sample orders
- **Statuses**: Mixed (pending, processing, shipped, delivered, cancelled)
- **Users**: Orders distributed across first 20 users
- **Total Amounts**: Realistic order totals

### Payment Methods

- **Count**: 30 across users
- **Types**: Credit Card, Debit Card
- **Last Four**: Randomized 4-digit numbers
- **Expiry**: Random future dates

## Performance

### Concurrency

- **WAL Mode**: Supports multiple concurrent readers
- **Tested**: 100+ concurrent users
- **Connection Pool**: Single connection with prepared statements

### Indexes

All foreign keys and frequently queried columns are indexed:

- `users.email`
- `products.name`, `products.category`
- `sessions.user_id`, `sessions.expires_at`
- `pending_auth.email`, `pending_auth.expires_at`
- `cart_items.user_id`
- `orders.user_id`
- `order_items.order_id`
- `payment_methods.user_id`
- `addresses.user_id`

### Query Optimization

- Prepared statements prevent SQL injection
- Limit/offset pagination for large result sets
- Compound indexes on frequently joined columns

## Backup & Recovery

### Manual Backup

```bash
# Copy database file
cp ./data/shopping.db ./data/shopping.db.backup

# Or use SQLite backup command
sqlite3 ./data/shopping.db ".backup ./data/shopping.db.backup"
```

### Recovery

```bash
# Restore from backup
cp ./data/shopping.db.backup ./data/shopping.db
```

### Docker Volumes

Database persists in `./data` volume:

```bash
# Backup Docker volume
docker-compose down
cp -r ./data ./data.backup

# Restore
docker-compose down
rm -rf ./data
cp -r ./data.backup ./data
docker-compose up -d
```

## Troubleshooting

### Database Locked

If you see "database is locked" errors:

- Ensure only one application instance is running
- Check for zombie processes holding the database
- WAL mode reduces locking, but exclusive writes still lock

### Corrupted Database

```bash
# Check integrity
sqlite3 ./data/shopping.db "PRAGMA integrity_check;"

# If corrupted, reset
npm run db:delete
npm run db:seed
```

### Missing Data

```bash
# Check table counts
npm run db:stats

# Re-seed if needed
npm run db:reset
```

## Development Tips

### Direct SQL Access

```bash
# Open SQLite CLI
sqlite3 ./data/shopping.db

# Run queries
sqlite> SELECT COUNT(*) FROM users;
sqlite> SELECT * FROM products LIMIT 5;
sqlite> .tables
sqlite> .schema users
sqlite> .quit
```

### Custom Seeding

Edit [source/database/seed.ts](source/database/seed.ts) to customize:

- Number of users
- Product categories
- Sample order data
- Default passwords

### Schema Changes

1. Update [source/database/schema.sql](source/database/schema.sql)
2. Update `schema_version` table
3. Create migration script if needed
4. Reset database: `npm run db:reset`

## Security Notes

### Passwords

- All passwords hashed with bcrypt (cost factor 10)
- Test users use `password123` (change in production!)
- Never log or expose password hashes

### SQL Injection

- All queries use prepared statements
- No string concatenation in SQL
- Parameterized queries throughout

### Session Security

- Sessions expire after configured timeout
- Session IDs are cryptographically random
- Expired sessions auto-cleaned

## Environment Variables

```bash
# Database location
DB_PATH=./data

# JWT secrets (for bearer auth, not cookie sessions)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

## Production Recommendations

1. **Regular Backups**: Schedule daily database backups
2. **Monitor Size**: SQLite handles databases up to several TB, but monitor growth
3. **Session Cleanup**: Run `npm run db:clean-sessions` periodically
4. **Change Passwords**: Update default seed passwords
5. **Volume Persistence**: Ensure Docker volumes are backed up
