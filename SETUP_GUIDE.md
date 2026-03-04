# OnWay - Separated Backend & Socket Server Setup Guide

## Architecture Overview

Your application now has two separate servers:

1. **Backend (Express REST API)** - Port 5000
   - Handles all HTTP API requests
   - Database operations
   - Authentication, payments, bookings, etc.

2. **Socket Server (Socket.io)** - Port 4001
   - Handles real-time WebSocket connections
   - GPS tracking
   - Live updates

## Setup Instructions

### 1. Backend Setup (Express API)

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Socket Server Setup

```bash
cd socket-server
npm install

# Copy MongoDB URI from backend/.env to socket-server/.env
# Or create socket-server/.env with:
# SOCKET_PORT=4001
# MONGODB_URI=your_mongodb_uri

npm run dev
```

The socket server will run on `http://localhost:4001`

### 3. Frontend Configuration

Update your frontend environment variables:

**on-way/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

### 4. Running Both Servers

You need to run both servers simultaneously:

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd socket-server
npm run dev
```

**Terminal 3:**
```bash
cd on-way
npm run dev
```

## What Changed?

### backend/server.js
- ❌ Removed `http`, `socket.io` imports
- ❌ Removed Socket.io connection logic
- ✅ Now uses `app.listen()` instead of `server.listen()`
- ✅ Exports `app` instead of `server`

### socket-server/server.js (NEW)
- ✅ Standalone Socket.io server
- ✅ Handles all real-time connections
- ✅ GPS tracking logic
- ✅ Room management (joinRide)

## Testing

### Test Backend API
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status": "onWay Backend running"}
```

### Test Socket Server

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket Test</title>
  <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
</head>
<body>
  <h1>Socket.io Test</h1>
  <div id="status">Connecting...</div>
  
  <script>
    const socket = io('http://localhost:4001');
    
    socket.on('connect', () => {
      document.getElementById('status').textContent = 'Connected: ' + socket.id;
      socket.emit('joinRide', 'test_ride_123');
    });
    
    socket.on('receiveGpsUpdate', (data) => {
      console.log('GPS Update:', data);
    });
  </script>
</body>
</html>
```

## Production Deployment

### Backend
- Deploy to Vercel/Railway/Render
- Set environment variables
- Note the production URL

### Socket Server
- Deploy to Railway/Render/Heroku (needs persistent connection support)
- Set environment variables
- Note the production URL

### Frontend
Update production environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
```

## Troubleshooting

### Socket connection fails
- Check if socket server is running on port 4001
- Verify CORS settings in socket-server/server.js
- Check browser console for errors

### Backend API not responding
- Verify backend is running on port 5000
- Check MongoDB connection
- Review backend logs

### Both servers on same port error
- Make sure backend uses port 5000
- Make sure socket server uses port 4001
- Check .env files in both directories
