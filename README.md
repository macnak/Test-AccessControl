# Test Access Control API

A comprehensive Fastify-based TypeScript Web API server designed to test various access control mechanisms. This API is built to work with the API Annealing project, providing exhaustive coverage of authentication methods, request/response formats, and file upload capabilities.

**🐳 Docker Ready**: Easily deploy with `docker-compose up -d` - see [DOCKER.md](DOCKER.md)

## Features

- **Multiple Authentication Methods:**
  - Basic Authentication
  - API Key (header or query parameter)
  - Bearer Token
  - OAuth2
  - Cookie Session with Shopping Workflow

- **Shopping Workflow (Cookie Session):**
  - Complete e-commerce simulation for JMeter load testing
  - SQLite database with 150 test users and 300+ products
  - High stock levels (500-2000 units) for performance testing
  - Quick restock command for repeated test runs
  - User authentication with login/validate/logout
  - Product catalog with pagination and filtering
  - Shopping cart management
  - Checkout with simulated payment processing
  - Order history and tracking
  - User profile management
  - Payment method management
  - See [SHOPPING_WORKFLOW.md](SHOPPING_WORKFLOW.md) for detailed documentation

- **Database Features:**
  - Embedded SQLite database (zero configuration)
  - Auto-seeding with realistic test data
  - 300+ products across 6 categories
  - Supports 100+ concurrent users
  - Easy database management CLI
  - Quick restock for performance testing
  - Credential export for JMeter
  - See [DATABASE.md](DATABASE.md) for details

- **Multiple Content Types:**
  - JSON (application/json)
  - XML (application/xml)
  - Form Data (application/x-www-form-urlencoded)
  - Plain Text (text/plain)

- **File Upload Support:**
  - Single file upload
  - Multiple file upload
  - File upload with form fields
  - Multipart form data handling

- **OpenAPI/Swagger Documentation:**
  - Complete API documentation
  - Interactive Swagger UI
  - All endpoints and authentication methods documented

- **Docker Deployment:**
  - Production-ready Dockerfile
  - Docker Compose configuration
  - Persistent database volumes
  - Health checks included
  - See [DOCKER.md](DOCKER.md) for deployment guide

## Project Structure

```
Test-AccessControl/
├── source/
│   ├── config/
│   │   ├── app.config.ts         # Application configuration
│   │   ├── credentials.ts        # Dummy credentials for testing
│   │   └── sample-data.ts        # Sample response data
│   ├── controllers/
│   │   ├── basic-auth.controller.ts
│   │   ├── api-key.controller.ts
│   │   ├── bearer-token.controller.ts
│   │   ├── oauth2.controller.ts
│   │   ├── cookie-session.controller.ts  # Shopping workflow
│   │   ├── public.controller.ts
│   │   └── upload.controller.ts
│   ├── database/
│   │   ├── schema.sql             # Database schema
│   │   ├── database.service.ts    # Database operations
│   │   └── seed.ts                # Test data seeding
│   ├── middleware/
│   │   ├── basic-auth.middleware.ts
│   │   ├── api-key.middleware.ts
│   │   ├── bearer-token.middleware.ts
│   │   ├── cookie-session.middleware.ts
│   │   └── oauth2.middleware.ts
│   ├── routes/
│   │   ├── basic-auth.routes.ts
│   │   ├── api-key.routes.ts
│   │   ├── bearer-token.routes.ts
│   │   ├── oauth2.routes.ts
│   │   ├── cookie-session.routes.ts
│   │   ├── public.routes.ts
│   │   └── upload.routes.ts
│   ├── app.ts                    # Fastify app setup
│   └── index.ts                  # Entry point
├── scripts/
│   └── db-manager.js             # Database management CLI
├── data/
│   └── shopping.db               # SQLite database (auto-created)
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Documentation

- **[DOCKER.md](DOCKER.md)** - Docker deployment guide with compose and CLI examples
- **[DATABASE.md](DATABASE.md)** - Database schema, seeding, and management
- **[SHOPPING_WORKFLOW.md](SHOPPING_WORKFLOW.md)** - Complete shopping workflow API documentation
- **[JMETER_GUIDE.md](JMETER_GUIDE.md)** - Detailed JMeter load testing guide
- **[CREDENTIALS.md](CREDENTIALS.md)** - Test credentials reference
- **[VALIDATION_ENDPOINTS.md](VALIDATION_ENDPOINTS.md)** - Validation endpoints documentation

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Export user credentials for JMeter
curl http://localhost:3000/api/cookie-session/credentials/export > users.csv

# Database management
docker-compose exec test-accesscontrol npm run db:stats
docker-compose exec test-accesscontrol npm run db:reset

# Stop
docker-compose down
```

See [DOCKER.md](DOCKER.md) for complete deployment guide.

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Development mode (with auto-reload)
npm run dev

# Build the project
npm run build

# Production mode
npm start
```

The server will start on `http://0.0.0.0:3000` by default.

### Database Management

```bash
# Seed database with test data (150 users, 300+ products)
npm run db:seed

# Reset database (delete and re-seed)
npm run db:reset

# Restock all products for next performance test run
npm run db:restock

# Show database statistics
npm run db:stats

# Export user credentials for JMeter
npm run db:export-users

# Clean expired sessions
npm run db:clean-sessions

# Delete database completely
npm run db:delete
```

See [DATABASE.md](DATABASE.md) for complete database documentation.

## API Documentation

Once the server is running, visit the Swagger documentation at:

**http://localhost:3000/documentation**

This provides an interactive interface to explore and test all available endpoints.

## API Endpoints

### Public Endpoints (No Authentication)

- `GET /api/public/health` - Health check endpoint
- `GET /api/public/info` - API information

### Cookie Session Endpoints

See [SHOPPING_WORKFLOW.md](SHOPPING_WORKFLOW.md) for complete shopping workflow documentation.

**Authentication:**

- `POST /api/cookie-session/login` - Login with email and password
- `POST /api/cookie-session/validate` - Validate with token and code
- `POST /api/cookie-session/logout` - Logout and clear session

**Shopping Workflow:**

- `GET /api/cookie-session/shop/products` - List products with pagination
- `GET /api/cookie-session/shop/products/:id` - Get product details
- `GET /api/cookie-session/shop/cart` - Get shopping cart
- `POST /api/cookie-session/shop/cart` - Add item to cart
- `PUT /api/cookie-session/shop/cart/:productId` - Update cart item
- `DELETE /api/cookie-session/shop/cart/:productId` - Remove from cart
- `DELETE /api/cookie-session/shop/cart` - Clear cart
- `POST /api/cookie-session/shop/checkout` - Checkout and create order
- `GET /api/cookie-session/shop/orders` - Get order history
- `GET /api/cookie-session/shop/orders/:orderId` - Get order details
- `GET /api/cookie-session/shop/profile` - Get user profile
- `PUT /api/cookie-session/shop/profile` - Update user profile
- `GET /api/cookie-session/shop/payment-methods` - Get payment methods
- `POST /api/cookie-session/shop/payment-methods` - Add payment method
- `PUT /api/cookie-session/shop/payment-methods/:id` - Update payment method
- `DELETE /api/cookie-session/shop/payment-methods/:id` - Delete payment method

### Basic Auth Endpoints

All endpoints under `/api/basic-auth/*` require Basic Authentication.

**Valid Credentials:**

- Username: `admin`, Password: `admin123`
- Username: `user`, Password: `user123`
- Username: `testuser`, Password: `test@pass`

**Endpoints:**

- `GET /api/basic-auth/json` - Get JSON response
- `GET /api/basic-auth/text` - Get plain text response
- `GET /api/basic-auth/xml` - Get XML response
- `POST /api/basic-auth/json` - Post JSON data
- `POST /api/basic-auth/form` - Post form data
- `POST /api/basic-auth/xml` - Post XML data

### API Key Endpoints

All endpoints under `/api/api-key/*` require API Key authentication via `x-api-key` header or `apiKey` query parameter.

**Valid API Keys:**

- `api-key-12345-valid`
- `api-key-67890-valid`
- `api-key-abcde-valid`

**Endpoints:**

- `GET /api/api-key/json` - Get JSON response
- `GET /api/api-key/text` - Get plain text response
- `GET /api/api-key/xml` - Get XML response
- `POST /api/api-key/json` - Post JSON data
- `POST /api/api-key/form` - Post form data
- `POST /api/api-key/xml` - Post XML data

### Bearer Token Endpoints

All endpoints under `/api/bearer-token/*` require Bearer Token authentication.

**Valid Bearer Tokens:**

- `bearer-token-xyz123-valid`
- `bearer-token-abc456-valid`
- `bearer-token-def789-valid`

**Endpoints:**

- `GET /api/bearer-token/json` - Get JSON response
- `GET /api/bearer-token/text` - Get plain text response
- `GET /api/bearer-token/xml` - Get XML response
- `POST /api/bearer-token/json` - Post JSON data
- `POST /api/bearer-token/form` - Post form data
- `POST /api/bearer-token/xml` - Post XML data

### OAuth2 Endpoints

All endpoints under `/api/oauth2/*` require OAuth2 token authentication.

**Valid OAuth2 Tokens:**

- `oauth2-token-valid-12345`
- `oauth2-token-valid-67890`
- `oauth2-token-valid-abcde`

**Endpoints:**

- `GET /api/oauth2/json` - Get JSON response
- `GET /api/oauth2/text` - Get plain text response
- `GET /api/oauth2/xml` - Get XML response
- `POST /api/oauth2/json` - Post JSON data
- `POST /api/oauth2/form` - Post form data
- `POST /api/oauth2/xml` - Post XML data

### File Upload Endpoints

All endpoints under `/api/upload/*` require API Key authentication.

**Endpoints:**

- `POST /api/upload/single` - Upload a single file
- `POST /api/upload/multiple` - Upload multiple files
- `POST /api/upload/with-fields` - Upload files with additional form fields

## Testing the Shopping Workflow

A complete test script is provided to demonstrate the shopping workflow:

```bash
# Make sure the server is running first
npm run dev

# In another terminal, run the test script
./test-shopping-workflow.sh
```

This script will:

1. Login and validate session
2. Browse products with pagination
3. Add products to cart
4. Update cart quantities
5. Add payment method
6. Complete checkout
7. View order history
8. Update user profile
9. Logout

## JMeter Load Testing

For detailed JMeter load testing instructions, see [JMETER_GUIDE.md](JMETER_GUIDE.md).

Quick start:

1. Import `jmeter-users.csv` for test credentials
2. Configure HTTP Cookie Manager
3. Follow the business flow: Login → Browse → Cart → Checkout → Logout
4. Use realistic think times (2-10 seconds between actions)
5. Apply probability controllers for realistic user behavior

## Example Usage

### Basic Authentication

```bash
curl -u admin:admin123 http://localhost:3000/api/basic-auth/json
```

### API Key Authentication (Header)

```bash
curl -H "x-api-key: api-key-12345-valid" http://localhost:3000/api/api-key/json
```

### API Key Authentication (Query Parameter)

```bash
curl http://localhost:3000/api/api-key/json?apiKey=api-key-12345-valid
```

### Bearer Token Authentication

```bash
curl -H "Authorization: Bearer bearer-token-xyz123-valid" http://localhost:3000/api/bearer-token/json
```

### OAuth2 Authentication

```bash
curl -H "Authorization: Bearer oauth2-token-valid-12345" http://localhost:3000/api/oauth2/json
```

### File Upload

```bash
curl -X POST -H "x-api-key: api-key-12345-valid" \
  -F "file=@/path/to/your/file.txt" \
  http://localhost:3000/api/upload/single
```

### POST JSON Data

```bash
curl -X POST -u admin:admin123 \
  -H "Content-Type: application/json" \
  -d '{"name":"test","value":"data"}' \
  http://localhost:3000/api/basic-auth/json
```

## Testing Coverage

The API is designed to support comprehensive testing scenarios:

- **Happy Path Testing:** All valid credentials and tokens work correctly
- **Negative Testing:** Invalid credentials return proper 401 responses
- **Boundary Testing:** Test edge cases with empty values, long strings, special characters
- **Content Type Testing:** Support for JSON, XML, form data, and plain text
- **File Upload Testing:** Single and multiple file uploads with form fields

## Configuration

Environment variables can be used to configure the application:

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `LOG_LEVEL` - Logging level (default: info)

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Format code
npm run format

# Lint code
npm run lint
```

## License

MIT
