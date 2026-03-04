# 🏗️ OnWay Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     (https://your-app.vercel.app)               │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP/HTTPS Requests
                 │
    ┌────────────┴────────────┐
    │                         │
    │ REST API               │ WebSocket
    │                         │
    ▼                         ▼
┌─────────────────┐    ┌──────────────────┐
│  Backend API    │    │  Socket Server   │
│  (Vercel)       │    │  (Railway)       │
│  Port: 443      │    │  Port: 4001      │
└────────┬────────┘    └────────┬─────────┘
         │                      │
         │                      │
         └──────────┬───────────┘
                    │
                    │ MongoDB Driver
                    │
                    ▼
         ┌──────────────────────┐
         │   MongoDB Atlas      │
         │   (Cloud Database)   │
         └──────────────────────┘
```

---

## Component Details

### 1. Frontend (Next.js)
**Deployed on:** Vercel  
**URL:** https://your-frontend.vercel.app  
**Tech Stack:**
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- Socket.io Client

**Responsibilities:**
- User interface
- Client-side routing
- API calls to backend
- WebSocket connections
- OAuth authentication

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://on-way-server.vercel.app/api
NEXT_PUBLIC_SOCKET_URL=https://socket-server.railway.app
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GITHUB_ID=...
```

---

### 2. Backend API (Express)
**Deployed on:** Vercel Serverless Functions  
**URL:** https://on-way-server.vercel.app  
**Tech Stack:**
- Node.js
- Express.js
- MongoDB Driver
- bcryptjs
- CORS

**Responsibilities:**
- REST API endpoints
- User authentication
- Database operations
- Business logic
- Payment processing

**API Routes:**
```
/api/health          - Health check
/api/passenger       - User management
/api/riders          - Driver management
/api/rides           - Ride operations
/api/bookings        - Booking management
/api/payment         - Payment processing
/api/blogs           - Blog content
/api/reviews         - Reviews & ratings
/api/support         - Support tickets
/api/promo           - Promo codes
/api/location        - GPS tracking
```

**Environment Variables:**
```env
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://on-way-server.vercel.app
```

---

### 3. Socket Server (Socket.io)
**Deployed on:** Railway/Render  
**URL:** https://socket-server.railway.app  
**Port:** 4001  
**Tech Stack:**
- Node.js
- Socket.io
- MongoDB Driver

**Responsibilities:**
- Real-time GPS tracking
- Live ride updates
- Driver-passenger communication
- Real-time notifications

**Socket Events:**
```javascript
// Client → Server
socket.emit('joinRide', rideId)
socket.emit('gpsUpdate', { rideId, driverId, lat, lng })

// Server → Client
socket.on('receiveGpsUpdate', (data) => { ... })
```

**Environment Variables:**
```env
SOCKET_PORT=4001
MONGODB_URI=mongodb+srv://...
```

---

### 4. Database (MongoDB Atlas)
**Provider:** MongoDB Atlas  
**Connection:** mongodb+srv://...  
**Database:** onWayDB

**Collections:**
```
passenger         - User accounts
riders            - Driver accounts
rides             - Ride records
bookings          - Booking records
payments          - Payment transactions
reviews           - User reviews
Blogs             - Blog posts
knowledge         - Support KB
gpsLocations      - GPS tracking data
promoCode         - Promotional codes
```

**Indexes:**
```javascript
knowledge: { question: "text", answer: "text" }
```

---

## Data Flow

### Registration Flow

```
┌─────────┐
│ Browser │
└────┬────┘
     │ 1. User fills form
     │
     ▼
┌─────────────────┐
│ Frontend        │
│ /register page  │
└────┬────────────┘
     │ 2. POST /api/passenger
     │    { name, email, password }
     │
     ▼
┌─────────────────────┐
│ Backend API         │
│ Vercel Serverless   │
└────┬────────────────┘
     │ 3. Validate data
     │ 4. Hash password
     │ 5. Check existing user
     │
     ▼
┌─────────────────┐
│ MongoDB Atlas   │
│ passenger coll. │
└────┬────────────┘
     │ 6. Insert user
     │
     ▼
┌─────────────────┐
│ Response        │
│ { success: true }│
└─────────────────┘
```

### Real-time GPS Tracking Flow

```
┌──────────────┐
│ Driver App   │
└──────┬───────┘
       │ 1. Get GPS coordinates
       │
       ▼
┌──────────────────┐
│ Socket Server    │
│ (Railway)        │
└──────┬───────────┘
       │ 2. Broadcast to ride room
       │
       ▼
┌──────────────────┐
│ Passenger App    │
│ (Listening)      │
└──────┬───────────┘
       │ 3. Update map
       │
       ▼
┌──────────────────┐
│ MongoDB          │
│ gpsLocations     │
└──────────────────┘
```

---

## Deployment Architecture

### Vercel (Frontend + Backend)

```
┌─────────────────────────────────────────┐
│           Vercel Edge Network            │
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │   Frontend     │  │   Backend      │ │
│  │   (Static)     │  │   (Serverless) │ │
│  │                │  │                │ │
│  │  - HTML/CSS/JS │  │  - API Routes  │ │
│  │  - Next.js     │  │  - Express     │ │
│  │  - React       │  │  - Node.js     │ │
│  └────────────────┘  └────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

**Characteristics:**
- ✅ Auto-scaling
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Zero-config deployment
- ⚠️ 10-second timeout per function
- ⚠️ Stateless (no persistent connections)

### Railway/Render (Socket Server)

```
┌─────────────────────────────────────────┐
│         Railway/Render Container         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Socket.io Server              │ │
│  │                                    │ │
│  │  - Persistent connections          │ │
│  │  - WebSocket support               │ │
│  │  - Real-time events                │ │
│  │  - Room management                 │ │
│  └────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

**Characteristics:**
- ✅ Persistent connections
- ✅ WebSocket support
- ✅ Always-on container
- ✅ No timeout limits
- ⚠️ Single instance (no auto-scaling)

---

## Security Architecture

### Authentication Flow

```
┌─────────┐
│ User    │
└────┬────┘
     │ 1. Login request
     │
     ▼
┌─────────────────┐
│ NextAuth.js     │
│ (Frontend)      │
└────┬────────────┘
     │ 2. Verify credentials
     │
     ▼
┌─────────────────┐
│ Backend API     │
│ /api/passenger  │
└────┬────────────┘
     │ 3. Check password hash
     │
     ▼
┌─────────────────┐
│ MongoDB         │
│ passenger coll. │
└────┬────────────┘
     │ 4. Return user data
     │
     ▼
┌─────────────────┐
│ JWT Token       │
│ (Session)       │
└─────────────────┘
```

### Security Layers

1. **Transport Security**
   - HTTPS/TLS encryption
   - Secure WebSocket (WSS)

2. **Authentication**
   - JWT tokens
   - OAuth (Google, GitHub)
   - Password hashing (bcrypt)

3. **Authorization**
   - Role-based access (passenger, rider, admin)
   - Session validation

4. **Data Security**
   - MongoDB Atlas encryption at rest
   - Environment variables for secrets
   - CORS restrictions

5. **API Security**
   - Rate limiting (Vercel)
   - Request size limits (10MB)
   - Input validation

---

## Scalability Considerations

### Current Setup
- **Frontend:** Auto-scales with Vercel CDN
- **Backend:** Auto-scales with Vercel serverless
- **Socket:** Single instance (bottleneck)
- **Database:** MongoDB Atlas (auto-scaling)

### Scaling Strategy

**Phase 1 (Current):**
- Single socket server
- Serverless backend
- Good for < 1000 concurrent users

**Phase 2 (Growth):**
- Multiple socket server instances
- Redis for socket state sharing
- Load balancer for socket servers

**Phase 3 (Scale):**
- Kubernetes for socket servers
- Microservices architecture
- Separate databases per service

---

## Monitoring & Logging

### Vercel
- Function logs
- Error tracking
- Performance metrics
- Deployment history

### MongoDB Atlas
- Connection monitoring
- Query performance
- Database metrics
- Alerts

### Application Logs
```javascript
console.log("📝 Register request received")
console.log("✅ User created successfully")
console.error("❌ Register error:", error)
```

---

## Cost Breakdown

### Vercel (Free Tier)
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Serverless functions
- ⚠️ 10-second timeout

### MongoDB Atlas (Free Tier)
- ✅ 512MB storage
- ✅ Shared cluster
- ⚠️ Limited connections

### Railway/Render (Free Tier)
- ✅ 500 hours/month
- ✅ 512MB RAM
- ⚠️ Sleeps after inactivity

**Total Cost:** $0/month (Free tier)

---

## Future Improvements

1. **Performance**
   - Redis caching
   - CDN for static assets
   - Database query optimization

2. **Reliability**
   - Multiple socket server instances
   - Database replication
   - Backup strategy

3. **Features**
   - Push notifications
   - Real-time chat
   - Video calls

4. **Monitoring**
   - Error tracking (Sentry)
   - Analytics (Google Analytics)
   - Performance monitoring (New Relic)
