# Socket.io Quick Reference - দ্রুত রেফারেন্স (বাংলা)

## 🚀 Server Start করুন

```bash
cd socket-server
node server.js
```

**Expected Output:**
```
✅ MongoDB connected (Socket Server)
🚀 Socket.io server running on http://localhost:4001
🔐 Authentication: ENABLED
📊 Admin monitoring: ACTIVE
💾 Database persistence: ENABLED
```

---

## 🔐 Authentication

### Frontend Connection (Admin Only)

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:4001", {
  auth: {
    token: session.user.id,      // JWT token (production এ)
    role: session.user.role,      // "admin" or "supportAgent"
    userId: session.user.id
  }
});
```

### Role Check

- ✅ **admin** → Access granted
- ✅ **supportAgent** → Access granted
- ❌ **passenger** → Access denied
- ❌ **rider** → Access denied

---

## 📡 Socket Events

### 1. Join Notification Room

```javascript
// Emit
socket.emit("joinNotifications", userId);

// Listen
socket.on("joinedNotifications", (data) => {
  console.log("✅ Joined:", data.message);
});
```

### 2. Join Ride Tracking Room

```javascript
// Emit
socket.emit("joinRide", rideId);

// Listen
socket.on("joinedRide", (data) => {
  console.log("✅ Monitoring ride:", data.rideId);
});
```

### 3. GPS Update (Driver → Admin)

```javascript
// Driver sends GPS
socket.emit("gpsUpdate", {
  rideId: "ride123",
  driverId: "driver456",
  latitude: 23.8103,
  longitude: 90.4125,
  speed: 45,
  heading: 180
});

// Admin receives GPS
socket.on("receiveGpsUpdate", (data) => {
  console.log("📍 GPS:", data);
  // data._id → MongoDB document ID
  // data.latitude, data.longitude
  // data.timestamp
});

// Acknowledgment
socket.on("gpsUpdateAck", (response) => {
  if (response.success) {
    console.log("✅ GPS saved:", response.savedId);
  }
});
```

### 4. Send Notification

```javascript
// Send notification
socket.emit("sendNotification", {
  userId: "user123",
  message: "New ride booking",
  type: "booking",
  metadata: {
    bookingId: "booking456",
    fare: 250
  }
});

// User receives notification
socket.on("newNotification", (notification) => {
  console.log("🔔 New notification:", notification);
  // notification._id → MongoDB document ID
  // notification.message
  // notification.type
});

// Acknowledgment
socket.on("notificationSent", (response) => {
  if (response.success) {
    console.log("✅ Sent:", response.notificationId);
  }
});
```

### 5. Get Active Rides

```javascript
// Request
socket.emit("getActiveRides");

// Response
socket.on("activeRides", (response) => {
  if (response.success) {
    console.log("🚗 Active rides:", response.rides);
  }
});
```

### 6. Get Connection Stats (Admin Only)

```javascript
// Request
socket.emit("getConnectionStats");

// Response
socket.on("connectionStats", (stats) => {
  console.log("📊 Total:", stats.totalConnections);
  console.log("👥 Users:", stats.connections);
});
```

---

## 💾 Database Collections

### gpsLocations

```javascript
{
  rideId: "ride123",
  driverId: "driver456",
  latitude: 23.8103,
  longitude: 90.4125,
  speed: 45,
  heading: 180,
  timestamp: new Date(),
  socketId: "socket_id"
}
```

### notifications

```javascript
{
  userId: "user123",
  message: "New booking",
  type: "booking",
  metadata: { bookingId: "..." },
  isRead: false,
  createdAt: new Date(),
  sentBy: "admin123",
  sentByRole: "admin"
}
```

### rideSessions

```javascript
{
  socketId: "socket_id",
  userId: "admin123",
  role: "admin",
  type: "admin_connection",
  connectedAt: new Date(),
  status: "active"
}
```

---

## 🎯 Notification Types

| Type | বাংলা | Use Case |
|------|-------|----------|
| `booking` | নতুন বুকিং | New ride booking |
| `driver_registration` | ড্রাইভার রেজিস্ট্রেশন | Driver approval needed |
| `cancellation` | বাতিল | Ride cancelled |
| `payment` | পেমেন্ট | Payment update |
| `system` | সিস্টেম | System alert |

---

## 🔧 Error Handling

### Connection Errors

```javascript
socket.on("connect_error", (error) => {
  console.error("❌ Error:", error.message);
  // "Authentication failed: Invalid token"
  // "Authorization failed: Admin access required"
});
```

### Event Errors

```javascript
socket.on("error", (error) => {
  console.error("❌ Error:", error.message);
  // "Unauthorized"
});
```

---

## 🧪 Testing Commands

### Test Authentication

```javascript
// Admin (should work)
const adminSocket = io("http://localhost:4001", {
  auth: { token: "test", role: "admin", userId: "admin123" }
});

// Passenger (should fail)
const passengerSocket = io("http://localhost:4001", {
  auth: { token: "test", role: "passenger", userId: "pass123" }
});
```

### Test GPS Save

```javascript
socket.emit("gpsUpdate", {
  rideId: "test_ride",
  driverId: "test_driver",
  latitude: 23.8103,
  longitude: 90.4125
});

// Check MongoDB
db.gpsLocations.find({ rideId: "test_ride" });
```

### Test Notification

```javascript
socket.emit("sendNotification", {
  userId: "test_user",
  message: "Test notification",
  type: "system"
});

// Check MongoDB
db.notifications.find({ userId: "test_user" });
```

---

## 📊 Monitoring

### Active Connections

```javascript
// Server-side
console.log("Active connections:", activeConnections.size);
```

### Database Stats

```javascript
// GPS records
db.gpsLocations.countDocuments();

// Notifications
db.notifications.countDocuments({ isRead: false });

// Active sessions
db.rideSessions.countDocuments({ status: "active" });
```

---

## 🚨 Common Issues

### 1. Connection Refused

**Problem**: Socket can't connect  
**Solution**: Check if server is running on port 4001

```bash
cd socket-server
node server.js
```

### 2. Authentication Failed

**Problem**: "Authentication failed: Invalid token"  
**Solution**: Check if user role is admin/supportAgent

```javascript
console.log("Role:", session.user.role);
// Should be "admin" or "supportAgent"
```

### 3. Data Not Saving

**Problem**: GPS/Notification not in database  
**Solution**: Check MongoDB connection

```bash
# Check MongoDB URI in .env
cat socket-server/.env
```

### 4. Room Not Joined

**Problem**: Not receiving updates  
**Solution**: Emit joinRide/joinNotifications

```javascript
socket.emit("joinRide", rideId);
socket.emit("joinNotifications", userId);
```

---

## 🎯 Best Practices

### 1. Always Check Authentication

```javascript
socket.on("someEvent", (data) => {
  if (!socket.authenticated) {
    socket.emit("error", { message: "Unauthorized" });
    return;
  }
  // Process event
});
```

### 2. Save to DB First, Then Emit

```javascript
// ✅ Good
const result = await collection.insertOne(data);
io.to(room).emit("event", { _id: result.insertedId, ...data });

// ❌ Bad
io.to(room).emit("event", data);
await collection.insertOne(data);
```

### 3. Use Specific Rooms

```javascript
// ✅ Good: Targeted
io.to(`ride_${rideId}`).emit("update", data);

// ❌ Bad: Broadcast to all
io.emit("update", data);
```

### 4. Handle Errors

```javascript
socket.on("event", async (data) => {
  try {
    await processData(data);
    socket.emit("success", { message: "Done" });
  } catch (error) {
    socket.emit("error", { message: error.message });
  }
});
```

---

## 📝 Quick Commands

```bash
# Start socket server
cd socket-server && node server.js

# Check if running
curl http://localhost:4001

# View logs
# Check terminal output

# Stop server
# Press Ctrl+C

# Restart server
node server.js
```

---

## ✅ Status Check

```javascript
// Frontend
console.log("Connected:", socket.connected);
console.log("Socket ID:", socket.id);

// Backend
console.log("Active connections:", activeConnections.size);
```

---

**Last Updated**: March 8, 2026  
**Version**: 2.0.0
