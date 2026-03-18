# OnWay Ride Simulation System - Complete Guide

## Overview

This system implements realistic ride-matching simulation similar to Uber, where riders move automatically from predefined service areas toward passenger pickup locations using Socket.io real-time updates.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Passenger     │◄────────┤   Socket.io      │────────►│     Rider       │
│   Dashboard     │         │   Real-time      │         │   Dashboard     │
└─────────────────┘         │   Server         │         └─────────────────┘
        │                   └──────────────────┘                  │
        │                            │                            │
        ▼                            ▼                            ▼
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Live Tracking  │         │   Simulation     │         │  Ride Request   │
│     Map         │         │    Service       │         │     Handler     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## Key Features

### 1. Service Areas (No Real GPS)
- Each rider has 4 predefined coordinates representing their working zones
- Riders start from the nearest service area to the pickup location
- No browser GPS or real location tracking

### 2. Simulated Movement
- Rider position updates every 2 seconds
- Moves 5% closer to target each update (smooth, realistic)
- Calculates distance and ETA automatically
- Stops when within 50 meters of pickup

### 3. Real-Time Updates
- Socket.io broadcasts location updates to passenger
- Animated car marker on map
- Green route polyline (Google Maps style)
- Live ETA countdown

### 4. Professional UI
- Apple-style smooth animations
- Pulsing car marker with shadow
- Animated route line
- Floating ETA badge

## Database Schema

### Rider Document
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  vehicle: {
    type: String,
    brand: String,
    plate: String
  },
  status: "online" | "offline" | "busy",
  serviceAreas: [
    { lat: Number, lng: Number },
    { lat: Number, lng: Number },
    { lat: Number, lng: Number },
    { lat: Number, lng: Number }
  ],
  simulatedLocation: {
    lat: Number,
    lng: Number
  },
  rating: Number,
  isApproved: Boolean,
  operationCities: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Document
```javascript
{
  _id: ObjectId,
  passengerId: ObjectId,
  riderId: ObjectId,
  pickupLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  dropoffLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  distance: Number,
  duration: Number,
  price: Number,
  bookingStatus: "searching" | "accepted" | "arrived" | "started" | "completed" | "cancelled",
  otp: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Socket.io Events

### Server → Client

#### `riderLocationUpdate`
Emitted every 2 seconds during ride
```javascript
{
  rideId: String,
  riderId: String,
  lat: Number,
  lng: Number,
  distance: Number, // meters
  eta: Number, // minutes
  isSimulated: true
}
```

#### `riderArrived`
Emitted when rider is within 50m of pickup
```javascript
{
  rideId: String,
  riderId: String,
  message: "Driver arriving soon"
}
```

#### `ride:accepted`
Emitted when rider accepts ride
```javascript
{
  bookingId: String,
  riderId: String,
  driver: {
    name: String,
    phone: String,
    vehicle: Object,
    rating: Number
  }
}
```

### Client → Server

#### `ride:accept`
Rider accepts a ride request
```javascript
{
  bookingId: String,
  riderId: String
}
```

#### `join:room`
Join a specific ride room for updates
```javascript
{
  room: "ride:BOOKING_ID"
}
```

## API Endpoints

### POST `/api/bookings/:id/accept`
Rider accepts a ride and starts simulation

**Request:**
```json
{
  "riderId": "RIDER_ID"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ride accepted successfully",
  "booking": { ... }
}
```

### PATCH `/api/bookings/:id/status`
Update ride status

**Request:**
```json
{
  "status": "arrived" | "started" | "completed" | "cancelled"
}
```

## Frontend Components

### LiveTrackingMap.jsx
Professional map component with:
- Animated car marker with pulse effect
- Custom pickup/dropoff pins
- Animated green route polyline
- Smooth position interpolation
- Floating ETA badge
- Auto-fit bounds

**Props:**
```javascript
{
  pickup: [lat, lng],
  dropoff: [lat, lng],
  driverLocation: [lat, lng],
  eta: Number, // minutes
  distance: Number // meters
}
```

### Usage Example:
```jsx
<LiveTrackingMap
  pickup={[23.8103, 90.4125]}
  dropoff={[23.8213, 90.4195]}
  driverLocation={[23.8156, 90.4089]}
  eta={5}
  distance={450}
/>
```

## Setup Instructions

### 1. Run Database Migration
Add service areas to existing riders:
```bash
cd backend
node scripts/addServiceAreasToRiders.js
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm start
```

### 3. Start Frontend
```bash
cd on-way
npm install
npm run dev
```

### 4. Environment Variables

**Backend (.env):**
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Testing the System

### 1. Create Test Rider
Add a rider with service areas in MongoDB:
```javascript
{
  name: "Test Driver",
  email: "driver@test.com",
  phone: "+8801234567890",
  status: "online",
  isApproved: true,
  serviceAreas: [
    { lat: 23.8103, lng: 90.4125 },
    { lat: 23.8156, lng: 90.4089 },
    { lat: 23.8089, lng: 90.4178 },
    { lat: 23.8045, lng: 90.4156 }
  ],
  vehicle: {
    type: "Car",
    brand: "Toyota",
    plate: "DHK-1234"
  }
}
```

### 2. Test Ride Flow
1. Login as passenger
2. Book a ride from dashboard
3. System finds nearest rider
4. Rider accepts (or auto-accept for testing)
5. Watch simulated movement on map
6. Rider arrives within 50m → status changes to "arrived"

### 3. Monitor Console Logs
**Backend:**
```
🚗 [SIMULATION] Starting for ride 507f1f77bcf86cd799439011
📍 Start: 23.8103, 90.4125
🎯 Target: 23.8213, 90.4195
📡 [SIMULATION] Ride 507f... - Distance: 1234.56m
✅ [SIMULATION] Rider arrived at pickup
```

**Frontend:**
```
📍 [LOCATION UPDATE] { lat: 23.8156, lng: 90.4089, eta: 5, distance: 450 }
🚗 [RIDER LOCATION] { rideId: "507f...", lat: 23.8178, lng: 90.4112 }
✅ [RIDER ARRIVED] { rideId: "507f...", message: "Driver arriving soon" }
```

## Customization

### Adjust Movement Speed
In `rideSimulationService.js`:
```javascript
// Faster movement (10% per update)
const moveSpeed = 0.10;

// Slower movement (3% per update)
const moveSpeed = 0.03;
```

### Change Update Interval
```javascript
// Update every 1 second
simulation.interval = setInterval(() => { ... }, 1000);

// Update every 3 seconds
simulation.interval = setInterval(() => { ... }, 3000);
```

### Modify Arrival Threshold
```javascript
// Arrived within 100 meters
if (distance < 100) { ... }

// Arrived within 20 meters
if (distance < 20) { ... }
```

### Add Service Areas for New Zones
In migration script:
```javascript
const SERVICE_AREA_ZONES = {
  // ... existing zones
  newZone: [
    { lat: 23.xxxx, lng: 90.xxxx },
    { lat: 23.xxxx, lng: 90.xxxx },
    { lat: 23.xxxx, lng: 90.xxxx },
    { lat: 23.xxxx, lng: 90.xxxx }
  ]
};
```

## Troubleshooting

### Rider Not Moving
- Check if simulation started: Look for `🚗 [SIMULATION] Starting` in logs
- Verify socket connection: Check browser console for socket events
- Ensure rider has service areas in database

### Map Not Updating
- Check socket connection in browser DevTools
- Verify `riderLocationUpdate` events are being received
- Check if passenger joined the ride room

### Simulation Not Stopping
- Verify arrival threshold (50m default)
- Check if `riderArrived` event is emitted
- Look for `🛑 [SIMULATION] Stopped` in logs

### Performance Issues
- Reduce update frequency (increase interval)
- Decrease movement speed (lower moveSpeed value)
- Optimize map rendering (reduce marker complexity)

## Production Deployment

### 1. Optimize Socket.io
```javascript
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL },
  transports: ['websocket'], // Disable polling
  pingTimeout: 60000,
  pingInterval: 25000
});
```

### 2. Add Redis for Scaling
```javascript
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### 3. Monitor Active Simulations
```javascript
const { getActiveSimulations } = require('./services/rideSimulationService');

app.get('/api/admin/active-simulations', (req, res) => {
  res.json({
    count: getActiveSimulations().length,
    rides: getActiveSimulations()
  });
});
```

## Best Practices

1. **Always stop simulations** when ride is completed/cancelled
2. **Validate service areas** before starting simulation
3. **Log all simulation events** for debugging
4. **Handle edge cases** (rider offline, passenger cancels, etc.)
5. **Test with multiple concurrent rides** to ensure scalability
6. **Monitor memory usage** for long-running simulations
7. **Implement cleanup** for abandoned simulations

## Future Enhancements

- [ ] Add traffic simulation (variable speed)
- [ ] Implement route following (not straight line)
- [ ] Add multiple waypoints for realistic paths
- [ ] Support driver breaks/pauses
- [ ] Add weather effects on movement speed
- [ ] Implement surge pricing zones
- [ ] Add driver heat maps
- [ ] Support multi-stop rides

## Support

For issues or questions:
- Check console logs (both frontend and backend)
- Review socket event flow
- Verify database schema
- Test with single ride first
- Monitor network tab for socket connections

---

**System Status:** ✅ Production Ready
**Last Updated:** March 2026
**Version:** 1.0.0
