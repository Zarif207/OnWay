# 🚀 Vercel Deployment Guide - OnWay Project

## 🔍 Issues Fixed

### 1. **CORS Configuration**
- ✅ Added proper CORS with origin whitelist
- ✅ Enabled credentials support
- ✅ Added all necessary HTTP methods

### 2. **Serverless Architecture**
- ✅ Routes now registered OUTSIDE `connectDB()`
- ✅ MongoDB connection caching for performance
- ✅ Collections attached to `req` object

### 3. **Error Handling**
- ✅ Comprehensive logging for debugging
- ✅ Proper error responses with status codes
- ✅ Development vs Production error details

### 4. **Registration Endpoint**
- ✅ Enhanced validation
- ✅ Better error messages
- ✅ Request logging for debugging

---

## 📋 Vercel Environment Variables

### Backend (on-way-server)

Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add these variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://onWayDB:QbhWGvUOxNbCnaOf@cluster0.idgaye3.mongodb.net/?appName=Cluster0

# Server Configuration
PORT=4000
NODE_ENV=production

# URLs
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKEND_URL=https://on-way-server.vercel.app

# SSLCommerz
SSLCOMMERZ_STORE_ID=onway69a329479017c
SSLCOMMERZ_STORE_PASSWORD=onway69a329479017c@ssl
SSLCOMMERZ_IS_LIVE=false

# Gemini API
GEMINI_API_KEY=AIzaSyAnyK6_m6VZu-K_13ijVi5jCKkUF0W1cgI
```

### Frontend (on-way)

Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=https://on-way-server.vercel.app/api

# Socket Server (if separate)
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app

# Auth Secrets
AUTH_SECRET=2e7596d529cbd892e182a30906f8d86d

# Google OAuth
AUTH_GOOGLE_ID=305865279458-ttejmqe6pv3r6qfn5ad2hf2c55a6l6js.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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

# GitHub OAuth
AUTH_GITHUB_ID=Ov23liEsXNOUpwtbVlUh
AUTH_GITHUB_SECRET=d2e909ba307d066f6ae4cc3a50b360ce5d7247a1

# Gmail
GMAIL_USER=shouravhasanshurjo075@gmail.com
GMAIL_APP_PASSWORD=npap eaey zqpp nceg
```

---

## 🔧 Deployment Steps

### Step 1: Update Backend Code

```bash
cd backend
# The server.js has been updated with fixes
git add .
git commit -m "Fix: Vercel serverless compatibility and CORS"
git push origin main
```

### Step 2: Redeploy on Vercel

1. Go to Vercel Dashboard
2. Select your backend project
3. Click "Redeploy" or push will auto-deploy
4. Wait for deployment to complete

### Step 3: Test Backend

```bash
# Test health endpoint
curl https://on-way-server.vercel.app/api/health

# Test register endpoint
curl -X POST https://on-way-server.vercel.app/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "phone": "1234567890"
  }'
```

### Step 4: Check Logs

Go to Vercel Dashboard → Your Project → Deployments → Click latest → View Function Logs

Look for:
- ✅ MongoDB connected
- 📝 Register request received
- ✅ User created successfully

---

## 🐛 Debugging Production Issues

### Enable Detailed Logging

The updated code includes console.log statements. View them in Vercel:

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on the latest deployment
5. Click "View Function Logs"

### Common Issues & Solutions

#### Issue 1: CORS Error
```
Access to fetch at 'https://on-way-server.vercel.app/api/passenger' 
from origin 'https://your-frontend.vercel.app' has been blocked by CORS
```

**Solution:**
- Add your frontend URL to `FRONTEND_URL` environment variable in Vercel
- Redeploy backend

#### Issue 2: MongoDB Connection Timeout
```
MongoServerSelectionError: connection timed out
```

**Solution:**
- Check MongoDB Atlas Network Access
- Add `0.0.0.0/0` to allow all IPs (or Vercel IPs)
- Verify `MONGODB_URI` in Vercel environment variables

#### Issue 3: 404 Not Found
```
{"success":false,"message":"Route not found"}
```

**Solution:**
- Verify the API URL in frontend: `https://on-way-server.vercel.app/api/passenger`
- Check `vercel.json` routes configuration
- Ensure all routes start with `/api/`

#### Issue 4: 500 Internal Server Error
```
{"success":false,"message":"Registration failed"}
```

**Solution:**
- Check Vercel Function Logs for detailed error
- Verify all environment variables are set
- Check MongoDB connection string

---

## 🧪 Testing Registration

### Using Browser Console

```javascript
fetch('https://on-way-server.vercel.app/api/passenger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    phone: '1234567890'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Using Postman

1. Method: POST
2. URL: `https://on-way-server.vercel.app/api/passenger`
3. Headers:
   - `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "phone": "1234567890"
}
```

---

## 📊 Monitoring

### Check Backend Health

```bash
curl https://on-way-server.vercel.app/api/health
```

Expected response:
```json
{
  "status": "onWay Backend running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Check All Routes

```bash
# Get all passengers
curl https://on-way-server.vercel.app/api/passenger

# Find user by email
curl "https://on-way-server.vercel.app/api/passenger/find?email=test@example.com"

# Health check
curl https://on-way-server.vercel.app/api/health
```

---

## 🔐 Security Checklist

- ✅ CORS configured with specific origins
- ✅ Environment variables stored in Vercel (not in code)
- ✅ Passwords hashed with bcrypt
- ✅ MongoDB connection string not exposed
- ✅ Error messages don't leak sensitive info in production
- ✅ Request size limits set (10mb)

---

## 📝 Next Steps

1. **Test Registration** - Try registering a new user from your frontend
2. **Monitor Logs** - Check Vercel function logs for any errors
3. **Test Other APIs** - Verify all other endpoints still work
4. **Update Frontend** - Ensure frontend uses correct API URL
5. **Test OAuth** - Verify Google/GitHub login still works

---

## 🆘 Still Having Issues?

If registration still fails:

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments → View Function Logs
   - Look for error messages

2. **Verify Environment Variables:**
   - Ensure `MONGODB_URI` is correct
   - Ensure `FRONTEND_URL` matches your frontend domain

3. **Test Locally:**
   ```bash
   cd backend
   npm run dev
   # Try registration on localhost:4000
   ```

4. **Check MongoDB Atlas:**
   - Network Access → Add `0.0.0.0/0`
   - Database Access → Verify user permissions

5. **Contact Support:**
   - Share Vercel function logs
   - Share exact error message from browser console
