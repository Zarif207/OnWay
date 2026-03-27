require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");

// ── Route factories ───────────────────────────────────────────
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
const geocodingRoutes = require("./routes/geocoding");
const trafficRoutes = require("./routes/traffic");
const routingRoutes = require("./routes/routing");
const promoCodeRoutes = require("./routes/promo");
const emergencyRoutes = require("./routes/emergency");
const dashboardRoutes = require("./routes/dashboard");
const settingsRoutes = require("./routes/settings");
const notificationsRoutes = require("./routes/notifications");
const searchRoutes = require("./routes/search");
const kycRoutes = require("./routes/kyc");
const noticeRoutes = require("./routes/notice");
const lostItemsRoutes = require("./routes/lostItems");
const { newsletterRoute, transporter } = require("./routes/newsletter");

// ── MongoDB ───────────────────────────────────────────────────
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

let cachedDb = null;
let isConnecting = false;

async function connectDB() {
  if (cachedDb) return cachedDb;
  if (isConnecting) {
    // Wait for the in-progress connection
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (!isConnecting) { clearInterval(check); resolve(); }
      }, 50);
    });
    return cachedDb;
  }
  try {
    isConnecting = true;
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    cachedDb = client.db("onWayDB");
    console.log("✅ MongoDB connected");
    isConnecting = false;
    return cachedDb;
  } catch (err) {
    isConnecting = false;
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

// ── Build collections object ──────────────────────────────────
function buildCollections(db) {
  return {
    passengerCollection: db.collection("passenger"),
    blogsCollection: db.collection("Blogs"),
    gpsLocationsCollection: db.collection("gpsLocations"),
    ridesCollection: db.collection("rides"),
    reviewsCollection: db.collection("reviews"),
    knowledgeCollection: db.collection("knowledge"),
    bookingsCollection: db.collection("bookings"),
    paymentsCollection: db.collection("payments"),
    ridersCollection: db.collection("riders"),
    complaintsCollection: db.collection("complaints"),
    promoCodeCollection: db.collection("promoCode"),
    emergencyCollection: db.collection("emergency"),
    settingsCollection: db.collection("settings"),
    notificationsCollection: db.collection("notifications"),
    lostItemsCollection: db.collection("lostItems"),
  };
}

// ── Express App ───────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    const allowed = [
      "http://localhost:3000",
      "http://localhost:5000",
      "https://onway-94jm.onrender.com",
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health (no DB needed) ─────────────────────────────────────
app.get("/", (_req, res) => res.json({ message: "OnWay API is running" }));
app.get("/api/health", (_req, res) =>
  res.json({
    status: "onWay Backend running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
);

// ── DB + Router initialization middleware ─────────────────────
// Routers are cached after first successful DB connection so they
// are only built ONCE per serverless instance — not per request.
let routersReady = false;

app.use(async (req, res, next) => {
  try {
    const db = await connectDB();

    if (!routersReady) {
      const col = buildCollections(db);

      // Mount all routers exactly once
      app.use("/api/passenger", passengerRoutes(col.passengerCollection));
      app.use("/api/blogs", blogRoutes(col.blogsCollection, null, transporter));
      app.use("/api/location", locationRoutes(col.gpsLocationsCollection));
      app.use("/api/rides", ridesRoutes(col.ridesCollection));
      app.use("/api/reviews", reviewsRoutes(col.reviewsCollection));
      app.use("/api/support", supportRoutes(col.knowledgeCollection));
      app.use("/api/support-agent", supportAgentRoutes(col));
      app.use("/api/bookings", bookingsRoutes(col));
      app.use("/api/payment", paymentRoutes(col.paymentsCollection));
      app.use("/api/riders", ridersRoutes(col));
      app.use("/api/driver", ridersRoutes(col));
      app.use("/api/rider", ridersRoutes(col));
      app.use("/api/geocoding", geocodingRoutes);
      app.use("/api/traffic", trafficRoutes);
      app.use("/api/routing", routingRoutes);
      app.use("/api/promo", promoCodeRoutes(col.promoCodeCollection, null, transporter));
      app.use("/api/emergency", emergencyRoutes(col.emergencyCollection));
      app.use("/api/dashboard", dashboardRoutes(col));
      app.use("/api/settings", settingsRoutes(col.settingsCollection));
      app.use("/api/notifications", notificationsRoutes(col.notificationsCollection));
      app.use("/api/search", searchRoutes(col));
      app.use("/api/kyc", kycRoutes(col));
      app.use("/api/notice", noticeRoutes(col));
      app.use("/api/lost-items", lostItemsRoutes(col.lostItemsCollection));
      app.use("/api/item-recovery", lostItemsRoutes(col.lostItemsCollection));
      app.use("/api/newsletter", newsletterRoute);

      // Re-add 404 + error handlers AFTER all routes
      app.use((req2, res2) => {
        res2.status(404).json({ success: false, message: "Route not found", path: req2.path });
      });
      app.use((err, req2, res2, _next) => {
        console.error("Global error:", err);
        res2.status(err.status || 500).json({
          success: false,
          message: err.message || "Internal server error",
          error: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
      });

      routersReady = true;
      console.log("✅ All routers initialized");

      // Re-dispatch this first request now that routes are mounted
      req.collections = buildCollections(db);
      return app(req, res);
    }

    // Make collections available on req for any route that still uses req.collections
    req.collections = buildCollections(db);
    next();
  } catch (err) {
    console.error("❌ DB init error:", err);
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// ── Fallback 404 (only reached if DB init fails before routersReady) ─────────
app.use((req, res, next) => {
  // If routersReady is true, the dynamic 404 handler inside the block handles it.
  // This only fires if the DB middleware called next() before routes were mounted.
  if (!routersReady) {
    return res.status(503).json({ success: false, message: "Server initializing, please retry" });
  }
  next();
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ── Start (local dev only) ────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
