# JMeter Shopping Workflow Test Guide

## Overview

This guide provides detailed instructions for creating JMeter test plans that simulate realistic e-commerce shopping workflows using the Cookie Session Shopping API. The test scenarios are designed to generate meaningful load test data and simulate real user behavior patterns.

## Prerequisites

- Apache JMeter 5.x or higher
- Test server running on `http://localhost:3000` (or configure your server URL)
- Understanding of JMeter basics (Thread Groups, Samplers, Listeners)

## Test Plan Structure

### Recommended Test Plan Hierarchy

```
Test Plan
├── User Defined Variables
├── HTTP Cookie Manager
├── HTTP Request Defaults
├── Thread Group - Shopping Users
│   ├── CSV Data Set Config (User Credentials)
│   ├── Login Flow
│   │   ├── Login Request
│   │   ├── JSON Extractor (token, code)
│   │   └── Validate Request
│   ├── Browse Products Flow
│   │   ├── Get Products Page 1
│   │   ├── Get Products Page 2
│   │   ├── Get Product Details (Random)
│   │   └── Think Timer (2-5 seconds)
│   ├── Shopping Cart Flow
│   │   ├── Add to Cart (Product 1)
│   │   ├── Add to Cart (Product 2)
│   │   ├── View Cart
│   │   ├── Update Cart Item
│   │   └── Think Timer (3-7 seconds)
│   ├── Checkout Flow (70% probability)
│   │   ├── If Controller (70%)
│   │   ├── View Cart
│   │   ├── Checkout Request
│   │   ├── JSON Extractor (orderId)
│   │   └── Think Timer (5-10 seconds)
│   ├── Order History Flow (50% probability)
│   │   ├── If Controller (50%)
│   │   ├── Get Order History
│   │   └── Get Order Details
│   ├── Profile Management Flow (20% probability)
│   │   ├── If Controller (20%)
│   │   ├── Get Profile
│   │   └── Update Profile
│   └── Logout Request
├── View Results Tree (for debugging)
├── Aggregate Report
└── Summary Report
```

## Step-by-Step Configuration

### 1. Test Plan Setup

**Test Plan:**

- Name: "Shopping Workflow Load Test"
- User Defined Variables:
  - `BASE_URL`: `http://localhost:3000`
  - `API_PATH`: `/api/cookie-session`

### 2. HTTP Cookie Manager

Add HTTP Cookie Manager to Test Plan level:

- **Clear cookies each iteration**: No
- **Cookie Policy**: standard

This is critical for maintaining session state across requests.

### 3. HTTP Request Defaults

Add HTTP Request Defaults to Test Plan level:

- **Server Name or IP**: `${BASE_URL}` or `localhost`
- **Port Number**: `3000`
- **Protocol**: `http`
- **Content encoding**: `UTF-8`

### 4. CSV Data Set Config

Create a CSV file named `users.csv`:

```csv
email,password
admin@example.com,Admin@123
user@example.com,User@456
test@example.com,Test@789
```

**CSV Data Set Config:**

- **Filename**: `users.csv`
- **Variable Names**: `email,password`
- **Delimiter**: `,`
- **Recycle on EOF**: `True`
- **Stop thread on EOF**: `False`
- **Sharing mode**: `All threads`

### 5. Thread Group Configuration

**Thread Group - Shopping Users:**

- **Number of Threads**: 10 (start with 10, scale up gradually)
- **Ramp-up Period**: 30 seconds
- **Loop Count**: Infinite (or set specific number)
- **Duration**: 300 seconds (5 minutes for initial test)

### 6. Login Flow

#### HTTP Request - Login

- **Name**: `1. Login`
- **Method**: `POST`
- **Path**: `/api/cookie-session/login`
- **Body Data**:
  ```json
  {
    "email": "${email}",
    "password": "${password}"
  }
  ```
- **Headers**:
  - `Content-Type`: `application/json`

#### JSON Extractor - Extract Login Data

Add as child of Login Request:

- **Names of created variables**: `temp_token,validation_code`
- **JSON Path expressions**:
  - `$.token`
  - `$.code`
- **Match No.**: `1`
- **Default Values**: `TOKEN_NOT_FOUND,CODE_NOT_FOUND`

#### HTTP Request - Validate

- **Name**: `2. Validate Session`
- **Method**: `POST`
- **Path**: `/api/cookie-session/validate`
- **Body Data**:
  ```json
  {
    "token": "${temp_token}",
    "code": "${validation_code}"
  }
  ```
- **Headers**:
  - `Content-Type`: `application/json`

#### Constant Timer

Add after Validate:

- **Thread Delay**: `2000` (2 seconds think time)

### 7. Browse Products Flow

#### HTTP Request - Get Products Page 1

- **Name**: `3. Browse Products - Page 1`
- **Method**: `GET`
- **Path**: `/api/cookie-session/shop/products?page=1&limit=10&sortBy=name&sortOrder=asc`

#### Random Variable - Random Category

- **Variable Name**: `category`
- **Minimum Value**: `1`
- **Maximum Value**: `3`
- **Format**: (empty)

#### If Controller - Random Category Selection

- **Condition**: `${__Random(1,2)} == 1`
- Inside: Add category filter to products request

#### HTTP Request - Get Products by Category

- **Name**: `4. Browse Products - Electronics`
- **Method**: `GET`
- **Path**: `/api/cookie-session/shop/products?page=1&limit=10&category=Electronics`

#### Random Variable - Random Product ID

- **Variable Name**: `productId`
- **Minimum Value**: `1`
- **Maximum Value**: `15`

#### HTTP Request - Get Product Details

- **Name**: `5. View Product Details`
- **Method**: `GET`
- **Path**: `/api/cookie-session/shop/products/${productId}`

#### Uniform Random Timer

- **Constant Delay Offset**: `2000` (2 seconds)
- **Random Delay Maximum**: `3000` (up to 3 additional seconds)

### 8. Shopping Cart Flow

#### HTTP Request - Add to Cart (Product 1)

- **Name**: `6. Add to Cart - Product 1`
- **Method**: `POST`
- **Path**: `/api/cookie-session/shop/cart`
- **Body Data**:
  ```json
  {
    "productId": ${__Random(1,5)},
    "quantity": ${__Random(1,3)}
  }
  ```
- **Headers**:
  - `Content-Type`: `application/json`

#### Constant Timer

- **Thread Delay**: `1000` (1 second)

#### HTTP Request - Add to Cart (Product 2)

- **Name**: `7. Add to Cart - Product 2`
- **Method**: `POST`
- **Path**: `/api/cookie-session/shop/cart`
- **Body Data**:
  ```json
  {
    "productId": ${__Random(6,10)},
    "quantity": ${__Random(1,2)}
  }
  ```
- **Headers**:
  - `Content-Type`: `application/json`

#### HTTP Request - View Cart

- **Name**: `8. View Cart`
- **Method**: `GET`
- **Path**: `/api/cookie-session/shop/cart`

#### If Controller - Update Cart (30% probability)

- **Condition**: `${__Random(1,10)} <= 3`

#### HTTP Request - Update Cart Item (inside If Controller)

- **Name**: `9. Update Cart Quantity`
- **Method**: `PUT`
- **Path**: `/api/cookie-session/shop/cart/${__Random(1,10)}`
- **Body Data**:
  ```json
  {
    "quantity": ${__Random(1,5)}
  }
  ```
- **Headers**:
  - `Content-Type`: `application/json`

#### Uniform Random Timer

- **Constant Delay Offset**: `3000` (3 seconds)
- **Random Delay Maximum**: `4000` (up to 4 additional seconds)

### 9. Checkout Flow (70% probability)

#### If Controller - Checkout Decision

- **Condition**: `${__Random(1,10)} <= 7`

#### HTTP Request - View Cart Before Checkout

- **Name**: `10. Review Cart Before Checkout`
- **Method**: `GET`
- **Path**: `/api/cookie-session/shop/cart`

#### HTTP Request - Checkout

- **Name**: `11. Checkout`
- **Method**: `POST`
- **Path**: `/api/cookie-session/shop/checkout`
- **Body Data**:
  ```json
  {
    "paymentMethodId": "pm-test-${__Random(1000,9999)}",
    "shippingAddress": "Test Address ${__Random(1,100)}"
  }
  ```
- **Headers**:
  - `Content-Type`: `application/json`

#### JSON Extractor - Extract Order ID

- **Names of created variables**: `orderId`
- **JSON Path expressions**: `$.order.orderId`
- **Match No.**: `1`
- **Default Values**: `NO_ORDER`

#### Uniform Random Timer

- **Constant Delay Offset**: `5000` (5 seconds)
- **Random Delay Maximum**: `5000` (up to 5 additional seconds)

### 10. Order History Flow (50% probability)

#### If Controller - Order History Decision

- **Condition**: `${__Random(1,10)} <= 5`

#### HTTP Request - Get Order History

- **Name**: `12. View Order History`
- **Method**: `GET`
- **Path**: `/api/cookie-session/shop/orders?page=1&limit=10`

#### If Controller - View Order Details (if orderId exists)

- **Condition**: `"${orderId}" != "NO_ORDER"`

#### HTTP Request - Get Order Details

- **Name**: `13. View Order Details`
- **Method**: `GET`
- **Path**: `/api/cookie-session/shop/orders/${orderId}`

### 11. Profile Management Flow (20% probability)

#### If Controller - Profile Management Decision

- **Condition**: `${__Random(1,10)} <= 2`

#### HTTP Request - Get Profile

- **Name**: `14. View Profile`
- **Method**: `GET`
- **Path**: `/api/cookie-session/shop/profile`

#### HTTP Request - Update Profile

- **Name**: `15. Update Profile`
- **Method**: `PUT`
- **Path**: `/api/cookie-session/shop/profile`
- **Body Data**:
  ```json
  {
    "name": "Updated User ${__Random(1,1000)}",
    "address": "New Address ${__Random(1,100)}",
    "phone": "+1-555-${__Random(1000,9999)}"
  }
  ```
- **Headers**:
  - `Content-Type`: `application/json`

### 12. Logout

#### HTTP Request - Logout

- **Name**: `16. Logout`
- **Method**: `POST`
- **Path**: `/api/cookie-session/logout`

## Assertions

Add Response Assertion to critical requests:

### Login Success Assertion

- **Apply to**: Main sample only
- **Response Field**: Text Response
- **Pattern Matching Rules**: Contains
- **Patterns to Test**: `"success":true`

### Checkout Success Assertion

- **Apply to**: Main sample only
- **Response Field**: Text Response
- **Pattern Matching Rules**: Contains
- **Patterns to Test**: `"orderId"`

## Listeners for Monitoring

### View Results Tree (Debugging Only)

- Enable during test development
- **Disable before load testing** - it consumes significant resources

### Aggregate Report

Monitor these key metrics:

- **Average**: Response time average
- **90% Line**: 90th percentile response time
- **Throughput**: Requests per second
- **Error %**: Error rate

### Summary Report

Quick overview of test results:

- **# Samples**: Total requests
- **Average**: Average response time
- **Min/Max**: Response time range
- **Std. Dev.**: Response time standard deviation
- **Error %**: Error percentage
- **Throughput**: Requests per second

### Response Time Graph

Visual representation of response times over time.

## Advanced Configurations

### 1. Parameterized Product Selection

Create `products.csv`:

```csv
productId,quantity
1,1
2,2
3,1
4,3
1,2
5,1
```

Use CSV Data Set Config to vary product selections.

### 2. Realistic User Behavior

Add Gaussian Random Timer for more realistic think times:

- **Constant Delay Offset**: `3000` (3 seconds)
- **Deviation**: `1000` (1 second)

### 3. Payment Methods Management

Add occasional payment method updates:

```json
POST /api/cookie-session/shop/payment-methods
{
  "type": "credit_card",
  "last4": "${__Random(1000,9999)}",
  "expiryMonth": ${__Random(1,12)},
  "expiryYear": 2026,
  "isDefault": true
}
```

### 4. Distributed Testing

For higher loads:

- Set up JMeter in master-slave mode
- Use multiple slave machines
- Aggregate results from all slaves

## Load Testing Scenarios

### Scenario 1: Baseline Test

- **Users**: 10
- **Ramp-up**: 30 seconds
- **Duration**: 5 minutes
- **Goal**: Establish baseline performance

### Scenario 2: Normal Load

- **Users**: 50
- **Ramp-up**: 2 minutes
- **Duration**: 10 minutes
- **Goal**: Simulate normal business hours

### Scenario 3: Peak Load

- **Users**: 100-200
- **Ramp-up**: 5 minutes
- **Duration**: 15 minutes
- **Goal**: Simulate peak shopping periods (Black Friday)

### Scenario 4: Stress Test

- **Users**: 500+
- **Ramp-up**: 10 minutes
- **Duration**: 20 minutes
- **Goal**: Find breaking point

### Scenario 5: Endurance Test

- **Users**: 50
- **Ramp-up**: 5 minutes
- **Duration**: 2 hours
- **Goal**: Check for memory leaks and stability

## Key Metrics to Monitor

### Application Metrics

- **Response Time**: < 500ms for 95% of requests
- **Throughput**: Requests per second
- **Error Rate**: < 1%
- **Session Creation Rate**: New sessions per second

### Business Metrics

- **Checkout Conversion Rate**: % of carts that complete checkout
- **Cart Abandonment Rate**: % of carts that don't checkout
- **Average Order Value**: Total cart value
- **Products per Order**: Average items per checkout

### System Metrics (Monitor on Server)

- **CPU Utilization**: < 70%
- **Memory Usage**: Check for leaks
- **Network I/O**: Bandwidth utilization
- **Database Connections**: Connection pool usage

## Troubleshooting

### Common Issues

#### 1. Session Not Persisting

**Symptom**: 401 Unauthorized after validate
**Solution**: Ensure HTTP Cookie Manager is at Test Plan level

#### 2. High Error Rate

**Symptom**: Many 4xx/5xx errors
**Solution**:

- Reduce thread count
- Increase ramp-up period
- Check server logs

#### 3. Variables Not Extracted

**Symptom**: Requests fail with empty variables
**Solution**:

- Verify JSON Extractor paths
- Add Debug Sampler to view variables
- Check response format

#### 4. Inconsistent Results

**Symptom**: Tests behave differently on each run
**Solution**:

- Use fixed random seeds: `${__Random(1,10,seed)}`
- Clear cookies between iterations if needed
- Reset server state between tests

## Best Practices

1. **Start Small**: Begin with 1-5 users and gradually increase
2. **Monitor**: Watch server metrics, not just JMeter metrics
3. **Realistic Data**: Use varied product IDs and quantities
4. **Think Times**: Always include realistic delays
5. **Assertions**: Validate responses, not just status codes
6. **Clean Up**: Clear test data between runs
7. **Documentation**: Document your test scenarios
8. **Version Control**: Save JMeter test plans in git

## Example JMeter Functions

### Useful JMeter Functions

```
${__Random(1,100)}           - Random number 1-100
${__RandomString(10,abc)}    - Random string of 10 chars
${__time(yyyy-MM-dd)}        - Current date
${__UUID()}                  - Generate UUID
${__counter(TRUE,)}          - Increment counter
${__V(variable_${counter})}  - Dynamic variable reference
```

## Data Generation

### Generate Realistic Test Data

Create varied scenarios:

```csv
scenario,category,products,checkout
browse,Electronics,3,false
browse,Books,2,false
purchase,Clothing,1,true
purchase,Electronics,2,true
browse_purchase,Books,4,true
```

Use in test plan:

- **If**: `"${scenario}" == "purchase"`
- **Then**: Execute checkout flow

## Export Results

### Command Line Execution

```bash
jmeter -n -t ShoppingWorkflow.jmx \
  -l results.jtl \
  -e -o report-output/
```

### Generate HTML Report

```bash
jmeter -g results.jtl -o html-report/
```

## Integration with CI/CD

### Example Jenkins Pipeline

```groovy
stage('Load Test') {
    steps {
        sh 'jmeter -n -t tests/ShoppingWorkflow.jmx -l results.jtl'
        perfReport 'results.jtl'
    }
}
```

## Conclusion

This JMeter configuration simulates a realistic e-commerce shopping workflow that:

- Authenticates users with cookie sessions
- Browses products with realistic patterns
- Manages shopping carts with variable behavior
- Completes purchases with configurable conversion rates
- Tracks orders and manages user profiles

The generated load test data can be used for performance analysis, capacity planning, and system optimization.

For more information on the API endpoints, see [SHOPPING_WORKFLOW.md](SHOPPING_WORKFLOW.md).
