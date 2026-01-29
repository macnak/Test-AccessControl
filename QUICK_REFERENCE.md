# Shopping Workflow Quick Reference

## Authentication Flow

```
1. POST /api/cookie-session/login
   → Returns: token, code

2. POST /api/cookie-session/validate
   → Sets: sessionId cookie

3. Use sessionId cookie for all subsequent requests

4. POST /api/cookie-session/logout (when done)
```

## Complete Shopping Flow

```
Login → Browse Products → View Details → Add to Cart →
Update Cart → Checkout → View Orders → Logout
```

## Test Credentials

| Email             | Password  |
| ----------------- | --------- |
| admin@example.com | Admin@123 |
| user@example.com  | User@456  |
| test@example.com  | Test@789  |

## Product Categories

- Electronics (Products 1, 4, 7, 10, 12, 14)
- Books (Products 2, 5, 8, 11, 15)
- Clothing (Products 3, 6, 9, 13)

## Quick cURL Examples

### Login

```bash
curl -X POST http://localhost:3000/api/cookie-session/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"User@456"}'
```

### Browse Products

```bash
curl http://localhost:3000/api/cookie-session/shop/products?page=1&limit=10 \
  -b cookies.txt
```

### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cookie-session/shop/cart \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### Checkout

```bash
curl -X POST http://localhost:3000/api/cookie-session/shop/checkout \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":"123 Main St"}'
```

## API Endpoint Summary

| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| POST   | /login                    | Login with email/password |
| POST   | /validate                 | Validate token and code   |
| POST   | /logout                   | Logout and clear session  |
| GET    | /shop/products            | List products (paginated) |
| GET    | /shop/products/:id        | Get product details       |
| GET    | /shop/cart                | Get shopping cart         |
| POST   | /shop/cart                | Add item to cart          |
| PUT    | /shop/cart/:id            | Update cart item          |
| DELETE | /shop/cart/:id            | Remove from cart          |
| DELETE | /shop/cart                | Clear cart                |
| POST   | /shop/checkout            | Checkout and create order |
| GET    | /shop/orders              | Get order history         |
| GET    | /shop/orders/:id          | Get order details         |
| GET    | /shop/profile             | Get user profile          |
| PUT    | /shop/profile             | Update user profile       |
| GET    | /shop/payment-methods     | Get payment methods       |
| POST   | /shop/payment-methods     | Add payment method        |
| PUT    | /shop/payment-methods/:id | Update payment method     |
| DELETE | /shop/payment-methods/:id | Delete payment method     |

## JMeter Quick Setup

1. Add HTTP Cookie Manager (Test Plan level)
2. Add CSV Data Set Config → jmeter-users.csv
3. Create Thread Group (10 users, 30s ramp-up)
4. Add HTTP Request Samplers for each step
5. Add JSON Extractors for token, code, orderId
6. Add Assertions for success responses
7. Add Listeners (Aggregate Report, View Results Tree)

## Common Response Codes

- 200: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (no/invalid session)
- 404: Not Found (product/order not found)

## Sample Products

| ID  | Name                | Price  | Category    |
| --- | ------------------- | ------ | ----------- |
| 1   | Wireless Headphones | $79.99 | Electronics |
| 2   | TypeScript Guide    | $39.99 | Books       |
| 3   | Cotton T-Shirt      | $24.99 | Clothing    |
| 4   | Smartphone Stand    | $15.99 | Electronics |
| 5   | JavaScript Book     | $29.99 | Books       |

## For More Information

- Full API Documentation: [SHOPPING_WORKFLOW.md](SHOPPING_WORKFLOW.md)
- JMeter Guide: [JMETER_GUIDE.md](JMETER_GUIDE.md)
- Test Script: `./test-shopping-workflow.sh`
