# Shopping Workflow API Documentation

## Overview

The Cookie Session Shopping Workflow provides a complete e-commerce flow designed for JMeter load testing and business process simulation. This workflow simulates a realistic online shopping experience with authentication, product browsing, cart management, checkout, and order tracking.

## Business Flow

The typical shopping workflow follows this sequence:

1. **Authentication**
   - Login → Validate → Receive Session Cookie
2. **Product Discovery**
   - Browse products with pagination
   - Filter by category
   - Sort by price or name
   - View product details
3. **Shopping Cart**
   - Add products to cart
   - Update quantities
   - Remove items
   - View cart summary
4. **Checkout**
   - Review cart
   - Select/add payment method
   - Provide shipping address
   - Place order
5. **Post-Purchase**
   - View order history
   - Track order status
   - Update profile information
   - Manage payment methods
6. **Logout**
   - End session

## Test Credentials

Use these test accounts for testing:

| Email             | Password  | Name         | Address                                |
| ----------------- | --------- | ------------ | -------------------------------------- |
| admin@example.com | Admin@123 | Admin User   | 123 Admin Street, New York, NY 10001   |
| user@example.com  | User@456  | Regular User | 456 User Avenue, Los Angeles, CA 90001 |
| test@example.com  | Test@789  | Test User    | 789 Test Boulevard, Chicago, IL 60601  |

## API Endpoints

### Authentication Endpoints

#### 1. Login

```
POST /api/cookie-session/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "User@456"
}

Response:
{
  "success": true,
  "message": "Login successful. Please validate with the provided code.",
  "token": "temp-cookie-abc123...",
  "code": "123456",
  "expiresIn": 300
}
```

#### 2. Validate

```
POST /api/cookie-session/validate
Content-Type: application/json

{
  "token": "temp-cookie-abc123...",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Validation successful. Session cookie has been set.",
  "sessionId": "session-xyz789...",
  "cookieName": "sessionId"
}

Sets Cookie: sessionId=session-xyz789...
```

#### 3. Logout

```
POST /api/cookie-session/logout
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "message": "Logged out successfully. Session cookie cleared."
}
```

### Product Catalog Endpoints

#### 4. List Products (with Pagination)

```
GET /api/cookie-session/shop/products?page=1&limit=10&category=Electronics&sortBy=price&sortOrder=asc
Cookie: sessionId=session-xyz789...

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- category: Filter by category (optional)
- sortBy: 'price' or 'name' (default: 'name')
- sortOrder: 'asc' or 'desc' (default: 'asc')

Response:
{
  "success": true,
  "page": 1,
  "limit": 10,
  "totalProducts": 15,
  "totalPages": 2,
  "products": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "price": 79.99,
      "category": "Electronics",
      "description": "High-quality wireless headphones with noise cancellation",
      "stock": 50,
      "imageUrl": "https://example.com/images/headphones.jpg"
    },
    ...
  ]
}
```

#### 5. Get Product Details

```
GET /api/cookie-session/shop/products/1
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Wireless Headphones",
    "price": 79.99,
    "category": "Electronics",
    "description": "High-quality wireless headphones with noise cancellation",
    "stock": 50,
    "imageUrl": "https://example.com/images/headphones.jpg"
  }
}
```

### Shopping Cart Endpoints

#### 6. Get Cart

```
GET /api/cookie-session/shop/cart
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "cart": {
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "addedAt": "2026-01-29T10:30:00.000Z",
        "productName": "Wireless Headphones",
        "productPrice": 79.99,
        "subtotal": 159.98
      }
    ],
    "itemCount": 1,
    "totalItems": 2,
    "total": 159.98
  }
}
```

#### 7. Add to Cart

```
POST /api/cookie-session/shop/cart
Cookie: sessionId=session-xyz789...
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}

Response:
{
  "success": true,
  "message": "Added 2 x Wireless Headphones to cart",
  "cart": {
    "itemCount": 1,
    "totalItems": 2
  }
}
```

#### 8. Update Cart Item

```
PUT /api/cookie-session/shop/cart/1
Cookie: sessionId=session-xyz789...
Content-Type: application/json

{
  "quantity": 3
}

Response:
{
  "success": true,
  "message": "Cart item updated",
  "item": {
    "productId": 1,
    "quantity": 3,
    "addedAt": "2026-01-29T10:30:00.000Z"
  }
}
```

#### 9. Remove from Cart

```
DELETE /api/cookie-session/shop/cart/1
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### 10. Clear Cart

```
DELETE /api/cookie-session/shop/cart
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "message": "Cart cleared"
}
```

### Checkout Endpoint

#### 11. Checkout

```
POST /api/cookie-session/shop/checkout
Cookie: sessionId=session-xyz789...
Content-Type: application/json

{
  "paymentMethodId": "pm-12345",
  "shippingAddress": "123 Main St, City, State 12345"
}

Response:
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "orderId": "ORD-1738152000000-a1b2c3d4",
    "total": 159.98,
    "status": "processing",
    "estimatedDelivery": "2026-02-05T10:30:00.000Z"
  }
}
```

### Order History Endpoints

#### 12. Get Order History

```
GET /api/cookie-session/shop/orders?page=1&limit=10&status=completed
Cookie: sessionId=session-xyz789...

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- status: Filter by status: 'pending', 'processing', 'completed', 'cancelled' (optional)

Response:
{
  "success": true,
  "page": 1,
  "limit": 10,
  "totalOrders": 5,
  "totalPages": 1,
  "orders": [
    {
      "orderId": "ORD-1738152000000-a1b2c3d4",
      "userId": "user@example.com",
      "items": [
        {
          "productId": 1,
          "productName": "Wireless Headphones",
          "quantity": 2,
          "price": 79.99
        }
      ],
      "total": 159.98,
      "status": "completed",
      "paymentMethod": "pm-12345",
      "shippingAddress": "123 Main St, City, State 12345",
      "createdAt": "2026-01-29T10:30:00.000Z",
      "updatedAt": "2026-01-29T10:35:00.000Z"
    }
  ]
}
```

#### 13. Get Order Details

```
GET /api/cookie-session/shop/orders/ORD-1738152000000-a1b2c3d4
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "order": {
    "orderId": "ORD-1738152000000-a1b2c3d4",
    "userId": "user@example.com",
    "items": [...],
    "total": 159.98,
    "status": "completed",
    "paymentMethod": "pm-12345",
    "shippingAddress": "123 Main St, City, State 12345",
    "createdAt": "2026-01-29T10:30:00.000Z",
    "updatedAt": "2026-01-29T10:35:00.000Z"
  }
}
```

### User Profile Endpoints

#### 14. Get Profile

```
GET /api/cookie-session/shop/profile
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "profile": {
    "email": "user@example.com",
    "name": "Regular User",
    "address": "456 User Avenue, Los Angeles, CA 90001",
    "phone": "+1-555-0200"
  }
}
```

#### 15. Update Profile

```
PUT /api/cookie-session/shop/profile
Cookie: sessionId=session-xyz789...
Content-Type: application/json

{
  "name": "Updated Name",
  "address": "New Address, City, State 12345",
  "phone": "+1-555-9999"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "email": "user@example.com",
    "name": "Updated Name",
    "address": "New Address, City, State 12345",
    "phone": "+1-555-9999"
  }
}
```

### Payment Methods Endpoints

#### 16. Get Payment Methods

```
GET /api/cookie-session/shop/payment-methods
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "paymentMethods": [
    {
      "id": "pm-12345",
      "type": "credit_card",
      "last4": "4242",
      "expiryMonth": 12,
      "expiryYear": 2026,
      "isDefault": true
    }
  ]
}
```

#### 17. Add Payment Method

```
POST /api/cookie-session/shop/payment-methods
Cookie: sessionId=session-xyz789...
Content-Type: application/json

{
  "type": "credit_card",
  "last4": "4242",
  "expiryMonth": 12,
  "expiryYear": 2026,
  "isDefault": true
}

Response:
{
  "success": true,
  "message": "Payment method added successfully",
  "paymentMethod": {
    "id": "pm-12345-abc",
    "type": "credit_card",
    "last4": "4242",
    "expiryMonth": 12,
    "expiryYear": 2026,
    "isDefault": true
  }
}
```

#### 18. Update Payment Method

```
PUT /api/cookie-session/shop/payment-methods/pm-12345
Cookie: sessionId=session-xyz789...
Content-Type: application/json

{
  "isDefault": true,
  "expiryMonth": 6,
  "expiryYear": 2027
}

Response:
{
  "success": true,
  "message": "Payment method updated successfully",
  "paymentMethod": {
    "id": "pm-12345",
    "type": "credit_card",
    "last4": "4242",
    "expiryMonth": 6,
    "expiryYear": 2027,
    "isDefault": true
  }
}
```

#### 19. Delete Payment Method

```
DELETE /api/cookie-session/shop/payment-methods/pm-12345
Cookie: sessionId=session-xyz789...

Response:
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

## Available Products

The system includes 15 sample products across 3 categories:

### Electronics (7 products)

- Wireless Headphones ($79.99)
- Smartphone Stand ($15.99)
- USB-C Cable 6ft ($12.99)
- Wireless Mouse ($34.99)
- Sports Watch ($199.99)
- Mechanical Keyboard ($109.99)

### Books (5 products)

- TypeScript Programming Guide ($39.99)
- JavaScript: The Good Parts ($29.99)
- Node.js Design Patterns ($44.99)
- Clean Code ($42.99)
- Refactoring ($47.99)

### Clothing (3 products)

- Premium Cotton T-Shirt ($24.99)
- Running Shoes ($89.99)
- Winter Jacket ($129.99)
- Casual Jeans ($54.99)

## Product Categories

Filter products by these categories:

- Electronics
- Books
- Clothing

## Order Status Types

Orders can have the following statuses:

- `pending`: Order received but not yet processing
- `processing`: Order is being prepared
- `completed`: Order has been shipped/delivered
- `cancelled`: Order was cancelled

## Payment Method Types

Supported payment methods:

- `credit_card`: Credit card payment
- `debit_card`: Debit card payment
- `paypal`: PayPal payment

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid session)
- `404`: Not Found (resource doesn't exist)

Error response format:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Session Management

- Sessions are created after successful validation
- Session cookies are HTTP-only for security
- Each session has an associated shopping cart
- Sessions expire after 1 hour of inactivity
- Logout clears the session and cart

## Notes for JMeter Testing

1. **Cookie Management**: Enable cookie manager in JMeter to handle session cookies
2. **Sequential Flow**: Follow the business flow order for realistic scenarios
3. **Variable Extraction**: Extract `token`, `code`, and `orderId` for subsequent requests
4. **Think Time**: Add realistic delays between actions (2-10 seconds)
5. **Parameterization**: Use CSV data sets for multiple user scenarios
6. **Assertions**: Verify `success: true` in responses
7. **Load Distribution**: Weight actions realistically (more browsing than purchasing)

### Recommended Action Distribution for Load Testing

- Browse Products: 40%
- View Product Details: 25%
- Add to Cart: 15%
- View Cart: 10%
- Checkout: 5%
- View Orders: 3%
- Update Profile: 2%

## Example JMeter Scenario

1. Login → Validate (once per thread)
2. Browse products (random category, 3-5 times)
3. View product details (2-3 products)
4. Add to cart (1-3 products)
5. Update cart quantities (optional, 30% probability)
6. View cart
7. Checkout (70% probability)
8. View order history
9. View profile (optional, 20% probability)
10. Logout

This creates a realistic shopping workflow that can be used to generate meaningful load test data.
