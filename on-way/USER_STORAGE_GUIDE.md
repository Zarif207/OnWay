# User Storage System - Complete Guide

## 📋 Overview

The OnWay platform automatically stores user information in MongoDB when users register or log in for the first time. This guide explains how the system works and how to manage users.

---

## 🗄️ Database Structure

### Collection: `passenger` (users collection)

**Location:** MongoDB → Database: `onWayDB` → Collection: `passenger`

### User Document Schema:

```javascript
{
  _id: ObjectId("..."),           // MongoDB auto-generated ID
  name: "John Doe",               // User's full name
  email: "john@example.com",      // User's email (unique)
  phone: "+1234567890",           // Phone number (optional)
  image: "https://...",           // Profile image URL (optional)
  password: "$2a$10$...",          // Hashed password (only for credentials)
  role: "passenger",              // User role: admin, rider, passenger, supportAgent
  status: "Active",               // Account status: Active, Inactive, Suspended
  authProvider: "google",         // Auth method: credentials, google, github
  createdAt: ISODate("..."),      // Account creation timestamp
  lastLogin: ISODate("..."),      // Last login timestamp
}
```

---

## 🔄 How User Storage Works

### 1. Credentials Registration (Email/Password)

**Flow:**
```
User fills registration form
    ↓
Frontend sends POST to /api/passenger
    ↓
Backend checks if email exists
    ↓
If new: Hash password → Create user → Return success
If exists: Return error "User already exists"
```

**Code Location:** `backend/routes/passenger.js` → POST `/`

**Example Request:**
```javascript
POST http://localhost:4000/api/passenger
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "passenger"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "role": "passenger"
  }
}
```

---

### 2. OAuth Login (Google/GitHub)

**Flow:**
```
User clicks "Sign in with Google/GitHub"
    ↓
NextAuth handles OAuth flow
    ↓
signIn callback checks if user exists (GET /api/passenger/find)
    ↓
If new: Create user (POST /api/passenger)
If exists: Skip creation
    ↓
JWT callback fetches user data from DB
    ↓
Session includes user info with role
```

**Code Location:** `on-way/src/auth.js` → `callbacks.signIn`

**What Gets Stored:**
```javascript
{
  name: "John Doe",              // From OAuth provider
  email: "john@gmail.com",       // From OAuth provider
  image: "https://...",          // Profile picture from OAuth
  role: "passenger",             // Default role
  authProvider: "google",        // "google" or "github"
  createdAt: new Date(),
  lastLogin: new Date(),
  // No password field for OAuth users
}
```

---

### 3. Credentials Login (Existing User)

**Flow:**
```
User enters email/password
    ↓
NextAuth authorize() function called
    ↓
Backend checks if user exists (GET /api/passenger/find)
    ↓
If found: Compare password hash
If match: Return user data
If not match: Return error
    ↓
JWT callback stores user ID and role
    ↓
Session includes user info
```

**Code Location:** `on-way/src/auth.js` → `Credentials.authorize`

---

## 🔧 API Endpoints

### 1. Find User by Email
```
GET /api/passenger/find?email=user@example.com
```

**Response (User exists):**
```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "passenger",
  "image": "https://...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-15T10:30:00.000Z"
}
```

**Response (User not found):**
```javascript
null
```

---

### 2. Create User
```
POST /api/passenger
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",      // Optional (not for OAuth)
  "phone": "+1234567890",         // Optional
  "image": "https://...",         // Optional
  "role": "passenger",            // Optional (default: passenger)
  "authProvider": "credentials"   // Optional (default: credentials)
}
```

---

### 3. Update Last Login
```
PATCH /api/passenger/update-login
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**When Called:** Automatically on every successful login via NextAuth events

---

### 4. Get All Users
```
GET /api/passenger
```

**Response:**
```javascript
{
  "success": true,
  "data": [
    { "_id": "...", "name": "John", "email": "john@example.com", ... },
    { "_id": "...", "name": "Jane", "email": "jane@example.com", ... }
  ]
}
```

---

### 5. Update User
```
PUT /api/passenger/update/:id
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+9876543210",
  "role": "admin"
}
```

---

### 6. Delete User
```
DELETE /api/passenger/:id
```

---

### 7. Bulk Delete Users
```
POST /api/passenger/bulk-delete
Content-Type: application/json

{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

---

## 🔐 Security Features

### Password Security
- ✅ Passwords are hashed using bcrypt with 10 salt rounds
- ✅ Passwords are never stored in plain text
- ✅ Passwords are never returned in API responses
- ✅ OAuth users don't have passwords

### Duplicate Prevention
- ✅ Email uniqueness is checked before user creation
- ✅ Returns error if user already exists
- ✅ MongoDB can have unique index on email field

### Data Validation
- ✅ Email and name are required
- ✅ Password required for credentials registration
- ✅ Role defaults to "passenger" if not provided
- ✅ Invalid data returns 400 Bad Request

---

## 🧪 Testing User Storage

### Test 1: Create User via Credentials

```bash
# Create a new user
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "passenger"
  }'

# Expected: 201 Created with user ID
```

### Test 2: Check if User Exists

```bash
# Find user by email
curl "http://localhost:4000/api/passenger/find?email=test@example.com"

# Expected: User object or null
```

### Test 3: Try Creating Duplicate

```bash
# Try creating same user again
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'

# Expected: 400 Bad Request "User already exists"
```

### Test 4: OAuth Login

1. Start your Next.js app: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Check MongoDB - new user should be created automatically

### Test 5: Verify User in MongoDB

```bash
# Using MongoDB shell
mongosh "your-mongodb-connection-string"

use onWayDB
db.passenger.find({ email: "test@example.com" })

# Should show the user document
```

---

## 📊 User Roles

The system supports 4 user roles:

| Role | Description | Default Dashboard |
|------|-------------|-------------------|
| `passenger` | Regular users who book rides | `/dashboard/passenger` |
| `rider` | Drivers who provide rides | `/dashboard/rider` |
| `admin` | System administrators | `/dashboard/admin` |
| `supportAgent` | Customer support staff | `/dashboard/supportAgent` |

**Default Role:** All new users get `passenger` role by default.

**Changing Roles:** Use the update endpoint or admin dashboard.

---

## 🔄 User Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                         │
│              (Credentials or OAuth)                          │
└────────────────────────┬────────────────────────────────────┘
                         ↓
                ┌────────────────┐
                │ Check if user  │
                │ exists in DB   │
                └────────┬───────┘
                         ↓
                    ┌────┴────┐
                    │         │
              Exists         New
                    │         │
                    ↓         ↓
        ┌──────────────┐  ┌──────────────┐
        │ Skip creation│  │ Create user  │
        │ Use existing │  │ in MongoDB   │
        └──────┬───────┘  └──────┬───────┘
               │                 │
               └────────┬────────┘
                        ↓
              ┌──────────────────┐
              │ Generate JWT     │
              │ with user ID     │
              │ and role         │
              └─────────┬────────┘
                        ↓
              ┌──────────────────┐
              │ Create session   │
              │ Store in cookie  │
              └─────────┬────────┘
                        ↓
              ┌──────────────────┐
              │ User logged in   │
              │ Redirect to      │
              │ dashboard        │
              └──────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: User not being created on OAuth login

**Check:**
1. Backend server is running
2. `NEXT_PUBLIC_API_URL` is set correctly in `.env.local`
3. Check browser console for errors
4. Check backend logs for errors

**Solution:**
```bash
# Check backend logs
cd backend
npm start

# Check if API is accessible
curl http://localhost:4000/api/passenger
```

---

### Issue: Duplicate users being created

**Check:**
1. Email comparison is case-sensitive
2. MongoDB connection is stable

**Solution:**
```javascript
// Add unique index to email field in MongoDB
db.passenger.createIndex({ email: 1 }, { unique: true })
```

---

### Issue: Password not working after creation

**Check:**
1. Password is being hashed before storage
2. bcrypt.compare is used for verification

**Solution:** Check `backend/routes/passenger.js` line with `bcrypt.hash()`

---

### Issue: OAuth users can't log in

**Check:**
1. OAuth credentials are correct in `.env.local`
2. Callback URLs are configured in OAuth provider
3. User creation succeeds in signIn callback

**Solution:** Check NextAuth debug logs (set `debug: true` in auth.js)

---

## 📈 Monitoring

### Check User Count
```javascript
// In MongoDB shell
db.passenger.countDocuments()
```

### Check Recent Users
```javascript
// Last 10 users
db.passenger.find().sort({ createdAt: -1 }).limit(10)
```

### Check Users by Auth Provider
```javascript
// Count by provider
db.passenger.aggregate([
  { $group: { _id: "$authProvider", count: { $sum: 1 } } }
])
```

### Check Users by Role
```javascript
// Count by role
db.passenger.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Add unique index on email field in MongoDB
- [ ] Set up proper error logging (Sentry, LogRocket, etc.)
- [ ] Configure rate limiting on registration endpoint
- [ ] Set up email verification (optional)
- [ ] Configure password strength requirements
- [ ] Set up user activity monitoring
- [ ] Configure backup strategy for user data
- [ ] Test all user creation scenarios
- [ ] Verify GDPR compliance (if applicable)
- [ ] Set up user data export functionality

---

## 📞 Support

For issues related to user storage:

1. Check backend logs: `backend/server.js`
2. Check NextAuth logs: Set `debug: true` in `auth.js`
3. Check MongoDB connection
4. Verify API endpoints are accessible
5. Check environment variables

---

**Last Updated:** 2026-03-06  
**Status:** ✅ Fully Implemented and Working
