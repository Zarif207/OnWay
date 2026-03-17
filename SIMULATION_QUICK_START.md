# Ride Simulation - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Add Service Areas to Riders
```bash
cd backend
node scripts/addServiceAreasToRiders.js
```

### 2. Start Services
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd on-way && npm run dev
```

## 📋 How It Works

```
Passenger Books Ride
        ↓
System Finds Nearest Rider (from service areas)
        ↓
Rider Accepts
        ↓
Simulation Starts (every 2 seconds)
        ↓
Rider Moves 5% Closer to Pickup
        ↓
Socket.io Broadcasts Location
        ↓
Passenger Sees Live Movement on Map
        ↓
Rider Arrives (within 50m)
        ↓
Simulation Stops
```

## 🔑 Key Files

### Backend
- `backend/services/rideSimulationService.js` - Core simulation logic
- `backend/models/Rider.js` - Rider model with service areas
- `backend/controllers/bookingController.js` - Ride acceptance handler
- `backend/server.js` - Socket.io events

### Frontend
- `on-way/src/app/dashboard/passenger/active-ride/_components/LiveTrackingMap.jsx` - Live map
- `on-way/src/app/dashboard/passenger/active-ride/page.jsx` - Active ride page
- `on-way/src/hooks/useSocket.js` - Socket hook

## 🎯 Socket Events

### Listen (Passenger)
```javascript
socket.on("riderLocationUpdate", (data) => {
  // { rideId, lat, lng, distance, eta }
});

socket.on("riderArrived", (data) => {
  // { rideId, message }
});
```

### Emit (Rider)
```javascript
socket.emit("ride:accept", {
  bookingId: "...",
  riderId: "..."
});
```

## 🛠️ Customization

### Speed
```javascript
// rideSimulationService.js line 95
const moveSpeed = 0.05; // 5% per update
```

### Update Frequency
```javascript
// rideSimulationService.js line 113
}, 2000); // milliseconds
```

### Arrival Distance
```javascript
// rideSimulationService.js line 82
if (distance < 50) { // meters
```

## 🧪 Testing

### Test Rider Data
```javascript
{
  name: "Test Driver",
  status: "online",
  isApproved: true,
  serviceAreas: [
    { lat: 23.8103, lng: 90.4125 },
    { lat: 23.8156, lng: 90.4089 },
    { lat: 23.8089, lng: 90.4178 },
    { lat: 23.8045, lng: 90.4156 }
  ]
}
```

### Console Logs to Watch
```
Backend:
🚗 [SIMULATION] Starting for ride...
📡 [SIMULATION] Distance: XXXm
✅ [SIMULATION] Rider arrived

Frontend:
📍 [LOCATION UPDATE]
🚗 [RIDER LOCATION]
✅ [RIDER ARRIVED]
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Rider not moving | Check service areas in DB |
| Map not updating | Verify socket connection |
| Simulation not stopping | Check arrival threshold |
| No location updates | Ensure rider accepted ride |

## 📊 Service Area Zones

Pre-configured zones in Dhaka:
- Gulshan (23.78xx, 90.41xx)
- Dhanmondi (23.74xx, 90.37xx)
- Banani (23.79xx, 90.40xx)
- Mirpur (23.82xx, 90.36xx)
- Uttara (23.87xx, 90.37xx)
- Motijheel (23.73xx, 90.41xx)

## 🎨 Map Features

✅ Animated car marker with pulse
✅ Custom pickup/dropoff pins
✅ Green animated route line
✅ Smooth position interpolation
✅ Floating ETA badge
✅ Auto-fit bounds

## 📱 API Endpoints

```
POST /api/bookings/:id/accept
Body: { riderId: "..." }

PATCH /api/bookings/:id/status
Body: { status: "arrived" }
```

## 🔐 Environment Variables

```env
# Backend
MONGODB_URI=mongodb://...
PORT=5000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## ✨ Features

- ✅ No real GPS tracking
- ✅ Simulated movement from service areas
- ✅ Real-time Socket.io updates
- ✅ Google Maps-style UI
- ✅ Smooth animations
- ✅ ETA calculation
- ✅ Distance tracking
- ✅ Auto-arrival detection

## 📞 Need Help?

1. Check console logs (backend + frontend)
2. Verify socket connection in DevTools
3. Review RIDE_SIMULATION_GUIDE.md
4. Test with single ride first

---

**Ready to go!** 🚀 Book a ride and watch the magic happen.
