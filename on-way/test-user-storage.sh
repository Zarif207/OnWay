#!/bin/bash

# OnWay User Storage Test Script
# This script tests the user storage functionality

API_URL="${API_URL:-http://localhost:4000/api}"

echo "🧪 Testing OnWay User Storage System"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create a new user
echo "📝 Test 1: Creating new user..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/passenger" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "test123456",
    "phone": "+1234567890",
    "role": "passenger"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ PASS${NC} - User created successfully"
  echo "Response: $BODY"
else
  echo -e "${RED}❌ FAIL${NC} - Expected 201, got $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 2: Try to create duplicate user
echo "📝 Test 2: Attempting to create duplicate user..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/passenger" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "test123456"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}✅ PASS${NC} - Duplicate prevention working"
  echo "Response: $BODY"
else
  echo -e "${RED}❌ FAIL${NC} - Expected 400, got $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 3: Find user by email
echo "📝 Test 3: Finding user by email..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/passenger/find?email=testuser@example.com")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && [ "$BODY" != "null" ]; then
  echo -e "${GREEN}✅ PASS${NC} - User found successfully"
  echo "Response: $BODY"
else
  echo -e "${RED}❌ FAIL${NC} - User not found"
  echo "Response: $BODY"
fi
echo ""

# Test 4: Find non-existent user
echo "📝 Test 4: Finding non-existent user..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/passenger/find?email=nonexistent@example.com")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && [ "$BODY" = "null" ]; then
  echo -e "${GREEN}✅ PASS${NC} - Correctly returns null for non-existent user"
else
  echo -e "${RED}❌ FAIL${NC} - Expected null response"
  echo "Response: $BODY"
fi
echo ""

# Test 5: Get all users
echo "📝 Test 5: Getting all users..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/passenger")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ PASS${NC} - Users retrieved successfully"
  USER_COUNT=$(echo "$BODY" | grep -o '"email"' | wc -l)
  echo "Total users: $USER_COUNT"
else
  echo -e "${RED}❌ FAIL${NC} - Failed to retrieve users"
  echo "Response: $BODY"
fi
echo ""

# Test 6: Create OAuth user (simulated)
echo "📝 Test 6: Creating OAuth user (Google)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/passenger" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google User",
    "email": "googleuser@gmail.com",
    "image": "https://lh3.googleusercontent.com/a/default-user",
    "role": "passenger",
    "authProvider": "google"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ PASS${NC} - OAuth user created successfully"
  echo "Response: $BODY"
else
  echo -e "${RED}❌ FAIL${NC} - Expected 201, got $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 7: Validation - Missing required fields
echo "📝 Test 7: Testing validation (missing email)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/passenger" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid User",
    "password": "test123"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}✅ PASS${NC} - Validation working correctly"
  echo "Response: $BODY"
else
  echo -e "${RED}❌ FAIL${NC} - Expected 400, got $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Summary
echo "===================================="
echo "🎉 Test Suite Complete!"
echo ""
echo -e "${YELLOW}Note:${NC} To clean up test data, delete the test users from MongoDB:"
echo "  db.passenger.deleteMany({ email: { \$in: ['testuser@example.com', 'googleuser@gmail.com'] } })"
echo ""
