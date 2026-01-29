#!/bin/bash

# Quick Test Script for Database Implementation
# This script verifies the database and Docker setup work correctly

echo "========================================="
echo "Test-AccessControl Database Quick Test"
echo "========================================="
echo ""

# Test 1: Build
echo "Test 1: Building TypeScript..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi
echo ""

# Test 2: Database Stats
echo "Test 2: Checking database statistics..."
npm run db:stats
if [ $? -eq 0 ]; then
    echo "✅ Database accessible"
else
    echo "❌ Database check failed"
    exit 1
fi
echo ""

# Test 3: Export Credentials
echo "Test 3: Exporting user credentials..."
npm run db:export-users > /dev/null 2>&1
if [ -f "data/users-export.csv" ]; then
    USER_COUNT=$(wc -l < data/users-export.csv)
    echo "✅ Exported $USER_COUNT users (including header)"
    echo "First 5 users:"
    head -6 data/users-export.csv
else
    echo "❌ Export failed"
    exit 1
fi
echo ""

# Test 4: Docker Build (optional - can be slow)
read -p "Test Docker build? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Test 4: Building Docker image..."
    docker build -t test-accesscontrol:test . > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Docker image built successfully"
        docker images | grep test-accesscontrol | head -1
    else
        echo "❌ Docker build failed"
        exit 1
    fi
fi
echo ""

echo "========================================="
echo "✅ All tests passed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Start server: npm run dev"
echo "2. Or with Docker: docker-compose up -d"
echo "3. Test login: curl -X POST http://localhost:3000/api/cookie-session/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"user1@example.com\",\"password\":\"password123\"}'"
echo ""
echo "JMeter credentials: data/users-export.csv"
echo "Documentation: DATABASE.md, DOCKER.md, JMETER_GUIDE.md"
