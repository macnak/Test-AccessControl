# Test Access Control API

A comprehensive Fastify-based TypeScript Web API server designed to test various access control mechanisms. This API is built to work with the API Annealing project, providing exhaustive coverage of authentication methods, request/response formats, and file upload capabilities.

## Features

- **Multiple Authentication Methods:**
  - Basic Authentication
  - API Key (header or query parameter)
  - Bearer Token
  - OAuth2

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
│   │   ├── public.controller.ts
│   │   └── upload.controller.ts
│   ├── middleware/
│   │   ├── basic-auth.middleware.ts
│   │   ├── api-key.middleware.ts
│   │   ├── bearer-token.middleware.ts
│   │   └── oauth2.middleware.ts
│   ├── routes/
│   │   ├── basic-auth.routes.ts
│   │   ├── api-key.routes.ts
│   │   ├── bearer-token.routes.ts
│   │   ├── oauth2.routes.ts
│   │   ├── public.routes.ts
│   │   └── upload.routes.ts
│   ├── app.ts                    # Fastify app setup
│   └── index.ts                  # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Build the project
npm run build

# Production mode
npm start
```

The server will start on `http://0.0.0.0:3000` by default.

## API Documentation

Once the server is running, visit the Swagger documentation at:

**http://localhost:3000/documentation**

This provides an interactive interface to explore and test all available endpoints.

## API Endpoints

### Public Endpoints (No Authentication)

- `GET /api/public/health` - Health check endpoint
- `GET /api/public/info` - API information

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
