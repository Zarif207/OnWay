# 🚀 Quick Reference - Production Deployment

## 📋 What Was Fixed

| Issue | Solution |
|-------|----------|
| Routes not working in Vercel | Moved route registration outside `connectDB()` |
| CORS errors | Added proper CORS configuration with origin whitelist |
| Slow responses | Implemented MongoDB connection caching |
| Can't debug production | Added comprehensive logging |
| Registration fails | Enhanced validation and error handling |

---

## 🔗 Important URLs

### Production
- **Frontend:** https://your-frontend.vercel.app
- **Backend:** https://on-way-server.vercel.app
- **API Base:** https://on-way-server.vercel.app/api

### Local Development
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000
- **Socket Server:** http://localhost:4001

---

## 🧪 Quick Tests

### Test Backend Health
```bash
curl https://on-way-server.vercel.app/api/health
```

### Test Registration
```bash
curl -X POST https://on-way-server.vercel.app/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "phone": "1234567890"
  }'
```

### Test in Browser Console
```javascript
fetch('https://on-way-server.vercel.app/api/passenger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123'
  })
})
.then(r => r.json())
.then(console.log)
```

---

## 🔧 Environment Variables

### Backend (Vercel)
```env
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://on-way-server.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://on-way-server.vercel.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
```

---

## 📊 Monitoring

### Check Vercel Logs
1. Vercel Dashboard → Project → Deployments
2. Click latest deployment
3. Click "View Function Logs"

### Check MongoDB
1. MongoDB Atlas → Clusters
2. Click "Metrics"
3. Check connections and operations

---

## 🐛 Common Errors & Fixes

### CORS Error
```
Access-Control-Allow-Origin header is missing
```
**Fix:** Add frontend URL to `FRONTEND_URL` env variable

### 404 Not Found
```
{"success":false,"message":"Route not found"}
```
**Fix:** Ensure URL includes `/api/` prefix

### 500 Internal Error
```
{"success":false,"message":"Registration failed"}
```
**Fix:** Check Vercel function logs for details

### MongoDB Timeout
```
MongoServerSelectionError: connection timed out
```
**Fix:** Add `0.0.0.0/0` to MongoDB Atlas Network Access

---

## 🚀 Deploy Commands

### Deploy Backend
```bash
cd backend
git add .
git commit -m "Fix: Production issues"
git push origin main
```

### Deploy Frontend
```bash
cd on-way
git add .
git commit -m "Update: API URL"
git push origin main
```

---

## 📞 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/passenger` | Get all users |
| GET | `/api/passenger/find?email=` | Find user |
| POST | `/api/passenger` | Register user |
| GET | `/api/blogs` | Get blogs |
| GET | `/api/rides` | Get rides |
| POST | `/api/bookings` | Create booking |

---

## ✅ Success Indicators

- ✅ Health endpoint returns `{"status":"onWay Backend running"}`
- ✅ Registration returns `{"success":true,"message":"User registered successfully"}`
- ✅ No CORS errors in browser console
- ✅ Logs show "✅ User created successfully"
- ✅ User appears in MongoDB

---

## 📚 Documentation

- **Full Guide:** `VERCEL_DEPLOYMENT_GUIDE.md`
- **Checklist:** `PRODUCTION_CHECKLIST.md`
- **Fixes Summary:** `FIXES_SUMMARY.md`
- **Setup Guide:** `SETUP_GUIDE.md`

---

## 🆘 Emergency Rollback

### Option 1: Vercel Dashboard
1. Go to Deployments
2. Find previous working version
3. Click "..." → "Promote to Production"

### Option 2: Git Revert
```bash
git revert HEAD
git push origin main
```

---

## 💡 Pro Tips

1. **Always test locally first** before deploying
2. **Check Vercel logs** immediately after deployment
3. **Use browser console** to see client-side errors
4. **Test with Postman** to isolate frontend issues
5. **Monitor MongoDB** for connection issues

---

## 🎯 Next Steps

1. [ ] Deploy updated backend code
2. [ ] Set environment variables in Vercel
3. [ ] Test health endpoint
4. [ ] Test registration endpoint
5. [ ] Test from frontend
6. [ ] Monitor logs for errors
7. [ ] Test all other features

---

## 📞 Support

If you need help:
1. Check the detailed guides in this repo
2. Review Vercel function logs
3. Test locally to isolate the issue
4. Check MongoDB Atlas logs
5. Verify all environment variables
