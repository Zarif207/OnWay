# User Storage - Quick Reference

## 🎯 TL;DR

Your user storage system is **already fully implemented and working**! Users are automatically saved to MongoDB on registration/login.

---

## 📊 Database Info

- **Database:** `onWayDB`
- **Collection:** `passenger` (users collection)
- **Connection:** Configured in `backend/server.js`

---

## 🔑 User Schema

```javascript
{
  _id: ObjectId,
  name: String,              // Required
  email: String,             // Required, unique
  password: String,          // Hashed (credentials only)
  phone: String,             // Optional
  image: String,             // Optional
  role: String,              // Default: "passenger"
  status: String,            // Default: "Active"
  authProvider: String,      // "credentials", "google", "github"
  createdAt: Date,
  lastLogin: Date
}
```

---

## 🚀 Quick Test

```bash
# Create user
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Find user
curl "http://localhost:4000/api/passenger/find?email=test@test.com"

# Get all users
curl http://localhost:4000/api/passenger
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `on-way/src/auth.js` | NextAuth config with user storage |
| `backend/routes/passenger.js` | User CRUD operations |
| `backend/server.js` | MongoDB connection |

---

## 🔄 How It Works

### OAuth (Google/GitHub):
```
Login → Check if exists → Create if new → Session created
```

### Credentials:
```
Register → Hash password → Create user → Login → Session created
```

---

## 🎨 User Roles

- `passenger` (default)
- `rider`
- `admin`
- `supportAgent`

---

## 🔧 API Endpoints

```
GET    /api/passenger              - Get all users
GET    /api/passenger/find?email=  - Find by email
POST   /api/passenger              - Create user
PATCH  /api/passenger/update-login - Update last login
PUT    /api/passenger/update/:id   - Update user
DELETE /api/passenger/:id          - Delete user
```

---

## ✅ What's Working

✅ Automatic user creation  
✅ Credentials registration  
✅ OAuth (Google/GitHub)  
✅ Password hashing  
✅ Duplicate prevention  
✅ Role-based access  
✅ Last login tracking  

---

## 📚 Full Documentation

- **USER_STORAGE_GUIDE.md** - Complete guide
- **USER_STORAGE_SUMMARY.md** - Detailed overview
- **test-user-storage.sh/.bat** - Test scripts

---

## 🐛 Quick Debug

```bash
# Check backend is running
curl http://localhost:4000/api/passenger

# Check MongoDB connection
# Look for "✅ MongoDB connected" in backend logs

# Check user count
mongosh "your-connection-string"
use onWayDB
db.passenger.countDocuments()
```

---

## 🎉 Status

**Implementation:** ✅ Complete  
**Testing:** ✅ Ready  
**Production:** ✅ Ready  

No additional work needed!
