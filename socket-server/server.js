require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// ------------------- CONFIGURATION -------------------
const PORT = process.env.SOCKET_PORT || 4001;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ ERROR: MONGODB_URI is not defined");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

// ------------------- GLOBAL STATE -------------------
const onlineUsers = new Map(); // userId -> socketId
const activeConnections = new Map(); // socketId -> user info

// ------------------- HELPER FUNCTIONS -------------------
function verifyToken(token) {
  if (process.env.NODE_ENV === 'development') return { valid: true };
  if (!token || token.length < 10) return null;
  return { valid: true }; // TODO: Replace with real JWT verification
}

function isAdmin(userRole) {
  const authorizedRoles = ["admin", "supportAgent", "rider", "passenger"];
  return authorizedRoles.includes(userRole);
}

// ------------------- DATABASE CONNECTION -------------------
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully (Socket Server)");
    return client.db("onWayDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

// ------------------- SOCKET HANDLERS -------------------
function setupSocket(io, collections) {
  const {
    gpsLocationsCollection,
    notificationsCollection,
    rideSessionsCollection,
    chatCollection,
    bookingsCollection,
    ridersCollection
  } = collections;

  io.on("connection", (socket) => {
    console.log(`🔌 New connection: ${socket.id} (Role: ${socket.userRole || 'guest'})`);

    // --- Admin/Role Tracking ---
    if (socket.authenticated) {
      activeConnections.set(socket.id, {
        userId: socket.userId,
        role: socket.userRole,
        connectedAt: new Date(),
      });

      rideSessionsCollection.insertOne({
        socketId: socket.id,
        userId: socket.userId,
        role: socket.userRole,
        type: "connection_log",
        connectedAt: new Date(),
        status: "active",
      }).catch(err => console.error("Error logging connection:", err));
    }

    // --- User Registration & Rooms ---
    socket.on("registerUser", ({ userId, role }) => {
      if (!userId) return;
      onlineUsers.set(String(userId), socket.id);
      socket.join(`user_${userId}`);
      console.log(`👤 User registered: ${userId} (${role || 'no role'})`);
    });

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
      console.log(`🛋️ Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on("join:room", ({ room }) => {
      socket.join(room);
      console.log(`🛋️ Socket ${socket.id} joined custom room: ${room}`);
    });

    socket.on("joinSupport", () => {
      socket.join("support");
      console.log(`🎧 Support agent ${socket.id} joined support room`);
    });

    socket.on("joinNotifications", (userId) => {
      socket.join(`user_${userId}`);
      socket.emit("joinedNotifications", { userId, message: "Joined notification room" });
    });

    socket.on("joinRide", (rideId) => {
      socket.join(`ride_${rideId}`);
      socket.emit("joinedRide", { rideId, message: "Joined ride monitoring" });
    });

    // --- GPS & Real-time Location ---
    socket.on("gpsUpdate", async (data) => {
      const { rideId, driverId, latitude, longitude, speed, heading } = data;
      try {
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
        // Broadcast to specific ride rooms
        io.to(`ride_${rideId}`).emit("receiveGpsUpdate", { _id: result.insertedId, ...gpsData });
        io.to(`ride:${rideId}`).emit("riderLocationUpdate", data);
        io.to(`ride:${rideId}`).emit("driver:location:updated", data);

        socket.emit("gpsUpdateAck", { success: true, rideId, savedId: result.insertedId });
      } catch (error) {
        console.error("❌ GPS Update Error:", error);
        socket.emit("gpsUpdateAck", { success: false, error: "Failed to save GPS data" });
      }
    });

    socket.on("riderLocationUpdate", (data) => {
      const { rideId } = data;
      io.to(`ride:${rideId}`).emit("riderLocationUpdate", data);
      io.to(`ride:${rideId}`).emit("driver:location:updated", data);
    });

    // --- Ride Flow ---
    socket.on("ride:accept", async (data) => {
      const { bookingId, riderId } = data;
      try {
        const bookingOid = new ObjectId(bookingId);
        const riderOid = new ObjectId(riderId);

        const result = await bookingsCollection.findOneAndUpdate(
          { _id: bookingOid, bookingStatus: "searching" },
          { $set: { bookingStatus: "accepted", riderId: riderOid, updatedAt: new Date() } },
          { returnDocument: "after" }
        );

        if (!result) {
          socket.emit("ride:accept:error", { message: "Ride is no longer available" });
          return;
        }

      // Mark messages as read
      socket.on("markAsRead", async ({ roomId, userId }) => {
        if (!roomId || !userId) return;
        try {
          await chatCollection.updateMany(
            { roomId, isRead: false, senderId: { $ne: String(userId) } },
            { $set: { isRead: true } }
          );
          io.to(roomId).emit("messagesSeen", { roomId, userId });
          if (roomId.startsWith("support_")) {
            io.to("support").emit("supportSessionUpdated", { roomId });
          }
        } catch (error) {
          console.error("markAsRead error:", error);
        }
      });

      // WebRTC Signaling (Call features)
      socket.on("callUser", ({ toUserId, offer, fromUserId }) => {
        const target = onlineUsers.get(String(toUserId));
        if (target) io.to(target.socketId).emit("incomingCall", { fromUserId, offer });
      });

        socket.join(`ride:${bookingId}`);
        const acceptancePayload = {
          bookingId, rideId: bookingId, driverId: riderId, riderId, driver: driverDetails,
          otp: updatedBooking.otp, eta: "5-10", distance: "2.5 km"
        };

        io.to(`user:${updatedBooking.passengerId}`).emit("ride:accepted", acceptancePayload);
        io.to(`user:${updatedBooking.passengerId}`).emit("rideAccepted", acceptancePayload);
        socket.emit("ride:accept:success", { bookingId });
      } catch (error) {
        console.error("❌ Ride Accept Error:", error);
        socket.emit("ride:accept:error", { message: "Internal server error" });
      }
    });

    socket.on("driver:arrived", async (data) => {
      const { bookingId } = data;
      try {
        await bookingsCollection.updateOne({ _id: new ObjectId(bookingId) }, { $set: { bookingStatus: "arrived", updatedAt: new Date() } });
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        io.to(`user:${booking.passengerId}`).emit("driver:arrived", { bookingId, message: "Driver arrived" });
        io.to(`ride:${bookingId}`).emit("ride:status:updated", { status: "arrived" });
      } catch (err) { console.error("Arrived error:", err); }
    });

    socket.on("ride:start", async (data) => {
      const { bookingId } = data;
      try {
        await bookingsCollection.updateOne({ _id: new ObjectId(bookingId) }, { $set: { bookingStatus: "started", updatedAt: new Date() } });
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        io.to(`user:${booking.passengerId}`).emit("ride:started", { bookingId });
        io.to(`ride:${bookingId}`).emit("ride:status:updated", { status: "started" });
      } catch (err) { console.error("Start error:", err); }
    });

    socket.on("ride:complete", async (data) => {
      const { bookingId, riderId } = data;
      try {
        await bookingsCollection.updateOne({ _id: new ObjectId(bookingId) }, { $set: { bookingStatus: "completed", updatedAt: new Date() } });
        await ridersCollection.updateOne({ _id: new ObjectId(riderId) }, { $set: { status: "online", currentRideId: null } });
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        io.to(`user:${booking.passengerId}`).emit("ride:completed", { bookingId });
        io.to(`ride:${bookingId}`).emit("ride:status:updated", { status: "completed" });
      } catch (err) { console.error("Complete error:", err); }
    });

    // --- Chat & Presence ---
    socket.on("typing", ({ roomId, userId, userName }) => {
      socket.to(roomId).emit("userTyping", { roomId, userId, userName });
    });

    socket.on("stopTyping", ({ roomId, userId }) => {
      socket.to(roomId).emit("userStopTyping", { roomId, userId });
    });

    socket.on("markAsRead", async ({ roomId, userId }) => {
      if (!roomId || !userId) return;
      try {
        await chatCollection.updateMany(
          { roomId, isRead: false, senderId: { $ne: String(userId) } },
          { $set: { isRead: true } }
        );
        io.to(roomId).emit("messagesSeen", { roomId, userId });
        if (roomId.startsWith("support_")) io.to("support").emit("supportSessionUpdated", { roomId });
      } catch (err) { console.error("markAsRead error:", err); }
    });

    // --- WebRTC / Calls ---
    socket.on("callUser", ({ toUserId, offer, fromUserId }) => {
      const target = onlineUsers.get(String(toUserId));
      if (target) io.to(target).emit("incomingCall", { fromUserId, offer });
    });

    socket.on("answerCall", ({ toUserId, answer }) => {
      const target = onlineUsers.get(String(toUserId));
      if (target) io.to(target).emit("callAccepted", { answer });
    });

    socket.on("iceCandidate", ({ toUserId, candidate }) => {
      const target = onlineUsers.get(String(toUserId));
      if (target) io.to(target).emit("iceCandidate", { candidate });
    });

    socket.on("endCall", ({ toUserId }) => {
      const target = onlineUsers.get(String(toUserId));
      if (target) io.to(target).emit("callEnded");
    });

    // --- Notifications ---
    socket.on("sendNotification", async (data) => {
      if (!socket.authenticated) return;
      const { userId, message, type, metadata } = data;
      try {
        const sessions = await chatCollection.aggregate([
          { $match: { chatType: "support" } },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$roomId",
              roomId: { $first: "$roomId" },
              lastMessage: { $first: "$message" },
              lastMessageTime: { $first: "$createdAt" },
              // passenger name — pick from a passenger-sent message
              senderName: {
                $first: {
                  $cond: [{ $ne: ["$senderRole", "support"] }, "$senderName", "$$REMOVE"]
                }
              },
              passengerId: { $first: "$passengerId" },
              unreadCount: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ["$isRead", false] }, { $ne: ["$senderRole", "support"] }] },
                    1, 0
                  ]
                }
              },
              updatedAt: { $first: "$createdAt" }
            }
          },
          // fallback: if senderName is null (all messages from support), get any name
          {
            $lookup: {
              from: "chats",
              let: { rid: "$roomId" },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: ["$roomId", "$$rid"] }, { $ne: ["$senderRole", "support"] }] } } },
                { $sort: { createdAt: 1 } },
                { $limit: 1 }
              ],
              as: "passengerMsg"
            }
          },
          {
            $addFields: {
              senderName: {
                $cond: [
                  { $ifNull: ["$senderName", false] },
                  "$senderName",
                  { $arrayElemAt: ["$passengerMsg.senderName", 0] }
                ]
              }
            }
          },
          { $project: { passengerMsg: 0 } },
          { $sort: { updatedAt: -1 } }
        ]).toArray();
        res.json(sessions);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch sessions" });
      }
    });

    // --- Stats ---
    socket.on("getConnectionStats", () => {
      if (!socket.authenticated || socket.userRole !== "admin") return;
      socket.emit("connectionStats", {
        totalConnections: activeConnections.size,
        connections: Array.from(activeConnections.values()),
        timestamp: new Date(),
      });
    });

    // --- Disconnection ---
    socket.on("disconnect", async (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} - Reason: ${reason}`);
      activeConnections.delete(socket.id);

      // Cleanup onlineUsers map
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      try {
        await rideSessionsCollection.updateOne(
          { socketId: socket.id, status: "active" },
          { $set: { status: "disconnected", disconnectedAt: new Date(), disconnectReason: reason } }
        );
      } catch (err) { /* ignore */ }
    });
  });
}

// ------------------- EXPRESS ROUTES -------------------
function setupRoutes(app, collections) {
  const { chatCollection, rideSessionsCollection } = collections;

  // Chat API
  app.post("/api/chat/send", async (req, res) => {
    try {
      const data = req.body;
      let { chatType, roomId, senderId, passengerId, riderId, senderRole, message, messageType, fileUrl } = data;

      chatType = chatType === "support" ? "support" : "ride";
      if (chatType === "ride" && !String(roomId).startsWith("ride_")) roomId = `ride_${roomId}`;
      if (chatType === "support" && !String(roomId).startsWith("support_")) roomId = `support_${roomId}`;

      const chatMessage = {
        roomId: String(roomId), rideId: data.rideId || null, passengerId: passengerId ? String(passengerId) : null,
        riderId: riderId ? String(riderId) : null, senderId: String(senderId), senderName: data.senderName || null,
        senderRole: senderRole || "passenger", chatType, message: message || "",
        messageType: messageType || "text", fileUrl: fileUrl || null, isRead: false, createdAt: new Date()
      };

      const result = await chatCollection.insertOne(chatMessage);
      chatMessage._id = result.insertedId;

      global.io.to(String(roomId)).emit("receiveMessage", chatMessage);

      // Notify support agents
      if (chatType === "support") global.io.to("support").emit("supportSessionUpdated", { roomId });

      // Signal chat update to driver/passenger
      if (chatType === "ride") {
        const rId = onlineUsers.get(String(riderId));
        const pId = onlineUsers.get(String(passengerId));
        if (rId) global.io.to(rId).emit("riderChatUpdated", { roomId });
        if (pId) global.io.to(pId).emit("riderChatUpdated", { roomId });
      }

      res.status(201).json(chatMessage);
    } catch (error) {
      console.error("API send error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/chat/history/:roomId", async (req, res) => {
    try {
      const { roomId } = req.params;
      const history = await chatCollection.find({ roomId }).sort({ createdAt: 1 }).toArray();
      res.json(history || []);
    } catch (err) { res.status(500).json({ error: "Failed to load history" }); }
  });

  app.get("/api/support/sessions", async (req, res) => {
    try {
      const sessions = await chatCollection.aggregate([
        { $match: { chatType: "support" } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$roomId", roomId: { $first: "$roomId" }, passengerId: { $first: "$passengerId" },
            senderName: { $first: "$senderName" }, lastMessage: { $first: "$message" },
            createdAt: { $first: "$createdAt" }, unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $ne: ["$senderRole", "support"] }] }, 1, 0] } }
          }
        },
        { $sort: { createdAt: -1 } }
      ]).toArray();
      res.json(sessions);
    } catch (err) { res.status(500).json({ error: "Failed to fetch support sessions" }); }
  });

  // Health Check
  app.get("/api/health", (req, res) => res.json({ status: "OnWay Socket Server Running", timestamp: new Date() }));
}

// ------------------- SERVER STARTUP -------------------
async function startServer() {
  const database = await connectDB();

  const collections = {
    chatCollection: database.collection("chats"),
    gpsLocationsCollection: database.collection("gpsLocations"),
    notificationsCollection: database.collection("notifications"),
    rideSessionsCollection: database.collection("rideSessions"),
    bookingsCollection: database.collection("bookings"),
    ridersCollection: database.collection("riders"),
  };

  // Indexes
  await collections.chatCollection.createIndex({ roomId: 1 });
  await collections.chatCollection.createIndex({ createdAt: -1 });

  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:4000", "http://localhost:5000", "https://on-way-neon.vercel.app", process.env.FRONTEND_URL].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  global.io = io;

  // --- Auth Middleware ---
  io.use((socket, next) => {
    const { token, role, userId } = socket.handshake.auth;
    if (process.env.NODE_ENV === 'development' && userId && role) {
      socket.userId = userId; socket.userRole = role; socket.authenticated = true;
      return next();
    }
    const verified = verifyToken(token);
    if (verified && isAdmin(role)) {
      socket.userId = userId; socket.userRole = role; socket.authenticated = true;
      return next();
    }
    next(); // Allow unauthenticated but limited
  });

  setupSocket(io, collections);
  setupRoutes(app, collections);

  // GPS Cleanup
  setInterval(async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await collections.gpsLocationsCollection.deleteMany({ timestamp: { $lt: oneDayAgo } });
    } catch (err) { console.error("Cleanup error:", err); }
  }, 3600000);

  server.listen(PORT, () => {
    console.log(`🚀 Socket.io Server running on port ${PORT}`);
  });
}

// ------------------- GRACEFUL SHUTDOWN -------------------
const shutdown = async () => {
  console.log("\n⏳ Closing MongoDB connection...");
  if (global.io) global.io.close();
  await client.close();
  console.log("✅ MongoDB connection closed");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Launch
startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});