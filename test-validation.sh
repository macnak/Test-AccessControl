#!/bin/bash

# Test script for validation endpoints with Cookie Session authentication
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000/api/cookie-session"
EMAIL="user@example.com"
PASSWORD="password123"

echo "======================================"
echo "Cookie Session Validation Tests"
echo "======================================"
echo ""

# Step 1: Login to get temporary token
echo "1. Login to get temporary token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TEMP_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
CODE=$(echo $LOGIN_RESPONSE | jq -r '.code')

echo "   Token: $TEMP_TOKEN"
echo "   Code: $CODE"
echo ""

# Step 2: Validate to get session cookie
echo "2. Validating to get session cookie..."
COOKIE_RESPONSE=$(curl -s -X POST "$BASE_URL/validate" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"token\":\"$TEMP_TOKEN\",\"code\":\"$CODE\"}")

SESSION_ID=$(echo $COOKIE_RESPONSE | jq -r '.sessionId')
echo "   Session ID: $SESSION_ID"
echo ""

echo "======================================"
echo "Testing Validation Endpoints (GET)"
echo "======================================"
echo ""

# Test 1: Date validation
echo "3. Testing date parameter validation..."
curl -s -X GET "$BASE_URL/validate/dates?isoDate=2024-12-21T10:30:00Z&dateOnly=2024-12-21&timestamp=1734780600&customFormat=12/21/2024" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Test 2: Number validation
echo "4. Testing number parameter validation..."
curl -s -X GET "$BASE_URL/validate/numbers?integer=42&positiveInt=10&rangeInt=50&decimal=3.14159&percentage=15.50" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Test 3: UUID validation
echo "5. Testing UUID parameter validation..."
curl -s -X GET "$BASE_URL/validate/uuid/550e8400-e29b-41d4-a716-446655440000?correlationId=123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Test 4: Enum validation
echo "6. Testing enum parameter validation..."
curl -s -X GET "$BASE_URL/validate/enums?status=active&priority=3&color=blue" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Test 5: Constraint validation
echo "7. Testing constraint parameter validation..."
curl -s -X GET "$BASE_URL/validate/constraints?email=test@example.com&username=john_doe&zipCode=12345-6789&url=https://example.com" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Test 6: Array validation
echo "8. Testing array parameter validation..."
curl -s -X GET "$BASE_URL/validate/arrays?tags=api&tags=testing&tags=validation&ids=1&ids=2&ids=3" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

echo "======================================"
echo "Testing Validation Endpoints (POST)"
echo "======================================"
echo ""

# Test 7: POST date validation
echo "9. Testing POST date validation..."
curl -s -X POST "$BASE_URL/validate/dates" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "eventDate": "2024-12-25T00:00:00Z",
    "startDate": "2024-12-21",
    "endDate": "2024-12-31",
    "timestamp": 1735084800
  }' | jq '.'
echo ""

# Test 8: POST number validation
echo "10. Testing POST number validation..."
curl -s -X POST "$BASE_URL/validate/numbers" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "quantity": 5,
    "price": 29.99,
    "discount": 10,
    "rating": 4.5
  }' | jq '.'
echo ""

# Test 9: POST complex validation
echo "11. Testing POST complex object validation..."
curl -s -X POST "$BASE_URL/validate/complex" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "profile": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "status": "active"
    },
    "preferences": {
      "notifications": true,
      "theme": "dark"
    },
    "tags": ["developer", "api-tester"]
  }' | jq '.'
echo ""

# Test 10: POST enum validation
echo "12. Testing POST enum validation..."
curl -s -X POST "$BASE_URL/validate/enums" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "approved",
    "priority": 2,
    "category": "feature",
    "severity": "medium"
  }' | jq '.'
echo ""

echo "======================================"
echo "Testing XML Validation Endpoints"
echo "======================================"
echo ""

# Test 11: POST XML validation
echo "13. Testing POST XML validation..."
curl -s -X POST "$BASE_URL/validate/xml" \
  -H "Content-Type: application/xml" \
  -b cookies.txt \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<request>
  <user>
    <name>John Doe</name>
    <email>john@example.com</email>
  </user>
  <data>
    <item id="1">Test Item</item>
  </data>
</request>' | jq '.'
echo ""

# Test 12: GET XML response
echo "14. Testing GET XML response..."
curl -s -X GET "$BASE_URL/validate/xml?format=pretty&includeMetadata=true&recordId=550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
echo ""
echo ""

# Test 13: GET XML response (compact)
echo "15. Testing GET XML response (compact format)..."
curl -s -X GET "$BASE_URL/validate/xml?format=compact&recordId=123e4567-e89b-12d3-a456-426614174000" \
  -b cookies.txt
echo ""
echo ""

echo "======================================"
echo "Testing Validation Failures"
echo "======================================"
echo ""

# Test 14: Invalid UUID
echo "16. Testing invalid UUID (should fail)..."
curl -s -X GET "$BASE_URL/validate/uuid/not-a-uuid" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Test 15: Invalid enum value
echo "17. Testing invalid enum value (should fail)..."
curl -s -X GET "$BASE_URL/validate/enums?status=invalid-status&priority=10" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Test 16: Number out of range
echo "18. Testing number out of range (should fail)..."
curl -s -X GET "$BASE_URL/validate/numbers?rangeInt=200" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Test 17: Invalid date format
echo "19. Testing invalid date format (should fail)..."
curl -s -X GET "$BASE_URL/validate/dates?customFormat=2024-12-21" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq '.'
echo ""

# Cleanup
rm -f cookies.txt

echo "======================================"
echo "Tests completed!"
echo "======================================"
