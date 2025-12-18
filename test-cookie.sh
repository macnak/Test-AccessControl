#!/bin/bash

# Test Cookie Session Authentication Flow
echo "=========================================="
echo "Testing Cookie Session Authentication"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000/api/cookie-session"
COOKIE_FILE="/tmp/session-cookies.txt"

# Clean up any existing cookie file
rm -f "$COOKIE_FILE"

# Step 1: Login to get temporary token and code
echo "Step 1: Login with email and password"
echo "--------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract token and code from login response
TEMP_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
CODE=$(echo $LOGIN_RESPONSE | grep -o '"code":"[^"]*' | grep -o '[^"]*$')

echo "Extracted Token: $TEMP_TOKEN"
echo "Extracted Code: $CODE"
echo ""

# Step 2: Validate token and code to get session cookie
echo "Step 2: Validate token and code to receive session cookie"
echo "-----------------------------------------------------------"
VALIDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/validate" \
  -c "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TEMP_TOKEN\",
    \"code\": \"$CODE\"
  }")

echo "Response: $VALIDATE_RESPONSE"
echo ""

# Check if cookie file was created
if [ -f "$COOKIE_FILE" ]; then
  echo "Session cookie saved to: $COOKIE_FILE"
  echo "Cookie contents:"
  cat "$COOKIE_FILE"
  echo ""
else
  echo "ERROR: Cookie file not created!"
  exit 1
fi

# Step 3: Test protected endpoints with session cookie
echo ""
echo "=========================================="
echo "Testing Protected Endpoints"
echo "=========================================="
echo ""

# Test 1: JSON Response
echo "Test 1: GET /json (JSON Response)"
echo "-----------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/json" | jq '.'
echo ""

# Test 2: Text Response
echo "Test 2: GET /text (Plain Text Response)"
echo "----------------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/text"
echo ""
echo ""

# Test 3: XML Response
echo "Test 3: GET /xml (XML Response)"
echo "--------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/xml"
echo ""
echo ""

# Test 4: HTML Response
echo "Test 4: GET /html (HTML Response)"
echo "----------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/html"
echo ""
echo ""

# Test 5: CSV Response
echo "Test 5: GET /csv (CSV Response)"
echo "--------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/csv"
echo ""
echo ""

# Test 6: Array Response
echo "Test 6: GET /array (Array Response)"
echo "------------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/array" | jq '.'
echo ""

# Test 7: POST with simple JSON
echo "Test 7: POST /json (Simple JSON)"
echo "---------------------------------"
curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/json" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-item",
    "value": "test-value"
  }' | jq '.'
echo ""

# Test 8: POST with nested JSON
echo "Test 8: POST /nested-json (Nested JSON)"
echo "----------------------------------------"
curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/nested-json" \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    },
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }' | jq '.'
echo ""

# Test 9: POST with array JSON
echo "Test 9: POST /array-json (Array JSON)"
echo "--------------------------------------"
curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/array-json" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": 1, "name": "Item 1", "quantity": 5},
      {"id": 2, "name": "Item 2", "quantity": 3},
      {"id": 3, "name": "Item 3", "quantity": 7}
    ]
  }' | jq '.'
echo ""

# Test 10: POST with complex JSON
echo "Test 10: POST /complex-json (Complex JSON)"
echo "-------------------------------------------"
curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/complex-json" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "timestamp": "2025-12-19T10:00:00Z",
      "version": "1.0"
    },
    "payload": {
      "key1": "value1",
      "key2": "value2"
    },
    "tags": ["tag1", "tag2", "tag3"]
  }' | jq '.'
echo ""

# Test 11: GET with path parameter (user by ID)
echo "Test 11: GET /users/:userId (Path Parameter)"
echo "----------------------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/users/1" | jq '.'
echo ""

# Test 12: GET with path parameter (product by ID)
echo "Test 12: GET /products/:productId (Path Parameter)"
echo "----------------------------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/products/1" | jq '.'
echo ""

# Test 13: PUT with path parameter
echo "Test 13: PUT /resources/:resourceId (Path Parameter + Body)"
echo "-------------------------------------------------------------"
curl -s -b "$COOKIE_FILE" -X PUT "$BASE_URL/resources/res-123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Resource",
    "status": "active",
    "data": {"field": "value"}
  }' | jq '.'
echo ""

# Test 14: GET category items
echo "Test 14: GET /categories/:category/items (Path Parameter)"
echo "----------------------------------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/categories/electronics/items" | jq '.'
echo ""

# Test 15: PATCH request
echo "Test 15: PATCH /data (Update)"
echo "------------------------------"
curl -s -b "$COOKIE_FILE" -X PATCH "$BASE_URL/data" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "patched-item",
    "value": "patched-value"
  }' | jq '.'
echo ""

# Test 16: DELETE request
echo "Test 16: DELETE /data/:id (Delete)"
echo "-----------------------------------"
curl -s -b "$COOKIE_FILE" -X DELETE "$BASE_URL/data/123" | jq '.'
echo ""

# Test 17: Test without cookie (should fail)
echo "Test 17: GET /json WITHOUT cookie (Should Fail)"
echo "------------------------------------------------"
curl -s "$BASE_URL/json" | jq '.'
echo ""

# Test 18: Logout
echo "Test 18: POST /logout (Clear Session)"
echo "--------------------------------------"
curl -s -b "$COOKIE_FILE" -c "$COOKIE_FILE" -X POST "$BASE_URL/logout" | jq '.'
echo ""

# Test 19: Try to access protected endpoint after logout (should fail)
echo "Test 19: GET /json AFTER logout (Should Fail)"
echo "----------------------------------------------"
curl -s -b "$COOKIE_FILE" "$BASE_URL/json" | jq '.'
echo ""

# Clean up
rm -f "$COOKIE_FILE"
echo "Cookie file cleaned up."
echo ""
echo "=========================================="
echo "Cookie Session Tests Complete"
echo "=========================================="
