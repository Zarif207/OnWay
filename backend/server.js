const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Database connection
async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Connect to database
connectDB();

const database = client.db("onWayDB"); //  database name
const passengerCollection = database.collection("passenger"); // passenger collection
// const passengerCollection = database.collection("users"); // users collection
const blogsCollection = database.collection("Blogs"); // blogs collection
const gpsLocationsCollection = database.collection("gpsLocations"); // gps locations collection

// Socket.io Event Handling
io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Driver/Passenger joins a specific ride room
  socket.on("joinRide", (rideId) => {
    socket.join(rideId);
    console.log(`Client ${socket.id} joined ride room: ${rideId}`);
  });

  // Receive GPS update from driver and broadcast to ride room
  socket.on("gpsUpdate", async (data) => {
    const { rideId, driverId, latitude, longitude } = data;

    // Broadcast to everyone in the room (including passenger)
    io.to(rideId).emit("receiveGpsUpdate", {
      driverId,
      latitude,
      longitude,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "onWay Backend running " });
});

// -----------------------------------------------------------------------
// Get Users
app.get("/api/passenger", async (req, res) => {
  try {
    const users = await passengerCollection.find({}).toArray();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get User
app.get("/api/passenger/find", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    const user = await passengerCollection.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Post User
app.post("/api/passenger", async (req, res) => {
  try {
    const { name, email, phone, password, role, image, authProvider } = req.body;

    if (!email || !name || (!password && !authProvider)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const existingUser = await passengerCollection.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    let newUser = {
      name,
      email,
      phone,
      image: image || "",
      role: role || "passenger",
      authProvider: authProvider || "credentials",
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    if (password) {
      newUser.password = await bcrypt.hash(password, 10);
    }

    const result = await passengerCollection.insertOne(newUser);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: result.insertedId, name, email },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Last Login 
app.patch("/api/passenger/update-login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const result = await passengerCollection.updateOne(
      { email: email },
      { $set: { lastLogin: new Date() } }
    );

    res.json({ success: true, message: "Login time updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Patch User
app.patch("/api/passenger/update-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await passengerCollection.updateOne(
      { email: email },
      { $set: { password: hashedPassword } },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// -------------------------------------------------------------------------

// BLOGS ROUTES
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await blogsCollection.find({}).toArray();
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// LOCATION TRACKING ROUTES

// Update driver location in DB
app.post("/api/location/update", async (req, res) => {
  try {
    const { driverId, rideId, latitude, longitude } = req.body;

    if (!driverId || !rideId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "DriverId, rideId, latitude, and longitude are required",
      });
    }

    const payload = {
      driverId,
      rideId,
      latitude,
      longitude,
      timestamp: new Date(),
    };

    // Keep history by inserting a new record each time.
    // Alternatively, to only keep the latest, use updateOne with upsert: true.
    const result = await gpsLocationsCollection.insertOne(payload);

    res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active location for a ride
app.get("/api/ride/active-location/:rideId", async (req, res) => {
  try {
    const { rideId } = req.params;

    // Get the most recent location for this ride
    const location = await gpsLocationsCollection.findOne(
      { rideId: rideId },
      { sort: { timestamp: -1 } }, // Sort descending to get the latest
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "No active location found for this ride",
      });
    }

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start Server
// ============================================
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

// Graceful Shutdown

process.on("SIGINT", async () => {
  console.log("\n⏳ Closing MongoDB connection...");
  await client.close();
  console.log("✅ MongoDB connection closed");
  process.exit(0);
});
