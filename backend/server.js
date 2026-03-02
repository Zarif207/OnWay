require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Routes ---------------------------------
const passengerRoutes = require("./routes/passenger");
const blogRoutes = require("./routes/blog");
const locationRoutes = require("./routes/location");
const ridesRoutes = require("./routes/rides");
const reviewsRoutes = require("./routes/reviews");
const bookingsRoutes = require("./routes/bookings");

const paymentRoutes = require("./routes/payment");
const ridersRoutes = require("./routes/riders");
// ---------------------------------------

// ---------------------------------------
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;


async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error(error);
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
    socket.on("gpsUpdate", (data) => {
      const { rideId, driverId, latitude, longitude } = data;
      io.to(rideId).emit("receiveGpsUpdate", { driverId, latitude, longitude, timestamp: new Date(), });
    });
    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected`);
    });
  });

  // ----------------------------------------
  app.get("/api/health", (req, res) => {
    res.json({ status: "onWay Backend running" });
  });
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });
  server.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

process.on("SIGINT", async () => {
  console.log("\n⏳ Closing MongoDB connection...");
  await client.close();
  console.log("✅ MongoDB connection closed");
  process.exit(0);
});

module.exports = server;
