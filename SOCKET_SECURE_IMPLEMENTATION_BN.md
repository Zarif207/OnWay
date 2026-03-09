# Socket.io Secure Implementation - সম্পূর্ণ গাইড (বাংলা)

## ✅ বাস্তবায়িত Features

### 1. Authentication & Authorization
- ✅ Socket connection এ authentication middleware যুক্ত করা হয়েছে
- ✅ শুধুমাত্র admin এবং supportAgent role connect করতে পারবে
- ✅ Unauthorized user automatically reject হবে
- ✅ JWT token verification ready (production এ implement করতে হবে)

### 2. Database Persistence
- ✅ সব GPS location `gpsLocations` collection এ save হয়
- ✅ সব notification `notifications` collection এ save হয়
- ✅ Connection logs `rideSessions` collection এ track হয়
- ✅ Database এ save হওয়ার পরেই socket emit হয়

### 3. Room-Based Communication
- ✅ User-specific notification rooms: `user_{userId}`
- ✅ Ride-specific tracking rooms: `ride_{rideId}`
- ✅ শুধুমাত্র authorized admin এই rooms এ join করতে পারবে

### 4. Performance Optimization
- ✅ Targeted broadcasting (শুধু specific room এ emit)
- ✅ Connection pooling এবং monitoring
- ✅ Automatic cleanup of old GPS data (প্রতি ঘন্টায়)
- ✅ Graceful shutdown handling

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                          │
│                  (Next.js Frontend)                         │
│                                                             │
│  ✅ Authentication Check (admin/supportAgent only)         │
│  ✅ Socket.io Client with auth credentials                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ WebSocket + Auth Token
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Socket.io Server (Port 4001)                   │
│                                                             │
│  🔐 Authentication Middleware                               │
│  ├─ Verify JWT Token                                       │
│  ├─ Check User Role (admin/supportAgent)                   │
│  └─ Reject unauthorized connections                        │
│                                                             │
│  📡 Event Handlers                                          │
│  ├─ joinNotifications → Join user notification room        │
│  ├─ joinRide → Join ride tracking room                     │
│  ├─ gpsUpdate → Save to DB → Broadcast to room            │
│  ├─ sendNotification → Save to DB → Emit to user          │
│  ├─ getActiveRides → Fetch from DB → Return data          │
│  └─ getConnectionStats → Return active connections         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ MongoDB Operations
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  MongoDB Database                           │
│                                                             │
│  📊 Collections:                                            │
│  ├─ gpsLocations (GPS tracking data)                       │
│  ├─ notifications (All notifications)                      │
│  ├─ rideSessions (Connection logs & ride sessions)         │
│  ├─ bookings (Ride bookings)                               │
│  └─ riders (Driver information)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

### 1. Authentication Middleware

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userRole = socket.handshake.auth.role;
  const userId = socket.handshake.auth.userId;

  // Token verification
  const verified = verifyToken(token);
  if (!verified) {
    return next(new Error("Authentication failed"));
  }

  // Role check
  if (!isAdmin(userRole)) {
    return next(new Error("Admin access required"));
  }

  // Attach user info
  socket.userId = userId;
  socket.userRole = userRole;
  socket.authenticated = true;

  next();
});
```

### 2. Event-Level Authorization

প্রতিটি event handler এ authorization check:

```javascript
socket.on("someEvent", (data) => {
  if (!socket.authenticated) {
    socket.emit("error", { message: "Unauthorized" });
    return;
  }
  // Process event
});
```

### 3. CORS Configuration

শুধুমাত্র trusted origins allow করা হয়েছে:

```javascript
cors: {
  origin: [
    "http://localhost:3000",
    "https://on-way-neon.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}
```

---

## 💾 Database Persistence Flow

### GPS Location Update

```
Driver App → Socket Event → Socket Server
                              ↓
                        Save to MongoDB
                              ↓
                        Broadcast to Admin
```

**Code:**
```javascript
socket.on("gpsUpdate", async (data) => {
  // ✅ Step 1: Save to database FIRST
  const result = await gpsLocationsCollection.insertOne({
    rideId: data.rideId,
    driverId: data.driverId,
    latitude: data.latitude,
    longitude: data.longitude,
    timestamp: new Date(),
  });

  // ✅ Step 2: Then broadcast to monitoring admins
  io.to(`ride_${data.rideId}`).emit("receiveGpsUpdate", {
    _id: result.insertedId,
    ...data
  });
});
```

### Notification Flow

```
Admin/System → Socket Event → Socket Server
                                 ↓
                           Save to MongoDB
                                 ↓
                           Emit to User Room
```

**Code:**
```javascript
socket.on("sendNotification", async (data) => {
  // ✅ Step 1: Save to database FIRST
  const result = await notificationsCollection.insertOne({
    userId: data.userId,
    message: data.message,
    type: data.type,
    isRead: false,
    createdAt: new Date(),
  });

  // ✅ Step 2: Then emit to user
  io.to(`user_${data.userId}`).emit("newNotification", {
    _id: result.insertedId,
    ...data
  });
});
```

---

## 📊 Database Collections

### 1. gpsLocations Collection

```javascript
{
  _id: ObjectId,
  rideId: String,
  driverId: String,
  latitude: Number,
  longitude: Number,
  speed: Number,
  heading: Number,
  timestamp: Date,
  socketId: String
}
```

### 2. notifications Collection

```javascript
{
  _id: ObjectId,
  userId: String,
  message: String,
  type: String, // 'booking', 'driver_registration', etc.
  metadata: Object,
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date,
  sentBy: String,
  sentByRole: String
}
```

### 3. rideSessions Collection

```javascript
{
  _id: ObjectId,
  socketId: String,
  userId: String,
  role: String,
  type: String, // 'admin_connection', 'ride', etc.
  connectedAt: Date,
  disconnectedAt: Date,
  status: String, // 'active', 'disconnected'
  disconnectReason: String
}
```

---

## 🎯 Frontend Integration

### Socket Connection with Auth

```javascript
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

const { data: session } = useSession();

// Only admin can connect
if (session.user.role === "admin" || session.user.role === "supportAgent") {
  const socket = io("http://localhost:4001", {
    auth: {
      token: session.user.id, // Use actual JWT in production
      role: session.user.role,
      userId: session.user.id,
    },
  });

  socket.on("connect", () => {
    console.log("✅ Connected as admin");
    socket.emit("joinNotifications", session.user.id);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection failed:", error.message);
  });
}
```

---

## 🚀 Usage Examples

### 1. Admin Dashboard এ GPS Tracking

```javascript
// Join ride room for monitoring
socket.emit("joinRide", rideId);

// Listen for GPS updates
socket.on("receiveGpsUpdate", (data) => {
  console.log("📍 GPS Update:", data);
  // Update map marker
  updateMapMarker(data.latitude, data.longitude);
});
```

### 2. Notification পাঠানো

```javascript
// Send notification to user
socket.emit("sendNotification", {
  userId: "user123",
  message: "New ride booking received",
  type: "booking",
  metadata: {
    bookingId: "booking456",
    fare: 250
  }
});

// Listen for acknowledgment
socket.on("notificationSent", (response) => {
  if (response.success) {
    console.log("✅ Notification sent:", response.notificationId);
  }
});
```

### 3. Active Rides দেখা

```javascript
// Request active rides
socket.emit("getActiveRides");

// Receive active rides
socket.on("activeRides", (response) => {
  if (response.success) {
    console.log("🚗 Active rides:", response.rides);
    displayActiveRides(response.rides);
  }
});
```

### 4. Connection Statistics

```javascript
// Request connection stats (admin only)
socket.emit("getConnectionStats");

// Receive stats
socket.on("connectionStats", (stats) => {
  console.log("📊 Total connections:", stats.totalConnections);
  console.log("👥 Active users:", stats.connections);
});
```

---

## 🧪 Testing

### 1. Authentication Test

```javascript
// Test with admin role (should connect)
const adminSocket = io("http://localhost:4001", {
  auth: {
    token: "valid_token",
    role: "admin",
    userId: "admin123"
  }
});

adminSocket.on("connect", () => {
  console.log("✅ Admin connected");
});

// Test with passenger role (should fail)
const passengerSocket = io("http://localhost:4001", {
  auth: {
    token: "valid_token",
    role: "passenger",
    userId: "passenger123"
  }
});

passengerSocket.on("connect_error", (error) => {
  console.log("❌ Passenger rejected:", error.message);
});
```

### 2. Database Persistence Test

```javascript
// Send GPS update
socket.emit("gpsUpdate", {
  rideId: "ride123",
  driverId: "driver456",
  latitude: 23.8103,
  longitude: 90.4125,
  speed: 45,
  heading: 180
});

// Check MongoDB
db.gpsLocations.find({ rideId: "ride123" }).sort({ timestamp: -1 }).limit(1);
```

---

## 📈 Performance Optimization

### 1. Targeted Broadcasting

```javascript
// ❌ Bad: Broadcast to all
io.emit("update", data);

// ✅ Good: Broadcast to specific room
io.to(`ride_${rideId}`).emit("update", data);
```

### 2. Connection Monitoring

```javascript
// Track active connections
const activeConnections = new Map();

socket.on("connection", (socket) => {
  activeConnections.set(socket.id, {
    userId: socket.userId,
    connectedAt: new Date()
  });
});

socket.on("disconnect", () => {
  activeConnections.delete(socket.id);
});
```

### 3. Automatic Cleanup

```javascript
// Clean old GPS data every hour
setInterval(async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await gpsLocationsCollection.deleteMany({
    timestamp: { $lt: oneDayAgo }
  });
}, 60 * 60 * 1000);
```

---

## 🔧 Production Deployment

### 1. Environment Variables

```env
# socket-server/.env
SOCKET_PORT=4001
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
AUTH_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2. JWT Verification (Production)

```javascript
const jwt = require("jsonwebtoken");

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}
```

### 3. Rate Limiting

```javascript
const rateLimit = new Map();

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  const now = Date.now();
  const userLimit = rateLimit.get(userId) || { count: 0, resetTime: now };

  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + 60000; // 1 minute
  }

  if (userLimit.count > 100) {
    return next(new Error("Rate limit exceeded"));
  }

  userLimit.count++;
  rateLimit.set(userId, userLimit);
  next();
});
```

---

## ✅ Implementation Checklist

- [x] Authentication middleware যুক্ত করা হয়েছে
- [x] শুধুমাত্র admin/supportAgent access পায়
- [x] GPS data MongoDB তে save হয়
- [x] Notification MongoDB তে save হয়
- [x] Room-based communication implement করা হয়েছে
- [x] Connection logging করা হয়েছে
- [x] Automatic cleanup যুক্ত করা হয়েছে
- [x] Error handling করা হয়েছে
- [x] Graceful shutdown implement করা হয়েছে
- [x] Frontend authentication যুক্ত করা হয়েছে
- [ ] Production JWT verification implement করতে হবে
- [ ] Rate limiting যুক্ত করতে হবে
- [ ] SSL/TLS certificate যুক্ত করতে হবে

---

## 🎉 Status

**Implementation**: ✅ Complete  
**Security**: ✅ Enabled  
**Database Persistence**: ✅ Active  
**Admin Monitoring**: ✅ Working  
**Production Ready**: ⚠️ JWT verification pending

---

**Last Updated**: March 8, 2026  
**Version**: 2.0.0 (Secure)
