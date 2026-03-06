@echo off
REM OnWay User Storage Test Script (Windows)
REM This script tests the user storage functionality

setlocal enabledelayedexpansion

set API_URL=http://localhost:4000/api

echo.
echo ========================================
echo Testing OnWay User Storage System
echo ========================================
echo.

REM Test 1: Create a new user
echo Test 1: Creating new user...
curl -X POST "%API_URL%/passenger" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"testuser@example.com\",\"password\":\"test123456\",\"phone\":\"+1234567890\",\"role\":\"passenger\"}"
echo.
echo.

REM Test 2: Try to create duplicate user
echo Test 2: Attempting to create duplicate user...
curl -X POST "%API_URL%/passenger" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"testuser@example.com\",\"password\":\"test123456\"}"
echo.
echo.

REM Test 3: Find user by email
echo Test 3: Finding user by email...
curl "%API_URL%/passenger/find?email=testuser@example.com"
echo.
echo.

REM Test 4: Find non-existent user
echo Test 4: Finding non-existent user...
curl "%API_URL%/passenger/find?email=nonexistent@example.com"
echo.
echo.

REM Test 5: Get all users
echo Test 5: Getting all users...
curl "%API_URL%/passenger"
echo.
echo.

REM Test 6: Create OAuth user (simulated)
echo Test 6: Creating OAuth user (Google)...
curl -X POST "%API_URL%/passenger" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Google User\",\"email\":\"googleuser@gmail.com\",\"image\":\"https://lh3.googleusercontent.com/a/default-user\",\"role\":\"passenger\",\"authProvider\":\"google\"}"
echo.
echo.

REM Test 7: Validation - Missing required fields
echo Test 7: Testing validation (missing email)...
curl -X POST "%API_URL%/passenger" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Invalid User\",\"password\":\"test123\"}"
echo.
echo.

echo ========================================
echo Test Suite Complete!
echo ========================================
echo.
echo Note: To clean up test data, delete the test users from MongoDB:
echo   db.passenger.deleteMany({ email: { $in: ['testuser@example.com', 'googleuser@gmail.com'] } })
echo.

pause
