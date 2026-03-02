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
const supportRoutes = require("./routes/support");
const bookingsRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payment");
const ridersRoutes = require("./routes/riders");
const promoCodeRoutes = require("./routes/promo");
// ---------------------------------------

// ---------------------------------------
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

// ---------------------------------------

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

// --------------------------------------
async function startServer() {
  await connectDB();
  const database = client.db("onWayDB");

  // ------------------------------------------------
  const passengerCollection = database.collection("passenger");
  const blogsCollection = database.collection("Blogs");
  const gpsLocationsCollection = database.collection("gpsLocations");
  const ridesCollection = database.collection("rides");
  const reviewsCollection = database.collection("reviews");
  const knowledgeCollection = database.collection("knowledge");
  await knowledgeCollection.createIndex({ question: "text", answer: "text" });
  const bookingsCollection = database.collection("bookings");
  const paymentsCollection = database.collection("payments");
  const ridersCollection = database.collection("riders");
  const promoCodeCollection = database.collection("promoCode");
  //------------------------------------------------------

  // Routes -----------------------------------------
  app.use("/api/passenger", passengerRoutes(passengerCollection));
  app.use("/api/blogs", blogRoutes(blogsCollection));
  app.use("/api/location", locationRoutes(gpsLocationsCollection));
  app.use("/api/rides", ridesRoutes(ridesCollection));
  app.use("/api/reviews", reviewsRoutes(reviewsCollection));
  app.use("/api/support", supportRoutes(knowledgeCollection));
  app.use("/api/bookings", bookingsRoutes(bookingsCollection));
  app.use("/api/payment", paymentRoutes(paymentsCollection));
  app.use("/api/riders", ridersRoutes(ridersCollection));
  app.use("/api/promo", promoCodeRoutes(promoCodeCollection));
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

startServer();