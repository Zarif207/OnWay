# Install Dependencies for Notification System

## Required Package

The notification system requires `socket.io-client` for the frontend.

---

## Installation

### Option 1: NPM

```bash
cd on-way
npm install socket.io-client
```

### Option 2: Yarn

```bash
cd on-way
yarn add socket.io-client
```

### Option 3: PNPM

```bash
cd on-way
pnpm add socket.io-client
```

---

## Verify Installation

Check `on-way/package.json`:

```json
{
  "dependencies": {
    "socket.io-client": "^4.7.2",
    ...
  }
}
```

---

## Backend Dependencies

The backend and socket server already have all required dependencies:

- ✅ `socket.io` (already installed in socket-server)
- ✅ `express` (already installed in backend)
- ✅ `mongodb` (already installed in both)

---

## Start Servers

After installing dependencies:

```bash
# Terminal 1: Backend API
cd backend
npm start
# Runs on http://localhost:4000

# Terminal 2: Socket Server
cd socket-server
npm start
# Runs on http://localhost:4001

# Terminal 3: Frontend
cd on-way
npm run dev
# Runs on http://localhost:3000
```

---

## Verify Setup

1. Open browser: `http://localhost:3000/dashboard/admin`
2. Check notification bell icon in navbar
3. Open browser console
4. Look for: `🔌 Socket connected: [socket-id]`
5. Check for green dot on notification bell (connection status)

---

## Test Notification

Send a test notification via API:

```bash
curl -X POST http://localhost:4000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "message": "Test notification",
    "type": "system",
    "metadata": {}
  }'
```

Or via browser console:

```javascript
fetch('http://localhost:4000/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    message: 'Test notification',
    type: 'system',
    metadata: {}
  })
});
```

---

## Troubleshooting

### Package Installation Fails

```bash
# Clear cache and reinstall
cd on-way
rm -rf node_modules package-lock.json
npm install
npm install socket.io-client
```

### Socket Connection Fails

1. Check if socket server is running on port 4001
2. Verify `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
3. Check browser console for errors
4. Restart all servers

### Module Not Found Error

```bash
# Ensure you're in the correct directory
cd on-way
npm install socket.io-client

# Restart Next.js dev server
npm run dev
```

---

## Complete Package List

### Frontend (on-way/package.json)

```json
{
  "dependencies": {
    "next": "^14.x.x",
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "next-auth": "^5.x.x",
    "axios": "^1.x.x",
    "sweetalert2": "^11.x.x",
    "lucide-react": "^0.x.x",
    "socket.io-client": "^4.7.2"  // ← NEW
  }
}
```

### Backend (backend/package.json)

```json
{
  "dependencies": {
    "express": "^4.x.x",
    "cors": "^2.x.x",
    "mongodb": "^6.x.x",
    "bcryptjs": "^2.x.x",
    "dotenv": "^16.x.x"
  }
}
```

### Socket Server (socket-server/package.json)

```json
{
  "dependencies": {
    "socket.io": "^4.x.x",
    "mongodb": "^6.x.x",
    "dotenv": "^16.x.x"
  }
}
```

---

## Environment Variables

Ensure these are set in `on-way/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

---

## Ready to Go!

Once `socket.io-client` is installed and all servers are running, the notification system is fully operational.

Check the notification bell icon in the navbar - you should see:
- ✅ Bell icon with badge counter
- ✅ Green dot (connected status)
- ✅ Dropdown opens on click
- ✅ Real-time notifications appear

---

**Status**: Ready for Installation ✅
