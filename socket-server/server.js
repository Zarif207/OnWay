require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion } = require("mongodb");

const PORT = process.env.SOCKET_PORT || 4001;
const uri = process.env.MONGODB_URI;

// Validate MongoDB URI
if (!uri) {
  console.error("❌ ERROR: MONGODB_URI is not defined in .env file");
  console.error("Please create a .env file in socket-server directory with:");
  console.error("MONGODB_URI=your_mongodb_connection_string");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

// Store active connections for monitoring
const activeConnections = new Map();

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

// Verify JWT token (simple validation - enhance for production)
function verifyToken(token) {
  // In development, allow any token for testing
  if (process.env.NODE_ENV === 'development') {
    return { valid: true };
  }

  // TODO: Implement proper JWT verification with your AUTH_SECRET
  if (!token || token.length < 10) {
    return null;
  }

  // In production, decode JWT and verify signature
  // const jwt = require("jsonwebtoken");
  // const decoded = jwt.verify(token, process.env.AUTH_SECRET);
  // return decoded;

  return { valid: true }; // Placeholder - implement proper JWT verification
}

// Check if user is admin or authorized role
function isAdmin(userRole) {
  const authorizedRoles = ["admin", "supportAgent", "rider", "passenger"];
  return authorizedRoles.includes(userRole);
}

async function startSocketServer() {
  await connectDB();
  const database = client.db("onWayDB");
  const gpsLocationsCollection = database.collection("gpsLocations");
  const notificationsCollection = database.collection("notifications");
  const rideSessionsCollection = database.collection("rideSessions");

  // Create HTTP server
  const server = http.createServer();

  // Create Socket.io server with CORS and authentication
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost:5000",
        "https://on-way-neon.vercel.app",
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Connection timeout
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ✅ Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userRole = socket.handshake.auth.role;
    const userId = socket.handshake.auth.userId;

    console.log(`🔐 Authentication attempt - Role: ${userRole}, UserId: ${userId}, Token: ${token ? 'Present' : 'Missing'}`);

    // In development, be more lenient
    if (process.env.NODE_ENV === 'development') {
      // Allow connection if userId and role are present
      if (userId && userRole) {
        // Check if user is admin or support agent
        if (isAdmin(userRole)) {
          socket.userId = userId;
          socket.userRole = userRole;
          socket.authenticated = true;
          console.log(`✅ Authentication successful (DEV MODE) - ${userRole} (${userId})`);
          return next();
        } else {
          console.log(`❌ Authorization failed - Role: ${userRole} is not authorized`);
          return next(new Error("Authorization failed: Admin access required"));
        }
      }
    }

    // Verify token
    const verified = verifyToken(token);

    if (!verified) {
      console.log(`❌ Authentication failed - Invalid token`);
      return next(new Error("Authentication failed: Invalid token"));
    }

    // Check if user is admin or support agent
    if (!isAdmin(userRole)) {
      console.log(`❌ Authorization failed - Role: ${userRole} is not authorized`);
      return next(new Error("Authorization failed: Admin access required"));
    }

    // Attach user info to socket
    socket.userId = userId;
    socket.userRole = userRole;
    socket.authenticated = true;

    console.log(`✅ Authentication successful - ${userRole} (${userId})`);
    next();
  });

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log(`🔌 Admin client connected: ${socket.id} (${socket.userRole})`);

    // Store active connection
    activeConnections.set(socket.id, {
      userId: socket.userId,
      role: socket.userRole,
      connectedAt: new Date(),
    });

    // Log connection to database
    rideSessionsCollection.insertOne({
      socketId: socket.id,
      userId: socket.userId,
      role: socket.userRole,
      type: "admin_connection",
      connectedAt: new Date(),
      status: "active",
    }).catch(err => console.error("Error logging connection:", err));

    // Join user-specific notification room (admin only)
    socket.on("joinNotifications", (userId) => {
      if (!socket.authenticated) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      socket.join(`user_${userId}`);
      console.log(`🔔 Admin ${socket.id} joined notifications for user: ${userId}`);

      socket.emit("joinedNotifications", {
        userId,
        message: "Successfully joined notification room"
      });
    });

    // ✅ Join ride tracking room (admin monitoring)
    socket.on("joinRide", (rideId) => {
      if (!socket.authenticated) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      socket.join(`ride_${rideId}`);
      console.log(`📍 Admin ${socket.id} monitoring ride: ${rideId}`);

      socket.emit("joinedRide", {
        rideId,
        message: "Successfully joined ride monitoring"
      });
    });

    // ✅ Handle GPS updates (from driver app) - Store in DB first
    socket.on("gpsUpdate", async (data) => {
      const { rideId, driverId, latitude, longitude, speed, heading } = data;

      try {
        // ✅ Save GPS location to database FIRST
        const gpsData = {
          rideId,
          driverId,
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
          timestamp: new Date(),
          socketId: socket.id,
        };

        const result = await gpsLocationsCollection.insertOne(gpsData);

        console.log(`📍 GPS saved to DB: Ride ${rideId}, Driver ${driverId}`);

        // ✅ Then broadcast to admin dashboard monitoring this ride
        io.to(`ride_${rideId}`).emit("receiveGpsUpdate", {
          _id: result.insertedId,
          ...gpsData,
        });

        // Send acknowledgment
        socket.emit("gpsUpdateAck", {
          success: true,
          rideId,
          savedId: result.insertedId
        });

      } catch (error) {
        console.error("❌ Error saving GPS location:", error);
        socket.emit("gpsUpdateAck", {
          success: false,
          error: "Failed to save GPS data"
        });
      }
    });

    // ✅ Handle sending notifications - Store in DB first
    socket.on("sendNotification", async (data) => {
      if (!socket.authenticated) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      const { userId, message, type, metadata } = data;

      try {
        // ✅ Save notification to database FIRST
        const notification = {
          userId,
          message,
          type,
          metadata: metadata || {},
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          sentBy: socket.userId,
          sentByRole: socket.userRole,
        };

        const result = await notificationsCollection.insertOne(notification);

        const savedNotification = {
          _id: result.insertedId,
          ...notification
        };

        console.log(`🔔 Notification saved to DB and sent to user ${userId}: ${type}`);

        // ✅ Then emit to specific user's notification room
        io.to(`user_${userId}`).emit("newNotification", savedNotification);

        // Send acknowledgment to sender
        socket.emit("notificationSent", {
          success: true,
          notificationId: result.insertedId
        });

      } catch (error) {
        console.error("❌ Error sending notification:", error);
        socket.emit("notificationSent", {
          success: false,
          error: "Failed to send notification"
        });
      }
    });

    // ✅ Get active rides (admin monitoring)
    socket.on("getActiveRides", async () => {
      if (!socket.authenticated) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      try {
        const activeRides = await rideSessionsCollection
          .find({ status: "active", type: "ride" })
          .sort({ startedAt: -1 })
          .limit(50)
          .toArray();

        socket.emit("activeRides", {
          success: true,
          rides: activeRides
        });
      } catch (error) {
        console.error("Error fetching active rides:", error);
        socket.emit("activeRides", {
          success: false,
          error: "Failed to fetch active rides"
        });
      }
    });

    // ✅ Get connection statistics (admin only)
    socket.on("getConnectionStats", () => {
      if (!socket.authenticated || socket.userRole !== "admin") {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      const stats = {
        totalConnections: activeConnections.size,
        connections: Array.from(activeConnections.values()),
        timestamp: new Date(),
      };

      socket.emit("connectionStats", stats);
    });

    // ✅ Handle disconnection
    socket.on("disconnect", async (reason) => {
      console.log(`🔌 Admin client disconnected: ${socket.id} - Reason: ${reason}`);

      // Remove from active connections
      activeConnections.delete(socket.id);

      // Update session in database
      try {
        await rideSessionsCollection.updateOne(
          { socketId: socket.id, status: "active" },
          {
            $set: {
              status: "disconnected",
              disconnectedAt: new Date(),
              disconnectReason: reason,
            }
          }
        );
      } catch (error) {
        console.error("Error updating disconnection:", error);
      }
    });

    // ✅ Handle errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  //  Periodic cleanup of old GPS data (run every hour)
  setInterval(async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await gpsLocationsCollection.deleteMany({
        timestamp: { $lt: oneDayAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} old GPS records`);
      }
    } catch (error) {
      console.error("Error cleaning up GPS data:", error);
    }
  }, 60 * 60 * 1000); // Every hour

  // Export io instance for use in other modules
  global.io = io;

  // Start the server
  server.listen(PORT, () => {
    console.log(`🚀 Socket.io server running on http://localhost:${PORT}`);
    console.log(`🔐 Authentication: ENABLED`);
    console.log(`📊 Admin monitoring: ACTIVE`);
    console.log(`💾 Database persistence: ENABLED`);
  });
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏳ Closing MongoDB connection...");

  // Close all active socket connections
  if (global.io) {
    global.io.close();
  }

  await client.close();
  console.log("✅ MongoDB connection closed");
  process.exit(0);
});

startSocketServer();
