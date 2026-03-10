
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const http = require("http");
const { Server } = require("socket.io");

const passengerRoutes = require("./routes/passenger");
const blogRoutes = require("./routes/blog");
const locationRoutes = require("./routes/location");
const ridesRoutes = require("./routes/rides");
const reviewsRoutes = require("./routes/reviews");
const supportRoutes = require("./routes/support");
const supportAgentRoutes = require("./routes/supportAgent");
const bookingsRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payment");
const ridersRoutes = require("./routes/riders");
const promoCodeRoutes = require("./routes/promo");
const emergencyRoutes = require("./routes/emergency");
const dashboardRoutes = require("./routes/dashboard");
const settingsRoutes = require("./routes/settings");
const notificationsRoutes = require("./routes/notifications");
const searchRoutes = require("./routes/search");
const notificationHelper = require("./utils/notificationHelper");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.io for backend (optional - for direct backend notifications)
// Note: Main socket server runs separately on port 4001
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:4001',
        'https://on-way-server.vercel.app',
        'https://onway-5g8a.onrender.com',
        process.env.FRONTEND_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in development
      }
    },
    credentials: true,
  },
});

// Set Socket.io instance in notification helper
notificationHelper.setSocketIO(io);

console.log("✅ Socket.io initialized for backend notifications");

// ✅ CORS Configuration for Production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://on-way-server.vercel.app',
      'https://onway-5g8a.onrender.com',
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 5000;

let cachedDb = null;
let isConnecting = false;

// ✅ Optimized MongoDB Connection for Vercel Serverless
async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return cachedDb;
  }

  try {
    isConnecting = true;
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connected");

    cachedDb = client.db("onWayDB");
    isConnecting = false;
    return cachedDb;
  } catch (error) {
    isConnecting = false;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// ✅ Middleware to attach database collections to request
app.use(async (req, res, next) => {
  try {
    const database = await connectDB();
    req.collections = {
      passengerCollection: database.collection("passenger"),
      blogsCollection: database.collection("Blogs"),
      gpsLocationsCollection: database.collection("gpsLocations"),
      ridesCollection: database.collection("rides"),
      reviewsCollection: database.collection("reviews"),
      knowledgeCollection: database.collection("knowledge"),
      bookingsCollection: database.collection("bookings"),
      paymentsCollection: database.collection("payments"),
      ridersCollection: database.collection("riders"),
      complaintsCollection: database.collection("complaints"),
      promoCodeCollection: database.collection("promoCode"),
      emergencyCollection: database.collection("emergency"),
      settingsCollection: database.collection("settings"),
      notificationsCollection: database.collection("notifications")
    };
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// ✅ Register routes
app.use("/api/passenger", (req, res, next) => {
  passengerRoutes(req.collections.passengerCollection)(req, res, next);
});

app.use("/api/blogs", (req, res, next) => {
  blogRoutes(req.collections.blogsCollection)(req, res, next);
});

app.use("/api/location", (req, res, next) => {
  locationRoutes(req.collections.gpsLocationsCollection)(req, res, next);
});

app.use("/api/rides", (req, res, next) => {
  ridesRoutes(req.collections.ridesCollection)(req, res, next);
});

app.use("/api/reviews", (req, res, next) => {
  reviewsRoutes(req.collections.reviewsCollection)(req, res, next);
});

app.use("/api/support", (req, res, next) => {
  supportRoutes(req.collections.knowledgeCollection)(req, res, next);
});

app.use("/api/support-agent", (req, res, next) => {
  supportAgentRoutes(req.collections)(req, res, next);
});

app.use("/api/bookings", (req, res, next) => {
  bookingsRoutes(req.collections.bookingsCollection)(req, res, next);
});

app.use("/api/payment", (req, res, next) => {
  paymentRoutes(req.collections.paymentsCollection)(req, res, next);
});

app.use("/api/riders", (req, res, next) => {
  ridersRoutes(req.collections.ridersCollection)(req, res, next);
});

app.use("/api/promo", (req, res, next) => {
  promoCodeRoutes(req.collections.promoCodeCollection)(req, res, next);
});

app.use("/api/emergency", (req, res, next) => {
  emergencyRoutes(req.collections.emergencyCollection)(req, res, next);
});

app.use("/api/dashboard", (req, res, next) => {
  dashboardRoutes(req.collections)(req, res, next);
});

app.use("/api/settings", (req, res, next) => {
  settingsRoutes(req.collections.settingsCollection)(req, res, next);
});

app.use("/api/notifications", (req, res, next) => {
  notificationsRoutes(req.collections.notificationsCollection)(req, res, next);
});

app.use("/api/search", (req, res, next) => {
  searchRoutes(req.collections)(req, res, next);
});

// ✅ Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "onWay Backend running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Test endpoint for debugging
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    headers: req.headers,
    method: req.method,
    url: req.url
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ✅ Start server for local development
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔔 Socket.io ready for notifications`);
  });
}

// ✅ For Vercel serverless
module.exports = app;
