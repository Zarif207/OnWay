#!/bin/bash

# API Testing Script for OnWay Backend

API_URL="https://on-way-server.vercel.app/api"
LOCAL_URL="http://localhost:4000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 OnWay API Testing Script"
echo "============================"
echo ""

# Ask which environment to test
echo "Select environment to test:"
echo "1) Production (Vercel)"
echo "2) Local Development"
read -p "Enter choice (1 or 2): " env_choice

if [ "$env_choice" == "2" ]; then
    BASE_URL=$LOCAL_URL
    echo "Testing LOCAL environment: $BASE_URL"
else
    BASE_URL=$API_URL
    echo "Testing PRODUCTION environment: $BASE_URL"
fi

echo ""
echo "================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $http_code"
    echo "Response: $body"
else
    echo -e "${RED}❌ FAILED${NC} - Status: $http_code"
    echo "Response: $body"
fi

echo ""
echo "================================"
echo ""

# Test 2: Test Endpoint
echo "Test 2: Test Endpoint"
echo "---------------------"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/test")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $http_code"
    echo "Response: $body"
else
    echo -e "${RED}❌ FAILED${NC} - Status: $http_code"
    echo "Response: $body"
fi

echo ""
echo "================================"
echo ""

# Test 3: Get All Passengers
echo "Test 3: Get All Passengers"
echo "--------------------------"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/passenger")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $http_code"
    echo "Response: ${body:0:200}..." # Show first 200 chars
else
    echo -e "${RED}❌ FAILED${NC} - Status: $http_code"
    echo "Response: $body"
fi

echo ""
echo "================================"
echo ""

# Test 4: Register New User
echo "Test 4: Register New User"
echo "-------------------------"
timestamp=$(date +%s)
test_email="test_$timestamp@example.com"

response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/passenger" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User $timestamp\",
    \"email\": \"$test_email\",
    \"password\": \"test123\",
    \"phone\": \"1234567890\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "201" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $http_code"
    echo "Response: $body"
    echo "Test email: $test_email"
else
    echo -e "${RED}❌ FAILED${NC} - Status: $http_code"
    echo "Response: $body"
fi

echo ""
echo "================================"
echo ""

# Test 5: Find User by Email
echo "Test 5: Find User by Email"
echo "--------------------------"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/passenger/find?email=$test_email")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $http_code"
    echo "Response: $body"
elif [ "$http_code" == "404" ]; then
    echo -e "${YELLOW}⚠️  NOT FOUND${NC} - Status: $http_code (User may not exist yet)"
    echo "Response: $body"
else
    echo -e "${RED}❌ FAILED${NC} - Status: $http_code"
    echo "Response: $body"
fi

echo ""
echo "================================"
echo ""

# Test 6: Register Duplicate User (Should Fail)
echo "Test 6: Register Duplicate User (Should Fail)"
echo "----------------------------------------------"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/passenger" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$test_email\",
    \"password\": \"test123\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "400" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $http_code (Correctly rejected duplicate)"
    echo "Response: $body"
else
    echo -e "${RED}❌ FAILED${NC} - Status: $http_code (Should return 400)"
    echo "Response: $body"
fi

echo ""
echo "================================"
echo ""

# Test 7: Register Without Required Fields (Should Fail)
echo "Test 7: Register Without Required Fields (Should Fail)"
echo "-------------------------------------------------------"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/passenger" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "400" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $http_code (Correctly rejected incomplete data)"
    echo "Response: $body"
else
    echo -e "${RED}❌ FAILED${NC} - Status: $http_code (Should return 400)"
    echo "Response: $body"
fi

echo ""
echo "================================"
echo ""

# Test 8: Get All Riders
echo "Test 8: Get All Riders"
echo "----------------------"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/riders")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Status: $http_code"
    echo "Response: ${body:0:200}..." # Show first 200 chars
else
    echo -e "${RED}❌ FAILED${NC} - Status: $http_code"
    echo "Response: $body"
fi

echo ""
echo "================================"
echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo ""
echo "Environment: $BASE_URL"
echo "Test email used: $test_email"
echo ""
echo "✅ Check the results above"
echo "✅ All critical endpoints tested"
echo ""
echo "Next Steps:"
echo "1. If any tests failed, check Vercel function logs"
echo "2. Verify MongoDB connection"
echo "3. Check CORS settings if testing from browser"
echo ""
