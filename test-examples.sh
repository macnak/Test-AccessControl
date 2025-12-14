#!/bin/bash

# Test Access Control API - Example Usage Script

API_URL="http://localhost:3000"

echo "================================"
echo "Test Access Control API Examples"
echo "================================"
echo ""

# Public endpoints
echo "1. Testing Public Health Check..."
curl -s "${API_URL}/api/public/health" | jq .
echo ""

echo "2. Testing Public Info..."
curl -s "${API_URL}/api/public/info" | jq .
echo ""

# Basic Auth
echo "3. Testing Basic Auth (JSON)..."
curl -s -u admin:admin123 "${API_URL}/api/basic-auth/json" | jq .
echo ""

echo "4. Testing Basic Auth (Text)..."
curl -s -u admin:admin123 "${API_URL}/api/basic-auth/text"
echo ""
echo ""

# API Key (Header)
echo "5. Testing API Key via Header (JSON)..."
curl -s -H "x-api-key: api-key-12345-valid" "${API_URL}/api/api-key/json" | jq .
echo ""

# API Key (Query Parameter)
echo "6. Testing API Key via Query Parameter (JSON)..."
curl -s "${API_URL}/api/api-key/json?apiKey=api-key-12345-valid" | jq .
echo ""

# Bearer Token
echo "7. Testing Bearer Token (JSON)..."
curl -s -H "Authorization: Bearer bearer-token-xyz123-valid" "${API_URL}/api/bearer-token/json" | jq .
echo ""

# OAuth2
echo "8. Testing OAuth2 (JSON)..."
curl -s -H "Authorization: Bearer oauth2-token-valid-12345" "${API_URL}/api/oauth2/json" | jq .
echo ""

# POST JSON with Basic Auth
echo "9. Testing POST JSON with Basic Auth..."
curl -s -X POST -u admin:admin123 \
  -H "Content-Type: application/json" \
  -d '{"name":"test","value":"data"}' \
  "${API_URL}/api/basic-auth/json" | jq .
echo ""

# XML Response
echo "10. Testing XML Response with API Key..."
curl -s -H "x-api-key: api-key-12345-valid" "${API_URL}/api/api-key/xml"
echo ""
echo ""

# Invalid credentials
echo "11. Testing Invalid Basic Auth (should return 401)..."
curl -s -u invalid:wrong "${API_URL}/api/basic-auth/json" | jq .
echo ""

echo "12. Testing Invalid API Key (should return 401)..."
curl -s -H "x-api-key: invalid-key" "${API_URL}/api/api-key/json" | jq .
echo ""

echo "================================"
echo "All tests completed!"
echo "================================"
