# ✅ Production Deployment Checklist

## Before Deployment

### Backend Changes
- [x] Updated `server.js` with serverless-compatible code
- [x] Fixed CORS configuration for production
- [x] Added MongoDB connection caching
- [x] Moved route registration outside `connectDB()`
- [x] Added comprehensive error handling
- [x] Added request logging for debugging
- [ ] Test locally: `cd backend && npm run dev`

### Frontend Changes
- [ ] Verify `NEXT_PUBLIC_API_URL` points to production backend
- [ ] Test registration form locally
- [ ] Check all API calls use correct base URL
- [ ] Test OAuth flows (Google, GitHub)

### Environment Variables

#### Backend (Vercel)
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `NODE_ENV` - Set to "production"
- [ ] `FRONTEND_URL` - Your frontend Vercel URL
- [ ] `BACKEND_URL` - Your backend Vercel URL
- [ ] `SSLCOMMERZ_STORE_ID`
- [ ] `SSLCOMMERZ_STORE_PASSWORD`
- [ ] `SSLCOMMERZ_IS_LIVE`
- [ ] `GEMINI_API_KEY`

#### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL
- [ ] `NEXT_PUBLIC_SOCKET_URL` - Socket server URL (if separate)
- [ ] `AUTH_SECRET`
- [ ] `AUTH_GOOGLE_ID`
- [ ] `AUTH_GOOGLE_SECRET`
- [ ] `AUTH_GITHUB_ID`
- [ ] `AUTH_GITHUB_SECRET`
- [ ] `GMAIL_USER`
- [ ] `GMAIL_APP_PASSWORD`

### MongoDB Atlas
- [ ] Network Access: Add `0.0.0.0/0` (allow all IPs)
- [ ] Database User: Verify permissions (readWrite)
- [ ] Connection String: Test connection
- [ ] Collections: Verify all collections exist

---

## Deployment Steps

### 1. Deploy Backend
```bash
cd backend
git add .
git commit -m "Fix: Production deployment issues"
git push origin main
```
- [ ] Push to GitHub
- [ ] Vercel auto-deploys
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

### 2. Test Backend Endpoints
```bash
# Health check
curl https://on-way-server.vercel.app/api/health

# Test registration
curl -X POST https://on-way-server.vercel.app/api/passenger \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```
- [ ] Health endpoint returns 200
- [ ] Registration endpoint returns 201
- [ ] Check Vercel function logs

### 3. Deploy Frontend
```bash
cd on-way
git add .
git commit -m "Update: Production API URL"
git push origin main
```
- [ ] Push to GitHub
- [ ] Vercel auto-deploys
- [ ] Wait for build to complete

### 4. Test Frontend
- [ ] Open production URL
- [ ] Test registration form
- [ ] Check browser console for errors
- [ ] Test login
- [ ] Test OAuth (Google, GitHub)
- [ ] Test other features

---

## Post-Deployment Testing

### Registration Flow
1. [ ] Go to `/register` page
2. [ ] Fill in registration form
3. [ ] Submit form
4. [ ] Check for success message
5. [ ] Verify user created in MongoDB
6. [ ] Try logging in with new account

### API Endpoints
- [ ] GET `/api/health` - Health check
- [ ] GET `/api/passenger` - Get all users
- [ ] GET `/api/passenger/find?email=test@test.com` - Find user
- [ ] POST `/api/passenger` - Register user
- [ ] GET `/api/blogs` - Get blogs
- [ ] GET `/api/rides` - Get rides
- [ ] POST `/api/bookings` - Create booking

### Error Scenarios
- [ ] Try registering with existing email
- [ ] Try registering without required fields
- [ ] Check error messages are user-friendly
- [ ] Verify errors logged in Vercel

---

## Monitoring

### Vercel Dashboard
- [ ] Check deployment status
- [ ] Review function logs
- [ ] Monitor error rates
- [ ] Check response times

### MongoDB Atlas
- [ ] Check connection count
- [ ] Monitor database size
- [ ] Review slow queries
- [ ] Check network activity

### Browser Console
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] API responses are correct

---

## Rollback Plan

If something goes wrong:

### Option 1: Revert Deployment
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments
4. Find previous working deployment
5. Click "..." → "Promote to Production"

### Option 2: Revert Code
```bash
git revert HEAD
git push origin main
```

### Option 3: Emergency Fix
1. Fix the issue locally
2. Test thoroughly
3. Push fix immediately
4. Monitor deployment

---

## Common Issues & Quick Fixes

### Issue: CORS Error
**Fix:** Add frontend URL to `FRONTEND_URL` env variable and redeploy

### Issue: MongoDB Connection Failed
**Fix:** Check MongoDB Atlas network access and connection string

### Issue: 404 Not Found
**Fix:** Verify API URL in frontend matches backend URL

### Issue: 500 Internal Server Error
**Fix:** Check Vercel function logs for detailed error

### Issue: Registration Fails Silently
**Fix:** Check browser console and Vercel logs

---

## Success Criteria

- ✅ Backend deploys without errors
- ✅ Frontend deploys without errors
- ✅ Health endpoint returns 200
- ✅ Registration works from frontend
- ✅ User data saved to MongoDB
- ✅ Login works with new account
- ✅ No CORS errors in browser
- ✅ No errors in Vercel logs
- ✅ All other APIs still work

---

## Support

If you encounter issues:

1. **Check Logs:**
   - Vercel function logs
   - Browser console
   - MongoDB Atlas logs

2. **Verify Configuration:**
   - Environment variables
   - CORS settings
   - MongoDB network access

3. **Test Locally:**
   - Run backend locally
   - Test with Postman
   - Check database directly

4. **Documentation:**
   - See `VERCEL_DEPLOYMENT_GUIDE.md`
   - See `SETUP_GUIDE.md`
