#!/bin/bash

# Shopping Workflow Test Script
# This script demonstrates a complete shopping workflow using the Cookie Session API

BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/api/cookie-session"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Shopping Workflow Test${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Login
echo -e "${YELLOW}Step 1: Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "User@456"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

# Extract token and code
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
CODE=$(echo "$LOGIN_RESPONSE" | jq -r '.code')

echo -e "\n${GREEN}✓ Login successful${NC}"
echo -e "Token: $TOKEN"
echo -e "Code: $CODE\n"

sleep 1

# Step 2: Validate
echo -e "${YELLOW}Step 2: Validate Session${NC}"
VALIDATE_RESPONSE=$(curl -s -X POST "${API_BASE}/validate" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{
    \"token\": \"$TOKEN\",
    \"code\": \"$CODE\"
  }")

echo "$VALIDATE_RESPONSE" | jq '.'
SESSION_ID=$(echo "$VALIDATE_RESPONSE" | jq -r '.sessionId')

echo -e "\n${GREEN}✓ Session validated${NC}"
echo -e "Session ID: $SESSION_ID\n"

sleep 1

# Step 3: Browse Products
echo -e "${YELLOW}Step 3: Browse Products (Page 1)${NC}"
curl -s -X GET "${API_BASE}/shop/products?page=1&limit=5&sortBy=price&sortOrder=asc" \
  -b cookies.txt | jq '.products[] | {id, name, price, category}'

echo -e "\n${GREEN}✓ Products loaded${NC}\n"

sleep 1

# Step 4: Browse Products by Category
echo -e "${YELLOW}Step 4: Browse Electronics${NC}"
curl -s -X GET "${API_BASE}/shop/products?category=Electronics&limit=3" \
  -b cookies.txt | jq '.products[] | {id, name, price}'

echo -e "\n${GREEN}✓ Electronics loaded${NC}\n"

sleep 1

# Step 5: View Product Details
echo -e "${YELLOW}Step 5: View Product Details (Product 1)${NC}"
curl -s -X GET "${API_BASE}/shop/products/1" \
  -b cookies.txt | jq '.product'

echo -e "\n${GREEN}✓ Product details loaded${NC}\n"

sleep 1

# Step 6: Add to Cart
echo -e "${YELLOW}Step 6: Add Products to Cart${NC}"
echo "Adding Product 1 (Qty: 2)..."
curl -s -X POST "${API_BASE}/shop/cart" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }' | jq '.'

sleep 1

echo -e "\nAdding Product 3 (Qty: 1)..."
curl -s -X POST "${API_BASE}/shop/cart" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 3,
    "quantity": 1
  }' | jq '.'

echo -e "\n${GREEN}✓ Products added to cart${NC}\n"

sleep 1

# Step 7: View Cart
echo -e "${YELLOW}Step 7: View Shopping Cart${NC}"
CART=$(curl -s -X GET "${API_BASE}/shop/cart" -b cookies.txt)
echo "$CART" | jq '.cart'

echo -e "\n${GREEN}✓ Cart loaded${NC}\n"

sleep 1

# Step 8: Update Cart
echo -e "${YELLOW}Step 8: Update Cart Item${NC}"
echo "Updating Product 1 quantity to 3..."
curl -s -X PUT "${API_BASE}/shop/cart/1" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }' | jq '.'

echo -e "\n${GREEN}✓ Cart updated${NC}\n"

sleep 1

# Step 9: View Updated Cart
echo -e "${YELLOW}Step 9: View Updated Cart${NC}"
curl -s -X GET "${API_BASE}/shop/cart" -b cookies.txt | jq '.cart'

echo -e "\n${GREEN}✓ Updated cart loaded${NC}\n"

sleep 1

# Step 10: Get Profile
echo -e "${YELLOW}Step 10: View User Profile${NC}"
curl -s -X GET "${API_BASE}/shop/profile" -b cookies.txt | jq '.profile'

echo -e "\n${GREEN}✓ Profile loaded${NC}\n"

sleep 1

# Step 11: Add Payment Method
echo -e "${YELLOW}Step 11: Add Payment Method${NC}"
PAYMENT=$(curl -s -X POST "${API_BASE}/shop/payment-methods" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "type": "credit_card",
    "last4": "4242",
    "expiryMonth": 12,
    "expiryYear": 2026,
    "isDefault": true
  }')

echo "$PAYMENT" | jq '.'
PAYMENT_ID=$(echo "$PAYMENT" | jq -r '.paymentMethod.id')

echo -e "\n${GREEN}✓ Payment method added${NC}\n"

sleep 1

# Step 12: Checkout
echo -e "${YELLOW}Step 12: Checkout${NC}"
CHECKOUT=$(curl -s -X POST "${API_BASE}/shop/checkout" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d "{
    \"paymentMethodId\": \"$PAYMENT_ID\",
    \"shippingAddress\": \"456 User Avenue, Los Angeles, CA 90001\"
  }")

echo "$CHECKOUT" | jq '.'
ORDER_ID=$(echo "$CHECKOUT" | jq -r '.order.orderId')

echo -e "\n${GREEN}✓ Order placed${NC}"
echo -e "Order ID: $ORDER_ID\n"

sleep 1

# Step 13: View Order History
echo -e "${YELLOW}Step 13: View Order History${NC}"
curl -s -X GET "${API_BASE}/shop/orders?page=1&limit=5" \
  -b cookies.txt | jq '.orders[] | {orderId, total, status, createdAt}'

echo -e "\n${GREEN}✓ Order history loaded${NC}\n"

sleep 1

# Step 14: View Order Details
echo -e "${YELLOW}Step 14: View Order Details${NC}"
curl -s -X GET "${API_BASE}/shop/orders/$ORDER_ID" \
  -b cookies.txt | jq '.order'

echo -e "\n${GREEN}✓ Order details loaded${NC}\n"

sleep 1

# Step 15: Update Profile
echo -e "${YELLOW}Step 15: Update Profile${NC}"
curl -s -X PUT "${API_BASE}/shop/profile" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated User Name",
    "address": "789 New Street, Chicago, IL 60601",
    "phone": "+1-555-9999"
  }' | jq '.'

echo -e "\n${GREEN}✓ Profile updated${NC}\n"

sleep 1

# Step 16: View Payment Methods
echo -e "${YELLOW}Step 16: View Payment Methods${NC}"
curl -s -X GET "${API_BASE}/shop/payment-methods" \
  -b cookies.txt | jq '.paymentMethods'

echo -e "\n${GREEN}✓ Payment methods loaded${NC}\n"

sleep 1

# Step 17: Logout
echo -e "${YELLOW}Step 17: Logout${NC}"
curl -s -X POST "${API_BASE}/logout" -b cookies.txt | jq '.'

echo -e "\n${GREEN}✓ Logged out${NC}\n"

# Cleanup
rm -f cookies.txt

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Shopping Workflow Test Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "Summary:"
echo -e "- Logged in and validated session"
echo -e "- Browsed products with pagination and filtering"
echo -e "- Added products to cart"
echo -e "- Updated cart quantities"
echo -e "- Added payment method"
echo -e "- Completed checkout (Order: $ORDER_ID)"
echo -e "- Viewed order history"
echo -e "- Updated user profile"
echo -e "- Logged out\n"
