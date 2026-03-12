# Notification System Testing Guide

## Quick Start

### 1. Start All Servers

```bash
# Terminal 1: Backend Server
cd backend
node server.js
# Should show: ✅ Socket.io ready for notifications

# Terminal 2: Socket Server
cd socket-server
node server.js
# Should show: 🚀 Socket.io server running on http://localhost:4001

# Terminal 3: Frontend
cd on-way
npm run dev
# Should show: Ready on http://localhost:3000
```

### 2. Login as Admin

1. Open browser: `http://localhost:3000`
2. Login with admin credentials
3. Navigate to admin dashboard
4. Check notification bell icon in navbar

### 3. Run Test Script

```bash
# In project root directory
node test-notification.js
```

This will:
- Create a test user (triggers notification)
- Create a test rider (triggers notification)
- Create a test booking (triggers notification)

### 4. Verify Notifications

Check admin dashboard navbar:
- Notification bell should show badge count (3)
- Click bell to see notification dropdown
- Should see 3 new notifications:
  - "New user registered: Test User..."
  - "New rider registered: Test Rider... - Pending approval"
  - "New booking created: Dhaka Airport → Gulshan Circle 1"

## Manual Testing

### Test User Registration

```bash
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'
```

Expected:
- Response: `{ "success": true, "message": "User created successfully" }`
- Admin notification: "New user registered: John Doe (john@example.com)"

### Test Rider Registration

```bash
curl -X POST http://localhost:4000/api/riders \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "9876543210"
  }'
```

Expected:
- Response: `{ "success": true, "message": "Rider registered successfully" }`
- Admin notification: "New rider registered: Jane Smith - Pending approval"

### Test Booking Creation

```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": {"address": "Location A", "lat": 23.8103, "lng": 90.4125},
    "dropoffLocation": {"address": "Location B", "lat": 23.8203, "lng": 90.4225},
    "routeGeometry": "encoded_polyline",
    "distance": 5.2,
    "duration": 15,
    "price": 150
  }'
```

Expected:
- Response: `{ "success": true, "booking": {...} }`
- Admin notification: "New booking created: Location A → Location B"

## Troubleshooting

### Issue: Notifications not appearing

**Check 1: Backend Server Logs**
```bash
# Should see:
✅ Socket.io instance set in notification helper
✅ Socket.io initialized for backend notifications
🚀 Server running on port 4000
🔔 Socket.io ready for notifications
```

**Check 2: Socket Server Logs**
```bash
# Should see:
🚀 Socket.io server running on http://localhost:4001
🔐 Authentication: ENABLED
📊 Admin monitoring: ACTIVE
💾 Database persistence: ENABLED
```

**Check 3: Frontend Console**
```javascript
// Open browser console (F12)
// Should see:
🔌 Socket connected: <socket_id>
✅ Authenticated as: admin
✅ Joined notification room: { userId: '...', message: '...' }
```

**Check 4: Database**
```javascript
// In MongoDB
db.notifications.find().sort({ createdAt: -1 }).limit(5)
// Should show recent notifications
```

### Issue: Socket connection error

**Solution 1: Check environment variables**
```bash
# on-way/.env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001

# socket-server/.env
SOCKET_PORT=4001
NODE_ENV=development
```

**Solution 2: Restart socket server**
```bash
cd socket-server
node server.js
```

### Issue: Admin not receiving notifications

**Check 1: Admin role in database**
```javascript
// In MongoDB
db.passenger.findOne({ email: "admin@example.com" })
// Should have: role: "admin" or role: "supportAgent"
```

**Check 2: Socket authentication**
```javascript
// In browser console
console.log("Socket connected:", socket.connected);
console.log("Socket authenticated:", socket.authenticated);
```

## Browser Console Commands

### Check socket connection
```javascript
// In admin dashboard, open console (F12)
console.log("Socket connected:", socket?.connected);
```

### Manually trigger notification
```javascript
// This won't work from browser, but shows the structure
socket.emit("sendNotification", {
  userId: "admin_user_id",
  message: "Test notification",
  type: "system_alert",
  metadata: {}
});
```

### Check notification state
```javascript
// In React DevTools, find useNotifications hook
// Check state:
// - notifications: array of notification objects
// - unreadCount: number
// - connected: boolean
```

## Expected Behavior

### When User Registers:
1. User data saved to `passenger` collection
2. Notification saved to `notifications` collection
3. Socket emits to all admin users
4. Admin dashboard receives notification
5. Unread count increments
6. Notification appears in dropdown

### When Rider Registers:
1. Rider data saved to `riders` collection
2. Notification saved to `notifications` collection
3. Socket emits to all admin users
4. Admin dashboard receives notification
5. Unread count increments
6. Notification appears in dropdown

### When Booking Created:
1. Booking data saved to `bookings` collection
2. Notification saved to `notifications` collection
3. Socket emits to all admin users
4. Admin dashboard receives notification
5. Unread count increments
6. Notification appears in dropdown

## Performance Testing

### Load Test (Multiple Notifications)
```bash
# Run test script multiple times
for i in {1..10}; do node test-notification.js; sleep 2; done
```

Expected:
- All notifications should appear in admin dashboard
- No duplicate notifications
- Unread count should be accurate
- No performance degradation

## Database Verification

### Check notifications collection
```javascript
// In MongoDB
db.notifications.find().sort({ createdAt: -1 }).limit(10)
```

Expected fields:
- `userId`: Admin user ID
- `message`: Notification message
- `type`: Notification type (user_registration, rider_registration, booking_created)
- `metadata`: Additional data
- `isRead`: false (for new notifications)
- `createdAt`: Timestamp
- `sentBy`: "system"

### Check admin users
```javascript
// In MongoDB
db.passenger.find({ role: { $in: ["admin", "supportAgent"] } })
```

Should return at least one admin user.

## Success Criteria

✅ Backend server starts without errors
✅ Socket server starts without errors
✅ Frontend connects to socket server
✅ Admin can login and access dashboard
✅ Test script creates events successfully
✅ Notifications appear in admin dashboard
✅ Unread count updates correctly
✅ Notifications saved to database
✅ No console errors in browser
✅ Real-time updates work without page refresh

## Next Steps

After successful testing:
1. Test with multiple admin users
2. Test notification marking as read
3. Test notification deletion
4. Test browser notifications (if enabled)
5. Test with production environment variables

---

**Last Updated:** March 8, 2026
**Version:** 1.0.0
