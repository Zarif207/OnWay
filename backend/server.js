require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Routes ---------------------------------
const passengerRoutes = require("./routes/passenger.routes");
const blogRoutes = require("./routes/blog.routes");
const locationRoutes = require("./routes/location.routes");
const reviewsRoutes = require("./routes/reviews.routes");
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
// ---------------------------------------

// ---------------------------------------
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
// --------------------------------------

// --------------------------------------
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
// --------------------------------------

// --------------------------------------
async function startServer() {
  await connectDB();
  const database = client.db("onWayDB");

  // ------------------------------------------------
  const passengerCollection = database.collection("passenger");
  const blogsCollection = database.collection("Blogs");
  const gpsLocationsCollection = database.collection("gpsLocations");
  const reviewsCollection = database.collection("reviews");
  // -----------------------------------------------------

  // Routes -----------------------------------------
  app.use("/api/passenger", passengerRoutes(passengerCollection));
  app.use("/api/blogs", blogRoutes(blogsCollection));
  app.use("/api/location", locationRoutes(gpsLocationsCollection));
  app.use("/api/reviews", reviewsRoutes(reviewsCollection));
  // ---------------------------------------------------

  // Socket.io ----------------------------
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on("joinRide", (rideId) => {
      socket.join(rideId);
    });
    socket.on("gpsUpdate", (data) => {
      const { rideId, driverId, latitude, longitude } = data;
      io.to(rideId).emit("receiveGpsUpdate", { driverId, latitude, longitude, timestamp: new Date(), });
    });
    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected`);
    });
  });
  // --------------------------------------

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
  // -----------------------------------------
}

startServer();