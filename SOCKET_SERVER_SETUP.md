# Socket Server Setup Guide

## Error Fix: MONGODB_URI Undefined

If you encounter this error:
```
TypeError: Cannot read properties of undefined (reading 'startsWith')
```

This means the `MONGODB_URI` environment variable is not set.

---

## Solution

### 1. Create .env File

Create a `.env` file in the `socket-server` directory:

```bash
cd socket-server
touch .env
```

### 2. Add Environment Variables

Add the following to `socket-server/.env`:

```env
# Socket Server Configuration
SOCKET_PORT=4001
MONGODB_URI=mongodb+srv://onWayDB:QbhWGvUOxNbCnaOf@cluster0.idgaye3.mongodb.net/?appName=Cluster0

# Environment
NODE_ENV=development
```

**Note**: Replace the MongoDB URI with your actual connection string if different.

### 3. Verify .env File

Check that the file exists:

```bash
cd socket-server
ls -la
# Should show .env file
```

### 4. Restart Socket Server

```bash
cd socket-server
npm start
```

You should see:
```
✅ MongoDB connected (Socket Server)
🚀 Socket.io server running on http://localhost:4001
```

---

## Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `SOCKET_PORT` | Port for Socket.io server | 4001 |
| `MONGODB_URI` | MongoDB connection string | Required |
| `NODE_ENV` | Environment mode | development |

---

## File Structure

```
socket-server/
├── .env                 # Environment variables (create this)
├── .env.example         # Example template
├── .gitignore          # Ignores .env file
├── server.js           # Socket server code
├── package.json        # Dependencies
└── README.md           # Documentation
```

---

## Troubleshooting

### Error: MONGODB_URI is not defined

**Cause**: `.env` file is missing or not loaded

**Solution**:
1. Create `.env` file in `socket-server` directory
2. Add `MONGODB_URI=your_connection_string`
3. Restart the server

### Error: Cannot connect to MongoDB

**Cause**: Invalid MongoDB URI or network issue

**Solution**:
1. Verify MongoDB URI is correct
2. Check network connectivity
3. Ensure MongoDB Atlas allows your IP address
4. Test connection with MongoDB Compass

### Error: Port 4001 already in use

**Cause**: Another process is using port 4001

**Solution**:
```bash
# Find process using port 4001
netstat -ano | findstr :4001

# Kill the process (Windows)
taskkill /PID <process_id> /F

# Or change port in .env
SOCKET_PORT=4002
```

---

## Security Notes

### Production Deployment

For production, use environment variables from your hosting platform:

**Railway:**
```bash
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set SOCKET_PORT=4001
railway variables set NODE_ENV=production
```

**Heroku:**
```bash
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set SOCKET_PORT=4001
heroku config:set NODE_ENV=production
```

**Render:**
Add environment variables in the Render dashboard.

### Never Commit .env

The `.env` file is already in `.gitignore`. Never commit it to version control.

---

## Testing Connection

### Test MongoDB Connection

```bash
cd socket-server
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Not Set ❌');"
```

### Test Socket Server

```bash
cd socket-server
npm start
```

Expected output:
```
✅ MongoDB connected (Socket Server)
🚀 Socket.io server running on http://localhost:4001
```

### Test from Browser

Open browser console and run:

```javascript
const socket = io("http://localhost:4001");

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error);
});
```

---

## Complete Setup Checklist

- [ ] Create `socket-server/.env` file
- [ ] Add `MONGODB_URI` to `.env`
- [ ] Add `SOCKET_PORT` to `.env`
- [ ] Verify `.env` is in `.gitignore`
- [ ] Start socket server
- [ ] Check for "MongoDB connected" message
- [ ] Check for "Socket.io server running" message
- [ ] Test connection from browser
- [ ] Verify notifications work

---

## Quick Commands

```bash
# Create .env file
cd socket-server
echo "SOCKET_PORT=4001" > .env
echo "MONGODB_URI=mongodb+srv://..." >> .env
echo "NODE_ENV=development" >> .env

# Start server
npm start

# Check if running
curl http://localhost:4001
```

---

## Status

✅ **Fixed**: Socket server now validates environment variables  
✅ **Created**: `.env` file with MongoDB URI  
✅ **Created**: `.env.example` template  
✅ **Updated**: Error handling in server.js

---

**Last Updated**: March 8, 2026
