# JMeter CSV Data Set Configuration

## Overview

This guide shows how to use the exported CSV files in JMeter for realistic performance testing of the shopping workflow.

## Exporting Data

### Export User Credentials

```bash
# Via CLI
npm run db:export-users

# Via API
curl http://localhost:3000/api/cookie-session/credentials/export > users.csv
```

**Output:** `data/users-export.csv`

```csv
email,password,name
user1@example.com,password123,"Michelle Moore"
user2@example.com,password123,"Thomas Brown"
...
```

### Export Product Catalog

```bash
# Via CLI
npm run db:export-products

# Via API
curl http://localhost:3000/api/cookie-session/products/export > products.csv
```

**Output:** `data/products-export.csv`

```csv
productId,name,category,price,stock
1,"Premium Wireless Headphones",Electronics,299.99,1523
2,"Classic Bluetooth Speaker v1",Electronics,89.99,1847
...
```

## JMeter Configuration

### 1. User Credentials CSV Data Set

**Add to Test Plan or Thread Group:**

1. Right-click → Add → Config Element → CSV Data Set Config
2. Configure:
   - **Filename:** `${__P(dataDir,.)}/data/users-export.csv`
   - **File encoding:** UTF-8
   - **Variable Names:** `email,password,name`
   - **Delimiter:** `,` (comma)
   - **Recycle on EOF:** True
   - **Stop thread on EOF:** False
   - **Sharing mode:** All threads

**Usage in HTTP Request:**

```json
{
  "email": "${email}",
  "password": "${password}"
}
```

### 2. Products CSV Data Set

**Add to Test Plan or Thread Group:**

1. Right-click → Add → Config Element → CSV Data Set Config
2. Configure:
   - **Filename:** `${__P(dataDir,.)}/data/products-export.csv`
   - **File encoding:** UTF-8
   - **Variable Names:** `productId,name,category,price,stock`
   - **Delimiter:** `,` (comma)
   - **Recycle on EOF:** True
   - **Stop thread on EOF:** False
   - **Sharing mode:** All threads

**Usage in HTTP Request (Add to Cart):**

```json
{
  "productId": ${productId},
  "quantity": ${__Random(1,5)}
}
```

## Complete Shopping Workflow Example

### Thread Group Setup

1. **Users:** 100 threads (one per user)
2. **Ramp-up:** 10 seconds
3. **Loop Count:** 5

### CSV Data Sets

- **users-export.csv** → Variables: `email,password,name`
- **products-export.csv** → Variables: `productId,name,category,price,stock`

### HTTP Request Sequence

#### 1. Login

```
POST /api/cookie-session/login
Body:
{
  "email": "${email}",
  "password": "${password}"
}
```

#### 2. Validate Session

```
POST /api/cookie-session/validate
Body:
{
  "token": "${token}",
  "code": "${code}"
}
```

#### 3. Browse Products

```
GET /api/cookie-session/shop/products?page=1&limit=20
```

#### 4. Add Random Products to Cart

```
POST /api/cookie-session/shop/cart
Body:
{
  "productId": ${productId},
  "quantity": ${__Random(1,3)}
}

# Repeat 2-5 times with different products
```

#### 5. View Cart

```
GET /api/cookie-session/shop/cart
```

#### 6. Checkout

```
POST /api/cookie-session/shop/checkout
Body:
{
  "paymentMethodId": "1",
  "shippingAddress": "123 Test St, Test City, TC 12345"
}
```

#### 7. View Orders

```
GET /api/cookie-session/shop/orders
```

#### 8. Logout

```
POST /api/cookie-session/logout
Body: {}
```

## Advanced Tips

### Random Product Selection

Use JMeter functions to randomize product selection:

```
${__Random(1,300)}  # Random product ID between 1-300
```

Or use multiple CSV Data Sets with different configurations:

- **Electronics only:** Filter products-export.csv to Electronics category
- **Random selection:** Use "Random order" in CSV Data Set Config

### Unique Users per Thread

Set CSV Data Set Config sharing mode to:

- **Current thread group** - Each thread group gets unique users
- **Current thread** - Each thread (user) gets unique credentials

### Load Testing Scenarios

**Scenario 1: Browse-Heavy**

- 70% browsing products
- 20% adding to cart
- 10% checkout

**Scenario 2: Purchase-Heavy**

- 30% browsing products
- 40% adding to cart
- 30% checkout

**Scenario 3: Mixed Workflow**

- Login → Browse → Add 3-5 items → View Cart → Checkout → View Orders → Logout

## Performance Testing Workflow

### Initial Setup

```bash
# 1. Reset database and seed with fresh data
npm run db:reset
npm run db:seed

# 2. Export CSV files
npm run db:export-users
npm run db:export-products

# 3. Copy CSVs to JMeter directory (or use absolute paths)
cp data/*.csv /path/to/jmeter/testdata/
```

### Between Test Runs

```bash
# Quick restock (preserves users and orders)
npm run db:restock

# Re-export products if needed (stock levels updated)
npm run db:export-products
```

### Full Reset

```bash
# Complete reset and re-seed
npm run db:reset
npm run db:seed
npm run db:export-users
npm run db:export-products
```

## Data Volumes

- **Users:** 150 unique accounts
- **Products:** 300+ items across 6 categories
- **Stock Levels:** 500-2000 units per product

**Recommendation:**

- For 100 concurrent users: Use all 150 users with recycling
- For 500+ concurrent users: Consider generating more users or using recycling

## Troubleshooting

### Products Out of Stock

**Problem:** Products run out of stock during testing

**Solution:**

```bash
npm run db:restock  # Restocks all products to 500-2000 units
```

### CSV Not Found

**Problem:** JMeter can't find CSV files

**Solution:**

- Use absolute paths in CSV Data Set Config
- Or set `dataDir` property: `jmeter -JdataDir=/full/path/to/project`

### Duplicate User Logins

**Problem:** Multiple threads using same user

**Solution:**

- Set CSV sharing mode to "Current thread"
- Ensure you have enough users in CSV (150 users for 100 threads)

## Example JMeter Command

```bash
jmeter -n \
  -t shopping-workflow-test.jmx \
  -l results.jtl \
  -e -o report \
  -JdataDir=/path/to/Test-AccessControl \
  -Jusers=100 \
  -Jrampup=30 \
  -Jloops=10
```

## API Endpoints for Export

Both exports are available via API for automation:

```bash
# Users
curl http://localhost:3000/api/cookie-session/credentials/export > users.csv

# Products
curl http://localhost:3000/api/cookie-session/products/export > products.csv
```

This allows for automated test data preparation in CI/CD pipelines.
