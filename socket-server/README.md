# OnWay Socket.io Server

Separate Socket.io server for real-time features (GPS tracking, live updates, etc.)

## Setup

1. Install dependencies:
```bash
cd socket-server
npm install
```

2. Configure environment variables:
   - Copy `.env` file and add your MongoDB URI
   - Set `SOCKET_PORT` (default: 4001)

3. Run the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Frontend Integration

### Install Socket.io Client

```bash
npm install socket.io-client
```

### React/Next.js Example

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4001';

function RideTracking({ rideId }) {
  const [socket, setSocket] = useState(null);
  const [gpsData, setGpsData] = useState(null);

  useEffect(() => {
    // Connect to Socket.io server
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to Socket.io server');
      
      // Join the ride room
      socketInstance.emit('joinRide', rideId);
    });

    // Listen for GPS updates
    socketInstance.on('receiveGpsUpdate', (data) => {
      console.log('📍 GPS Update:', data);
      setGpsData(data);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io server');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [rideId]);

  // Send GPS update (for driver)
  const sendGpsUpdate = (latitude, longitude) => {
    if (socket) {
      socket.emit('gpsUpdate', {
        rideId,
        driverId: 'driver_123',
        latitude,
        longitude,
      });
    }
  };

  return (
    <div>
      <h2>Live GPS Tracking</h2>
      {gpsData && (
        <div>
          <p>Latitude: {gpsData.latitude}</p>
          <p>Longitude: {gpsData.longitude}</p>
          <p>Updated: {new Date(gpsData.timestamp).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}

export default RideTracking;
```

### Vanilla JavaScript Example

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4001';
const socket = io(SOCKET_URL);

// Connect
socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Join ride
  socket.emit('joinRide', 'ride_12345');
});

// Listen for GPS updates
socket.on('receiveGpsUpdate', (data) => {
  console.log('GPS Update:', data);
  // Update map, UI, etc.
});

// Send GPS update
function sendLocation(rideId, driverId, lat, lng) {
  socket.emit('gpsUpdate', {
    rideId,
    driverId,
    latitude: lat,
    longitude: lng,
  });
}

// Disconnect
socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### Environment Variables (Frontend)

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

## API Endpoints

### Socket Events

#### Client → Server

- `joinRide(rideId)` - Join a ride room to receive updates
- `gpsUpdate({ rideId, driverId, latitude, longitude })` - Send GPS location

#### Server → Client

- `receiveGpsUpdate({ driverId, latitude, longitude, timestamp })` - Receive GPS updates

## Production Deployment

1. Update CORS settings in `server.js`:
```javascript
cors: {
  origin: "https://your-frontend-domain.com",
  methods: ["GET", "POST"],
}
```

2. Deploy to your hosting service (Heroku, Railway, Render, etc.)

3. Update frontend environment variables with production URLs
