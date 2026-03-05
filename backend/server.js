require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Route imports
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
const emergencyRoutes = require("./routes/emergency");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

// ✅ CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5000",
      "https://on-way-server.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  try {
    await client.connect();
    console.log("✅ MongoDB connected");
    cachedDb = client.db("onWayDB");
    return cachedDb;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function start() {
  const database = await connectDB();

  // Collections
  const collections = {
    passenger: database.collection("passenger"),
    blogs: database.collection("Blogs"),
    gpsLocations: database.collection("gpsLocations"),
    rides: database.collection("rides"),
    reviews: database.collection("reviews"),
    knowledge: database.collection("knowledge"),
    bookings: database.collection("bookings"),
    payments: database.collection("payments"),
    riders: database.collection("riders"),
    promoCode: database.collection("promoCode"),
    emergency: database.collection("emergency"),
  };

  // Initialize Text Index
  await collections.knowledge.createIndex({ question: "text", answer: "text" });

  // Routes
  app.use("/api/passenger", passengerRoutes(collections.passenger));
  app.use("/api/blogs", blogRoutes(collections.blogs));
  app.use("/api/location", locationRoutes(collections.gpsLocations));
  app.use("/api/rides", ridesRoutes(collections.rides));
  app.use("/api/reviews", reviewsRoutes(collections.reviews));
  app.use("/api/support", supportRoutes(collections.knowledge));
  app.use("/api/bookings", bookingsRoutes(collections.bookings));
  app.use("/api/payment", paymentRoutes(collections.payments));
  app.use("/api/riders", ridersRoutes(collections.riders));
  app.use("/api/promo", promoCodeRoutes(collections.promoCode));
  app.use("/api/emergency", emergencyRoutes(collections.emergency));

  // Socket.io
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("joinRide", (rideId) => {
      socket.join(rideId);
    });

    socket.on("gpsUpdate", (data) => {
      const { rideId, driverId, latitude, longitude } = data;
      io.to(rideId).emit("receiveGpsUpdate", {
        driverId,
        latitude,
        longitude,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected`);
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "onWay Backend running",
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start();

module.exports = app;
