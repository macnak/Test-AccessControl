# Validation Endpoints Documentation

This document describes the comprehensive validation endpoints added to the Cookie Session authentication path. These endpoints are designed for testing API tools with various parameter types, constraints, and validation rules.

## Authentication

All validation endpoints require Cookie Session authentication. Follow these steps:

1. **Login**: `POST /api/cookie-session/login`
2. **Validate**: `POST /api/cookie-session/validate` (receive session cookie)
3. Access validation endpoints with the session cookie

## GET Validation Endpoints

### 1. Date Parameter Validation

**Endpoint**: `GET /api/cookie-session/validate/dates`

Tests various date format validations in query parameters.

**Query Parameters**:

- `isoDate` (string, format: date-time): ISO 8601 date-time format (e.g., `2024-12-21T10:30:00Z`)
- `dateOnly` (string, format: date): Date only format (e.g., `2024-12-21`)
- `timestamp` (integer, min: 0): Unix timestamp in seconds
- `customFormat` (string, pattern: `MM/DD/YYYY`): Custom date format (e.g., `12/21/2024`)

**Example**:

```bash
GET /api/cookie-session/validate/dates?isoDate=2024-12-21T10:30:00Z&dateOnly=2024-12-21&timestamp=1734780600&customFormat=12/21/2024
```

**Response**:

```json
{
  "success": true,
  "received": {
    "isoDate": "2024-12-21T10:30:00Z",
    "dateOnly": "2024-12-21",
    "timestamp": 1734780600,
    "customFormat": "12/21/2024"
  },
  "parsed": {
    "isoDate": {
      "original": "2024-12-21T10:30:00Z",
      "parsed": "2024-12-21T10:30:00.000Z",
      "valid": true
    },
    ...
  }
}
```

---

### 2. Number Parameter Validation

**Endpoint**: `GET /api/cookie-session/validate/numbers`

Tests number constraints and types in query parameters.

**Query Parameters**:

- `integer` (integer): Standard integer
- `positiveInt` (integer, min: 1): Positive integer (>= 1)
- `rangeInt` (integer, min: 1, max: 100): Integer between 1 and 100
- `decimal` (number): Decimal number
- `percentage` (number, min: 0, max: 100, multipleOf: 0.01): Percentage with 2 decimal places

**Example**:

```bash
GET /api/cookie-session/validate/numbers?integer=42&positiveInt=10&rangeInt=50&decimal=3.14159&percentage=15.50
```

**Response**:

```json
{
  "success": true,
  "received": {
    "integer": 42,
    "positiveInt": 10,
    "rangeInt": 50,
    "decimal": 3.14159,
    "percentage": 15.5
  },
  "types": {
    "integer": {
      "value": 42,
      "type": "number",
      "isInteger": true
    },
    ...
  }
}
```

---

### 3. UUID Validation

**Endpoint**: `GET /api/cookie-session/validate/uuid/:id`

Tests UUID format validation in path and query parameters.

**Path Parameters**:

- `id` (string, format: uuid, required): UUID v4 format

**Query Parameters**:

- `correlationId` (string, format: uuid, optional): Optional correlation UUID

**Example**:

```bash
GET /api/cookie-session/validate/uuid/550e8400-e29b-41d4-a716-446655440000?correlationId=123e4567-e89b-12d3-a456-426614174000
```

**Response**:

```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "correlationId": "123e4567-e89b-12d3-a456-426614174000",
  "isValidUuid": true,
  "isValidCorrelationId": true
}
```

---

### 4. Enum Validation

**Endpoint**: `GET /api/cookie-session/validate/enums`

Tests enum validation for both string and integer types.

**Query Parameters**:

- `status` (string, enum): One of `pending`, `active`, `inactive`, `archived`
- `priority` (integer, enum): One of `1`, `2`, `3`, `4`, `5`
- `color` (string, enum): One of `red`, `green`, `blue`, `yellow`

**Example**:

```bash
GET /api/cookie-session/validate/enums?status=active&priority=3&color=blue
```

**Response**:

```json
{
  "success": true,
  "received": {
    "status": "active",
    "priority": 3,
    "color": "blue"
  }
}
```

---

### 5. String Constraints Validation

**Endpoint**: `GET /api/cookie-session/validate/constraints`

Tests string constraints including length, pattern, and format.

**Query Parameters**:

- `email` (string, format: email): Email address
- `username` (string, minLength: 3, maxLength: 20, pattern: alphanumeric with `_` and `-`): Username
- `zipCode` (string, pattern: US ZIP): US ZIP code (5 or 9 digits)
- `url` (string, format: uri): Valid URL

**Example**:

```bash
GET /api/cookie-session/validate/constraints?email=test@example.com&username=john_doe&zipCode=12345-6789&url=https://example.com
```

**Response**:

```json
{
  "success": true,
  "received": {
    "email": "test@example.com",
    "username": "john_doe",
    "zipCode": "12345-6789",
    "url": "https://example.com"
  },
  "validated": {
    "email": { "value": "test@example.com", "valid": true },
    "username": { "value": "john_doe", "valid": true, "length": 8 },
    ...
  }
}
```

---

### 6. Array Parameter Validation

**Endpoint**: `GET /api/cookie-session/validate/arrays`

Tests array parameter validation with constraints.

**Query Parameters**:

- `tags` (array of strings, minItems: 1, maxItems: 10): Array of tags (1-10 items)
- `ids` (array of integers, uniqueItems: true): Array of unique integer IDs

**Example**:

```bash
GET /api/cookie-session/validate/arrays?tags=api&tags=testing&tags=validation&ids=1&ids=2&ids=3
```

**Response**:

```json
{
  "success": true,
  "received": {
    "tags": ["api", "testing", "validation"],
    "ids": [1, 2, 3]
  },
  "counts": {
    "tags": { "count": 3, "items": ["api", "testing", "validation"] },
    "ids": { "count": 3, "uniqueCount": 3, "items": [1, 2, 3] }
  }
}
```

---

## POST Validation Endpoints

### 7. Date Validation (POST)

**Endpoint**: `POST /api/cookie-session/validate/dates`

Tests date validation in request body.

**Request Body**:

```json
{
  "eventDate": "2024-12-25T00:00:00Z", // required, ISO 8601
  "startDate": "2024-12-21", // optional, date only
  "endDate": "2024-12-31", // optional, date only
  "timestamp": 1735084800 // optional, Unix timestamp
}
```

**Response**:

```json
{
  "success": true,
  "received": { ... },
  "parsed": {
    "eventDate": {
      "original": "2024-12-25T00:00:00Z",
      "parsed": "2024-12-25T00:00:00.000Z",
      "dayOfWeek": "Wednesday"
    },
    "dateRange": {
      "start": "2024-12-21T00:00:00.000Z",
      "end": "2024-12-31T00:00:00.000Z",
      "durationDays": 10
    }
  }
}
```

---

### 8. Number Validation (POST)

**Endpoint**: `POST /api/cookie-session/validate/numbers`

Tests number validation with business logic calculations.

**Request Body**:

```json
{
  "quantity": 5, // required, integer, 1-1000
  "price": 29.99, // required, number, > 0
  "discount": 10, // optional, number, 0-100, multipleOf 0.5
  "rating": 4.5 // optional, number, 0-5, multipleOf 0.1
}
```

**Response**:

```json
{
  "success": true,
  "data": { ... },
  "calculated": {
    "subtotal": 149.95,
    "discountAmount": 14.995,
    "total": 134.96,
    "averageRating": 4.5
  }
}
```

---

### 9. Complex Object Validation (POST)

**Endpoint**: `POST /api/cookie-session/validate/complex`

Tests nested object validation with multiple constraints.

**Request Body**:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000", // required, UUID
  "profile": {
    // required object
    "name": "John Doe", // required, 2-100 chars
    "email": "john@example.com", // required, email format
    "age": 30, // optional, 18-120
    "status": "active" // optional, enum
  },
  "preferences": {
    // optional object
    "notifications": true,
    "theme": "dark" // enum: light, dark, auto
  },
  "tags": ["developer", "api-tester"] // optional, max 20 items
}
```

**Response**:

```json
{
  "success": true,
  "data": { ... },
  "validated": true,
  "metadata": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "profileComplete": true,
    "hasPreferences": true,
    "tagCount": 2
  }
}
```

---

### 10. Enum Validation (POST)

**Endpoint**: `POST /api/cookie-session/validate/enums`

Tests enum validation in POST body.

**Request Body**:

```json
{
  "status": "approved", // required, enum
  "priority": 2, // required, integer enum (1-5)
  "category": "feature", // optional, enum
  "severity": "medium" // optional, enum
}
```

**Response**:

```json
{
  "success": true,
  "received": {
    "status": "approved",
    "priority": 2,
    "category": "feature",
    "severity": "medium"
  }
}
```

---

## XML Validation Endpoints

### 11. XML POST Validation

**Endpoint**: `POST /api/cookie-session/validate/xml`

Tests XML body validation.

**Content-Type**: `application/xml` or `text/xml`

**Request Body** (XML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<request>
  <user>
    <name>John Doe</name>
    <email>john@example.com</email>
  </user>
  <data>
    <item id="1">Test Item</item>
  </data>
</request>
```

**Response**:

```json
{
  "success": true,
  "parsed": {
    "receivedLength": 183,
    "contentType": "application/xml",
    "isXml": true,
    "rootElement": "request"
  },
  "validated": true
}
```

---

### 12. XML GET Response

**Endpoint**: `GET /api/cookie-session/validate/xml`

Tests XML response generation with query parameters.

**Query Parameters**:

- `format` (string, enum: `compact`, `pretty`, default: `pretty`): XML formatting
- `includeMetadata` (boolean, default: false): Include metadata in response
- `recordId` (string, format: uuid): Record ID to include

**Example**:

```bash
GET /api/cookie-session/validate/xml?format=pretty&includeMetadata=true&recordId=550e8400-e29b-41d4-a716-446655440000
```

**Response** (XML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <metadata>
    <timestamp>2024-12-21T10:30:00.000Z</timestamp>
    <version>1.0</version>
  </metadata>
  <record id="550e8400-e29b-41d4-a716-446655440000">
    <name>Sample Record</name>
    <status>active</status>
  </record>
</response>
```

---

## Validation Failure Examples

### Invalid UUID

```bash
GET /api/cookie-session/validate/uuid/not-a-uuid
```

Returns 400 Bad Request with validation error.

### Invalid Enum Value

```bash
GET /api/cookie-session/validate/enums?status=invalid-status&priority=10
```

Returns 400 Bad Request with validation error.

### Number Out of Range

```bash
GET /api/cookie-session/validate/numbers?rangeInt=200
```

Returns 400 Bad Request with validation error (max: 100).

### Invalid Date Format

```bash
GET /api/cookie-session/validate/dates?customFormat=2024-12-21
```

Returns 400 Bad Request with validation error (expected MM/DD/YYYY).

---

## Testing

Use the provided test script to test all validation endpoints:

```bash
chmod +x test-validation.sh
./test-validation.sh
```

This will execute all validation tests and show the responses.

---

## Use Cases for API Testing Tools

These endpoints are specifically designed to test API tools with:

1. **Date Handling**: Multiple date formats, parsing, and timezone handling
2. **Number Validation**: Integer vs decimal, ranges, constraints, calculations
3. **UUID Validation**: Proper UUID v4 format checking
4. **Enum Handling**: String and integer enums
5. **String Constraints**: Length limits, patterns, format validation
6. **Array Handling**: Multiple values, uniqueness constraints
7. **Complex Objects**: Nested structures with multiple validation rules
8. **XML Support**: XML request/response handling
9. **Error Handling**: Proper validation error responses

---

## Endpoint Summary

| Method | Endpoint                | Purpose                                    |
| ------ | ----------------------- | ------------------------------------------ |
| GET    | `/validate/dates`       | Date format validation (query)             |
| GET    | `/validate/numbers`     | Number constraint validation (query)       |
| GET    | `/validate/uuid/:id`    | UUID validation (path + query)             |
| GET    | `/validate/enums`       | Enum validation (query)                    |
| GET    | `/validate/constraints` | String constraint validation (query)       |
| GET    | `/validate/arrays`      | Array parameter validation (query)         |
| POST   | `/validate/dates`       | Date validation (body)                     |
| POST   | `/validate/numbers`     | Number validation with calculations (body) |
| POST   | `/validate/complex`     | Complex nested object validation (body)    |
| POST   | `/validate/enums`       | Enum validation (body)                     |
| POST   | `/validate/xml`         | XML body validation                        |
| GET    | `/validate/xml`         | XML response generation                    |

All endpoints are under `/api/cookie-session` and require cookie session authentication.
