
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const http = require("http");
const { Server } = require("socket.io");

const passengerRoutes = require("./routes/passenger");
const blogRoutes = require("./routes/blog");
const locationRoutes = require("./routes/location");
const ridesRoutes = require("./routes/rides");
const reviewsRoutes = require("./routes/reviews");
const supportRoutes = require("./routes/support");
const supportAgentRoutes = require("./routes/supportAgent");
const bookingsRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/payment");

const ridersRoutes = require("./routes/riders");


// const ridersRoutes = require("./routes/riderRoutes");

// const ridersRoutes = require("./routes/riders");
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
const notice = require("./routes/notice");
const notificationHelper = require("./utils/notificationHelper");
const socketStore = require("./utils/socketStore");
const RiderSimulator = require("./services/riderSimulator");
const { newsletterRoute, transporter } = require("./routes/newsletter");
const lostItemsRoutes = require("./routes/lostItems");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io for backend 
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
        callback(null, true);
      }
    },
    credentials: true,
  },
});

// Set Socket.io instance in notification helper
notificationHelper.setSocketIO(io);

console.log(" Socket.io initialized for backend notifications");

//  CORS Configuration for Production
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

// Serve static uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Socket.io Logic
// 🔐 Authentication Middleware
io.use((socket, next) => {
  const { userId, role } = socket.handshake.auth;

  console.log(`🔐 Socket Auth Attempt - Role: ${role}, userId: ${userId}`);

  if (!userId || !role) {
    console.log("❌ Socket Auth Failed: Missing userId or role");
    return next(new Error("Authentication failed: Missing userId or role"));
  }

  const validRoles = ["admin", "rider", "passenger"];
  if (!validRoles.includes(role)) {
    console.log(`❌ Socket Auth Failed: Invalid role: ${role}`);
    return next(new Error(`Authentication failed: Invalid role ${role}`));
  }

  // Attach data to socket
  socket.userId = userId;
  socket.userRole = role;

  next();
});

io.on("connection", (socket) => {
  const { userId, userRole } = socket;
  console.log(`🔌 User connected: ${socket.id} (Role: ${userRole}, Id: ${userId})`);

  // Helper for consistent rider store syncing
  const syncRiderStore = async (riderId) => {
    try {
      const database = await connectDB();
      const ridersCollection = database.collection("riders");
      const rider = await ridersCollection.findOne({ _id: new ObjectId(riderId) });

      if (rider) {
        socketStore.setRider(riderId, {
          socketId: socket.id,
          status: rider.status || "online",
          isApproved: rider.isApproved,
          operationCities: rider.operationCities || [],
          vacationMode: rider.vacationMode || false,
          lat: rider.location?.coordinates[1],
          lng: rider.location?.coordinates[0]
        });

        const riderRoom = `rider:${riderId}`;
        socket.join(riderRoom);
        console.log(`� [SYNC] Rider ${riderId} synced to store and joined ${riderRoom} (Status: ${rider.status})`);

        // Broadcast to passengers
        io.emit("riders:update", socketStore.getAllRiders());
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ [SYNC] Error for rider ${riderId}:`, error);
      return false;
    }
  };

  // PART 1 — Auto-join targeted rooms & Auto-sync
  if (userRole === "rider") {
    socket.join(`driver:${userId}`);
    syncRiderStore(userId); // Auto-sync on connection
    console.log(`🚛 Rider ${userId} joined room: driver:${userId}`);
  } else if (userRole === "passenger") {
    socket.join(`passenger:${userId}`);
    console.log(`👤 Passenger ${userId} joined room: passenger:${userId}`);
  } else if (userRole === "admin") {
    socket.join("admin");
  }

  // PART 2 — Handle Rider Status Changes
  socket.on("rider:online", async (riderId) => {
    console.log(`🟢 [STATUS] Rider online signal: ${riderId}`);
    await syncRiderStore(riderId);
    socket.emit("request-rider-location");
  });

  socket.on("rider:offline", async (riderId) => {
    if (!riderId) return;
    const riderRoom = `rider:${riderId}`;
    socket.leave(riderRoom);
    socketStore.removeRider(riderId);
    io.emit("riders:update", socketStore.getAllRiders());
    console.log(`🔴 [STATUS] Rider ${riderId} removed from store`);
  });

  // Keep for backward compatibility / explicit toggles
  socket.on("rider:set-online", async (data) => {
    const { riderId, isOnline } = data;
    if (!riderId) return;
    if (isOnline) {
      await syncRiderStore(riderId);
      socket.emit("request-rider-location");
    } else {
      socket.emit("rider:offline", riderId);
    }
  });

  // Handle Rider Location Updates
  socket.on("rider:update-location", async (data) => {
    try {
      const { riderId, lat, lng } = data;
      if (!riderId || lat === undefined || lng === undefined) return;

      // Ensure rider is in store with status online
      socketStore.setRider(riderId, {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        socketId: socket.id,
        status: "online" // Force online if they are sending locations
      });

      io.emit("riders:update", socketStore.getAllRiders());

      // Persist to DB periodically
      const database = await connectDB();
      const ridersCollection = database.collection("riders");

      const rider = await ridersCollection.findOne({ _id: new ObjectId(riderId) });
      if (rider && rider.currentRideId) {
        const rideRoom = `ride:${rider.currentRideId.toString()}`;
        io.to(rideRoom).emit("driver:location:updated", { lat, lng });
      }

      await ridersCollection.updateOne(
        { _id: new ObjectId(riderId) },
        {
          $set: {
            location: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            status: "online",
            lastLocationUpdate: new Date()
          }
        }
      );
    } catch (error) {
      console.error("❌ Error updating rider location:", error);
    }
  });

  // Handle Passenger Request for online riders
  socket.on("get-online-riders", () => {
    socket.emit("online-riders", socketStore.getAllRiders());
  });

  // PART 5 — Handle Rider Acceptance with Simulation
  socket.on("ride:accept", async (data) => {
    try {
      const { bookingId, riderId } = data;
      const database = await connectDB();
      const bookingsCollection = database.collection("bookings");
      const ridersCollection = database.collection("riders");
      const rideSimulation = require("./services/rideSimulationService");

      // Booking check
      const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
      if (!booking || booking.bookingStatus !== "searching") {
        return socket.emit("ride:rejected", { message: "Ride is no longer available." });
      }

      // Rider check
      const rider = await ridersCollection.findOne({ _id: new ObjectId(riderId) });
      if (!rider) {
        return socket.emit("ride:rejected", { message: "Rider not found." });
      }

      // Booking update
      await bookingsCollection.updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            bookingStatus: "accepted",
            riderId: new ObjectId(riderId),
            acceptedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      );

      // Rider status update
      await ridersCollection.updateOne(
        { _id: new ObjectId(riderId) },
        { $set: { status: "busy", currentRideId: new ObjectId(bookingId) } }
      );

      socket.join(`ride:${bookingId}`);

      const driverDetails = {
        name: rider.name || "Driver",
        phone: rider.phone || "",
        image: rider.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.name || "Driver"}`,
        avatar: rider.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.name || "Driver"}`,
        rating: rider.rating || 4.8,
        vehicle: {
          type: rider.vehicle?.category || rider.vehicleType || "Car",
          brand: rider.vehicle?.model || rider.vehicleDetails?.brand || "Car",
          plate: rider.vehicle?.number || rider.vehicleDetails?.plate || "N/A",
          color: rider.vehicleDetails?.color || "White",
        },
      };

      const passengerId = booking.passengerId?.toString();

      const acceptancePayload = {
        bookingId,
        rideId: bookingId,
        riderId,
        driverId: riderId,
        driver: driverDetails,
        otp: booking.otp,        // ← OTP passenger কে পাঠাও
      };

      // ✅ সব possible room এ emit — যেটায় passenger join করেছে সেটায় পাবে
      io.to(`passenger:${passengerId}`).emit("ride:accepted", acceptancePayload);
      io.to(`passenger:${passengerId}`).emit("rideAccepted", acceptancePayload);
      io.to(`user:${passengerId}`).emit("ride:accepted", acceptancePayload);
      io.to(`user:${passengerId}`).emit("rideAccepted", acceptancePayload);
      io.to(`user_${passengerId}`).emit("ride:accepted", acceptancePayload);

      socket.emit("ride:accept:success", { bookingId });

      console.log(`✅ Ride accepted: ${bookingId}`);
      console.log(`📨 Notified passenger rooms: passenger:${passengerId}, user:${passengerId}, user_${passengerId}`);

      // Simulation শুরু করো
      const serviceAreas = rider?.serviceAreas || [];
      const pickupLat = booking.pickupLocation?.lat;
      const pickupLng = booking.pickupLocation?.lng;

      if (pickupLat && pickupLng) {
        rideSimulation.startSimulation(
          bookingId,
          riderId,
          serviceAreas,
          pickupLat,
          pickupLng,
          io,
          async (rideId) => {
            await bookingsCollection.updateOne(
              { _id: new ObjectId(rideId) },
              { $set: { bookingStatus: "arrived", arrivedAt: new Date() } }
            );

            // Passenger কে notify করো driver arrived
            io.to(`passenger:${passengerId}`).emit("driver:arrived", { bookingId: rideId });
            io.to(`user:${passengerId}`).emit("driver:arrived", { bookingId: rideId });

            console.log(`📍 Driver arrived at pickup: ${rideId}`);
          }
        );
      }

    } catch (error) {
      console.error("❌ Ride Acceptance Error:", error);
      socket.emit("ride:rejected", { message: "Server error during acceptance." });
    }
  });

  // Handle alternative ride acceptance event
  socket.on("rideAccepted", async (data) => {
    socket.emit("ride:accept", {
      bookingId: data.rideId,
      riderId: data.driverId
    });
  });

  // Handle ride room joining
  socket.on("join:room", (data) => {
    const { room } = data;
    socket.join(room);
    console.log(`🚪 Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", async () => {
    if (socket.userRole === "rider") {
      try {
        console.log(`🔌 Rider ${socket.userId} disconnected`);
        socketStore.removeRider(socket.userId);
        io.emit("riders:update", socketStore.getAllRiders());

        const database = await connectDB();
        const ridersCollection = database.collection("riders");
        await ridersCollection.updateOne(
          { _id: new ObjectId(socket.userId) },
          { $set: { status: "offline", updatedAt: new Date() } }
        );
        console.log(`📴 [STATUS] Rider went offline on disconnect: ${socket.userId}`);
      } catch (error) {
        console.error("❌ Error on rider disconnect:", error);
      }
    }
  });
});

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

let cachedDb = null;
let isConnecting = false;

//  Optimized MongoDB Connection for Vercel Serverless
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
    console.log(" MongoDB connected");

    cachedDb = client.db("onWayDB");
    isConnecting = false;

    // Start Rider Simulation
    const simulator = new RiderSimulator(cachedDb, io);
    simulator.start();

    return cachedDb;
  } catch (error) {
    isConnecting = false;
    console.error(" MongoDB connection error:", error);
    throw error;
  }
}

// Middleware to attach database collections to request
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
      notificationsCollection: database.collection("notifications"),
      lostItemsCollection: database.collection("lostItems")
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

// Register routes
app.use("/api/passenger", (req, res, next) => {
  passengerRoutes(req.collections.passengerCollection)(req, res, next);
});

app.use("/api/blogs", (req, res, next) => {
  blogRoutes(
    req.collections.blogsCollection,
    req.collections.newsletterCollection,
    transporter
  )(req, res, next);
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
  bookingsRoutes(req.collections)(req, res, next);
});

app.use("/api/payment", (req, res, next) => {
  paymentRoutes(req.collections.paymentsCollection)(req, res, next);
});

app.use("/api/riders", (req, res, next) => {
  ridersRoutes(req.collections)(req, res, next);
});

app.use("/api/driver", (req, res, next) => {
  ridersRoutes(req.collections)(req, res, next);
});

app.use("/api/rider", (req, res, next) => {
  ridersRoutes(req.collections)(req, res, next);
});
app.use("/api/geocoding", geocodingRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/routing", routingRoutes);

app.use("/api/promo", (req, res, next) => {
  promoCodeRoutes(
    req.collections.promoCodeCollection,
    req.collections.newsletterCollection,
    transporter
  )(req, res, next);
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

app.use("/api/lost-items", (req, res, next) => {
  lostItemsRoutes(req.collections.lostItemsCollection)(req, res, next);
});

// Alias for the Support Agent dashboard
app.use("/api/item-recovery", (req, res, next) => {
  lostItemsRoutes(req.collections.lostItemsCollection)(req, res, next);
});

// ✅ Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "onWay Backend running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


// Test endpoint for debugging
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    headers: req.headers,
    method: req.method,
    url: req.url
  });
});

//  404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method
  });
});

//  Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

//  Start server for local development
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔔 Socket.io ready for notifications`);
  });
}

//  For Vercel serverless
module.exports = app;
