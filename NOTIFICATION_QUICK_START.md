# Notification System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
cd on-way
npm install socket.io-client
```

### 2. Start All Servers

```bash
# Terminal 1: Backend API (Port 4000)
cd backend
npm start

# Terminal 2: Socket Server (Port 4001)
cd socket-server
npm start

# Terminal 3: Frontend (Port 3000)
cd on-way
npm run dev
```

### 3. Test Notifications

Open browser console and run:

```javascript
// Get your user ID from session
console.log("User ID:", session.user.id);

// Send test notification via API
fetch('http://localhost:4000/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    message: 'Test notification!',
    type: 'system',
    metadata: {}
  })
});
```

---

## 📋 Quick Reference

### Send Notification (Backend)

```javascript
// In any backend route
const io = global.io; // Socket.io instance

// Save to database
const notification = await notificationsCollection.insertOne({
  userId: "admin123",
  message: "New booking received",
  type: "booking",
  metadata: { bookingId: "123" },
  isRead: false,
  createdAt: new Date()
});

// Emit via socket
io.to(`user_admin123`).emit("newNotification", notification);
```

### Send Notification (Frontend)

```javascript
import { notifyNewBooking } from "@/lib/notificationService";

// Send booking notification
notifyNewBooking(adminId, {
  passengerName: "John Doe",
  pickup: "Downtown",
  destination: "Airport",
  fare: 250
});
```

### Use in Component

```javascript
import { useNotifications } from "@/hooks/useNotifications";

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(n => (
        <div key={n._id} onClick={() => markAsRead(n._id)}>
          {n.message}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔔 Notification Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `booking` | 🚗 Car | Blue | New ride bookings |
| `driver_registration` | 👤 UserPlus | Green | Driver approvals |
| `cancellation` | ❌ XCircle | Red | Ride cancellations |
| `payment` | 💰 DollarSign | Yellow | Payment updates |
| `system` | ⚠️ AlertCircle | Purple | System alerts |

---

## 🎯 Common Use Cases

### 1. New Booking Notification

```javascript
// When a new booking is created
import { notifyNewBooking } from "@/lib/notificationService";

router.post("/api/bookings", async (req, res) => {
  // Create booking
  const booking = await bookingsCollection.insertOne(req.body);
  
  // Notify admin
  notifyNewBooking("admin_user_id", {
    bookingId: booking.insertedId,
    passengerName: req.body.passengerName,
    pickup: req.body.pickupLocation,
    destination: req.body.dropoffLocation,
    fare: req.body.price
  });
  
  res.json({ success: true });
});
```

### 2. Driver Registration

```javascript
// When a driver registers
import { notifyDriverRegistration } from "@/lib/notificationService";

router.post("/api/riders", async (req, res) => {
  // Create driver
  const driver = await ridersCollection.insertOne(req.body);
  
  // Notify admin for approval
  notifyDriverRegistration("admin_user_id", {
    driverId: driver.insertedId,
    name: req.body.name,
    vehicle: req.body.vehicleModel,
    license: req.body.licenseNumber
  });
  
  res.json({ success: true });
});
```

### 3. Payment Update

```javascript
// When payment status changes
import { notifyPaymentUpdate } from "@/lib/notificationService";

router.patch("/api/payment/:id", async (req, res) => {
  // Update payment
  await paymentsCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { status: "completed" } }
  );
  
  // Notify admin
  notifyPaymentUpdate("admin_user_id", {
    paymentId: req.params.id,
    amount: req.body.amount,
    status: "completed"
  });
  
  res.json({ success: true });
});
```

---

## 🔧 API Endpoints

### Get Notifications
```bash
GET /api/notifications?userId=admin123&limit=20
```

### Get Unread Count
```bash
GET /api/notifications/unread-count?userId=admin123
```

### Create Notification
```bash
POST /api/notifications
{
  "userId": "admin123",
  "message": "New notification",
  "type": "system",
  "metadata": {}
}
```

### Mark as Read
```bash
PATCH /api/notifications/:id/read
```

### Mark All as Read
```bash
PATCH /api/notifications/mark-all-read
{
  "userId": "admin123"
}
```

### Delete Notification
```bash
DELETE /api/notifications/:id
```

### Clear All
```bash
DELETE /api/notifications/clear-all?userId=admin123
```

---

## 🎨 UI Components

### Notification Bell (Already in Navbar)

```javascript
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";

<NotificationDropdown />
```

### Custom Notification Display

```javascript
import { useNotifications } from "@/hooks/useNotifications";

function CustomNotifications() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div>
      {notifications.map(notif => (
        <div 
          key={notif._id}
          onClick={() => markAsRead(notif._id)}
          className={notif.isRead ? "opacity-50" : ""}
        >
          <p>{notif.message}</p>
          <small>{new Date(notif.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Socket Not Connecting

```javascript
// Check socket URL
console.log(process.env.NEXT_PUBLIC_SOCKET_URL);

// Check socket status
const { connected } = useNotifications();
console.log("Connected:", connected);
```

### Notifications Not Appearing

```javascript
// Check user ID
import { useSession } from "next-auth/react";
const { data: session } = useSession();
console.log("User ID:", session?.user?.id);

// Check socket room
// Socket should join: user_${userId}
```

### Test Socket Connection

```javascript
// In browser console
const socket = io("http://localhost:4001");

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
  socket.emit("joinNotifications", "YOUR_USER_ID");
});

socket.on("newNotification", (data) => {
  console.log("🔔 Notification:", data);
});
```

---

## 📦 Files Created

```
✅ backend/routes/notifications.js
✅ socket-server/server.js (updated)
✅ backend/server.js (updated)
✅ on-way/src/hooks/useNotifications.js
✅ on-way/src/components/dashboard/NotificationDropdown.jsx
✅ on-way/src/components/dashboard/Navbar.jsx (updated)
✅ on-way/src/lib/notificationService.js
✅ on-way/.env.local (updated)
```

---

## 🎯 Next Steps

1. ✅ Install `socket.io-client`
2. ✅ Start all three servers
3. ✅ Test notification system
4. ✅ Integrate with booking/driver routes
5. ✅ Customize notification messages
6. ✅ Add notification preferences
7. ✅ Deploy to production

---

## 📚 Full Documentation

See `NOTIFICATION_SYSTEM_GUIDE.md` for complete documentation.

---

**Status**: ✅ Ready to Use  
**Last Updated**: March 8, 2026
