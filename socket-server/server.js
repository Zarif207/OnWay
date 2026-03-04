require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion } = require("mongodb");

const PORT = process.env.SOCKET_PORT || 4001;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connected (Socket Server)");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function startSocketServer() {
  await connectDB();
  const database = client.db("onWayDB");
  const gpsLocationsCollection = database.collection("gpsLocations");

  // Create HTTP server
  const server = http.createServer();

  // Create Socket.io server with CORS
  const io = new Server(server, {
    cors: {
      origin: "*", // In production, specify your frontend URL
      methods: ["GET", "POST"],
    },
  });

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a specific ride room
    socket.on("joinRide", (rideId) => {
      socket.join(rideId);
      console.log(`📍 Socket ${socket.id} joined ride: ${rideId}`);
    });

    // Handle GPS updates
    socket.on("gpsUpdate", async (data) => {
      const { rideId, driverId, latitude, longitude } = data;
      
      // Save GPS location to database (optional)
      try {
        await gpsLocationsCollection.insertOne({
          rideId,
          driverId,
          latitude,
          longitude,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error saving GPS location:", error);
      }

      // Broadcast GPS update to all clients in the ride room
      io.to(rideId).emit("receiveGpsUpdate", {
        driverId,
        latitude,
        longitude,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // Start the server
  server.listen(PORT, () => {
    console.log(`🚀 Socket.io server running on http://localhost:${PORT}`);
  });
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏳ Closing MongoDB connection...");
  await client.close();
  console.log("✅ MongoDB connection closed");
  process.exit(0);
});

startSocketServer();
