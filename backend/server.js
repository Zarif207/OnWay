require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const passengerRoutes = require("./routes/passenger");
const blogRoutes = require("./routes/blog");
const locationRoutes = require("./routes/location");
const ridesRoutes = require("./routes/rides");
const reviewsRoutes = require("./routes/reviews");
const supportRoutes = require("./routes/support");
const bookingsRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payment");
const ridersRoutes = require("./routes/riders");
const promoCodeRoutes = require("./routes/promo");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

const app = express();

// ✅ CORS Configuration for Production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://on-way-server.vercel.app',
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

// ✅ Initialize collections (called on each request in serverless)
async function getCollections() {
  const database = await connectDB();
  
  return {
    passengerCollection: database.collection("passenger"),
    blogsCollection: database.collection("Blogs"),
    gpsLocationsCollection: database.collection("gpsLocations"),
    ridesCollection: database.collection("rides"),
    reviewsCollection: database.collection("reviews"),
    knowledgeCollection: database.collection("knowledge"),
    bookingsCollection: database.collection("bookings"),
    paymentsCollection: database.collection("payments"),
    ridersCollection: database.collection("riders"),
    promoCodeCollection: database.collection("promoCode"),
  };
}

// ✅ Middleware to ensure DB connection and attach collections
app.use(async (req, res, next) => {
  try {
    if (!req.collections) {
      req.collections = await getCollections();
    }
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ 
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ Register routes OUTSIDE of connectDB (critical for Vercel)
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

// ✅ Local development server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
