require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const PORT = process.env.SOCKET_PORT || 4001;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ ERROR: MONGODB_URI is not defined");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: true },
});

const onlineUsers = new Map(); // userId -> socketId
const activeConnections = new Map(); // socketId -> user info

function verifyToken(token) {
  if (process.env.NODE_ENV === "development") return { valid: true };
  if (!token || token.length < 10) return null;
  return { valid: true };
}

function isAdmin(userRole) {
  return ["admin", "supportAgent", "rider", "passenger"].includes(userRole);
}

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

// ─────────────────────────────────────────────────────────────
function setupSocket(io, collections) {
  const {
    gpsLocationsCollection,
    notificationsCollection,
    rideSessionsCollection,
    chatCollection,
    bookingsCollection,
    ridersCollection,
  } = collections;

  io.on("connection", (socket) => {
    const uid = socket.userId;
    const role = socket.userRole;
    console.log(`🔌 New connection: ${socket.id} (Role: ${role || "guest"} | ID: ${uid || "?"})`);

    // ── Auto room join on connect ──────────────────────────
    if (uid && role === "passenger") {
      socket.join(`passenger:${uid}`);
      socket.join(`user:${uid}`);
      socket.join(`user_${uid}`);
      onlineUsers.set(String(uid), socket.id);
      console.log(`👤 Passenger auto-joined rooms: ${uid}`);
    }
    if (uid && role === "rider") {
      socket.join(`rider:${uid}`);
      socket.join(`driver:${uid}`);
      onlineUsers.set(String(uid), socket.id);
      console.log(`🚗 Rider auto-joined rooms: ${uid}`);
    }

    // ── Admin/Role Tracking ────────────────────────────────
    if (socket.authenticated) {
      activeConnections.set(socket.id, { userId: uid, role, connectedAt: new Date() });
      rideSessionsCollection.insertOne({
        socketId: socket.id, userId: uid, role,
        type: "connection_log", connectedAt: new Date(), status: "active",
      }).catch(() => { });
    }

    // ── registerUser ───────────────────────────────────────
    socket.on("registerUser", ({ userId, role: r }) => {
      if (!userId) return;
      onlineUsers.set(String(userId), socket.id);
      socket.join(`user_${userId}`);
      socket.join(`user:${userId}`);
      if (r === "passenger") {
        socket.join(`passenger:${userId}`);
        console.log(`👤 Passenger registered: ${userId}`);
      } else if (r === "rider") {
        socket.join(`rider:${userId}`);
        socket.join(`driver:${userId}`);
        console.log(`🚗 Rider registered: ${userId}`);
      }
    });

    // ── Rider online/offline ───────────────────────────────
    socket.on("rider:online", (riderId) => {
      if (!riderId) return;
      socket.join(`rider:${riderId}`);
      socket.join(`driver:${riderId}`);
      onlineUsers.set(String(riderId), socket.id);
      console.log(`🟢 Rider online: ${riderId}`);
    });

    socket.on("rider:offline", (riderId) => {
      if (!riderId) return;
      socket.leave(`rider:${riderId}`);
      socket.leave(`driver:${riderId}`);
      onlineUsers.delete(String(riderId));
      console.log(`🔴 Rider offline: ${riderId}`);
    });

    socket.on("rider:set-online", ({ riderId, isOnline }) => {
      if (!riderId) return;
      if (isOnline) {
        socket.join(`rider:${riderId}`);
        socket.join(`driver:${riderId}`);
        onlineUsers.set(String(riderId), socket.id);
        console.log(`🟢 Rider set-online: ${riderId}`);
      } else {
        onlineUsers.delete(String(riderId));
      }
    });

    // ── Room joins ─────────────────────────────────────────
    socket.on("joinRoom", ({ roomId }) => { socket.join(roomId); });
    socket.on("join:room", ({ room }) => { socket.join(room); });
    socket.on("joinSupport", () => { socket.join("support"); });
    socket.on("joinRide", (rideId) => { socket.join(`ride_${rideId}`); socket.emit("joinedRide", { rideId }); });
    socket.on("joinNotifications", (userId) => {
      socket.join(`user_${userId}`);
      socket.join(`user:${userId}`);
      socket.emit("joinedNotifications", { userId, message: "Joined notification room" });
      console.log(`🔔 Notification join: ${userId}`);
    });

    // ── Location updates ───────────────────────────────────
    const handleRiderLocationUpdate = async (data) => {
      const { rideId, riderId, lat, lng } = data;
      if (rideId) {
        io.to(`ride:${rideId}`).emit("riderLocationUpdate", data);
        io.to(`ride:${rideId}`).emit("driver:location:updated", data);
      }
      if (riderId && lat !== undefined && lng !== undefined) {
        try {
          await ridersCollection.updateOne(
            { _id: new ObjectId(riderId) },
            {
              $set: {
                location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                status: "online",
                lastLocationUpdate: new Date(),
              }
            }
          );
          // Active ride থাকলে passenger কে পাঠাও
          const rider = await ridersCollection.findOne({ _id: new ObjectId(riderId) });
          if (rider?.currentRideId) {
            const booking = await bookingsCollection.findOne({ _id: rider.currentRideId });
            if (booking?.passengerId) {
              const pid = booking.passengerId.toString();
              io.to(`passenger:${pid}`).emit("driver:location:updated", { lat, lng });
              io.to(`user:${pid}`).emit("driver:location:updated", { lat, lng });
            }
          }
        } catch (err) { console.error("Location DB error:", err.message); }
      }
    };

    socket.on("riderLocationUpdate", handleRiderLocationUpdate);
    socket.on("rider:update-location", handleRiderLocationUpdate);

    socket.on("gpsUpdate", async (data) => {
      const { rideId, driverId, latitude, longitude, speed, heading } = data;
      try {
        const gpsData = { rideId, driverId, latitude, longitude, speed: speed || 0, heading: heading || 0, timestamp: new Date(), socketId: socket.id };
        const result = await gpsLocationsCollection.insertOne(gpsData);
        io.to(`ride_${rideId}`).emit("receiveGpsUpdate", { _id: result.insertedId, ...gpsData });
        io.to(`ride:${rideId}`).emit("riderLocationUpdate", data);
        io.to(`ride:${rideId}`).emit("driver:location:updated", data);
        socket.emit("gpsUpdateAck", { success: true, rideId, savedId: result.insertedId });
      } catch (error) {
        console.error("❌ GPS Update Error:", error);
        socket.emit("gpsUpdateAck", { success: false, error: "Failed to save GPS data" });
      }
    });

    // ── HTTP dispatch থেকে আসা ride forward ───────────────
    socket.on("dispatch_to_rider", ({ riderId, ridePayload }) => {
      io.to(`rider:${riderId}`).emit("new-ride-request", ridePayload);
      io.to(`driver:${riderId}`).emit("new-ride-request", ridePayload);
      console.log(`🚀 dispatch_to_rider: ${riderId}`);
    });

    // ── ride:accept ────────────────────────────────────────
    socket.on("ride:accept", async (data) => {
      const { bookingId, riderId } = data;
      console.log(`\n🚗 ride:accept | booking: ${bookingId} | rider: ${riderId}`);
      try {
        const bookingOid = new ObjectId(bookingId);
        const riderOid = new ObjectId(riderId);

        const result = await bookingsCollection.findOneAndUpdate(
          { _id: bookingOid, bookingStatus: "searching" },
          { $set: { bookingStatus: "accepted", riderId: riderOid, acceptedAt: new Date(), updatedAt: new Date() } },
          { returnDocument: "after" }
        );

        if (!result) {
          socket.emit("ride:accept:error", { message: "Ride is no longer available" });
          return;
        }

        const updatedBooking = result;
        await ridersCollection.updateOne(
          { _id: riderOid },
          { $set: { status: "busy", currentRideId: bookingOid } }
        );

        const driver = await ridersCollection.findOne({ _id: riderOid });
        const driverDetails = {
          name: driver?.name || driver?.firstName || "Driver",
          image: driver?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver?.name || "Driver"}`,
          phone: driver?.phone || "",
          rating: driver?.rating || 5.0,
          vehicle: {
            type: driver?.vehicle?.category || driver?.vehicleType || "Car",
            brand: driver?.vehicle?.model || driver?.vehicleDetails?.brand || "Car",
            plate: driver?.vehicle?.number || driver?.vehicleDetails?.plate || "N/A",
            color: driver?.vehicleDetails?.color || "White",
          },
        };

        socket.join(`ride:${bookingId}`);

        const passengerId = updatedBooking.passengerId?.toString();
        const payload = {
          bookingId, rideId: bookingId,
          driverId: riderId, riderId,
          driver: driverDetails,
          otp: updatedBooking.otp,
        };

        // সব possible room এ emit
        io.to(`passenger:${passengerId}`).emit("ride:accepted", payload);
        io.to(`passenger:${passengerId}`).emit("rideAccepted", payload);
        io.to(`user:${passengerId}`).emit("ride:accepted", payload);
        io.to(`user:${passengerId}`).emit("rideAccepted", payload);
        io.to(`user_${passengerId}`).emit("ride:accepted", payload);
        io.to(`user_${passengerId}`).emit("rideAccepted", payload);

        socket.emit("ride:accept:success", { bookingId });
        console.log(`✅ ride:accepted → passenger rooms: passenger:${passengerId}, user:${passengerId}, user_${passengerId}`);

        // Debug: সব connected socket দেখাও
        const allSockets = await io.fetchSockets();
        console.log(`   Connected sockets: ${allSockets.length}`);
        allSockets.forEach(s => {
          console.log(`   - ${s.id} | rooms: [${[...s.rooms].join(", ")}]`);
        });

      } catch (error) {
        console.error("❌ Ride Accept Error:", error);
        socket.emit("ride:accept:error", { message: "Internal server error" });
      }
    });

    // ── send_price_offer ───────────────────────────────────
    socket.on("send_price_offer", async (data) => {
      const { bookingId, riderId, offeredPrice } = data;
      try {
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        if (!booking) return;
        const passengerId = booking.passengerId?.toString();
        const payload = { bookingId, rideId: bookingId, driverId: riderId, offeredPrice };

        io.to(`passenger:${passengerId}`).emit("price_offer_received", payload);
        io.to(`user:${passengerId}`).emit("price_offer_received", payload);
        io.to(`user_${passengerId}`).emit("price_offer_received", payload);
        console.log(`💸 Price offer ৳${offeredPrice} → passenger: ${passengerId}`);
      } catch (err) { console.error("Price offer error:", err.message); }
    });

    // ── confirm_booking ────────────────────────────────────
    socket.on("confirm_booking", async (data) => {
      const { rideId, driverId } = data;
      try {
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(rideId) });
        if (!booking) return;

        await bookingsCollection.updateOne(
          { _id: new ObjectId(rideId) },
          { $set: { bookingStatus: "accepted", riderId: new ObjectId(driverId), updatedAt: new Date() } }
        );
        await ridersCollection.updateOne(
          { _id: new ObjectId(driverId) },
          { $set: { status: "busy", currentRideId: new ObjectId(rideId) } }
        );

        const rider = await ridersCollection.findOne({ _id: new ObjectId(driverId) });
        const passengerId = booking.passengerId?.toString();

        const payload = {
          bookingId: rideId,
          otp: booking.otp,
          driver: {
            name: rider?.name || "Driver",
            phone: rider?.phone || "",
            image: rider?.image || "",
            rating: rider?.rating || 5.0,
            vehicle: rider?.vehicle || {},
          },
        };

        io.to(`rider:${driverId}`).emit("booking_confirmed_by_passenger", { bookingId: rideId });
        io.to(`driver:${driverId}`).emit("booking_confirmed_by_passenger", { bookingId: rideId });

        io.to(`passenger:${passengerId}`).emit("ride:accepted", payload);
        io.to(`user:${passengerId}`).emit("ride:accepted", payload);
        io.to(`user_${passengerId}`).emit("ride:accepted", payload);
        console.log(`✅ Booking confirmed: ${rideId}`);
      } catch (err) { console.error("Confirm booking error:", err.message); }
    });

    // ── driver:arrived ─────────────────────────────────────
    socket.on("driver:arrived", async (data) => {
      const { bookingId } = data;
      try {
        await bookingsCollection.updateOne(
          { _id: new ObjectId(bookingId) },
          { $set: { bookingStatus: "arrived", arrivedAt: new Date() } }
        );
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        const passengerId = booking?.passengerId?.toString();

        const arrivedPayload = { bookingId, message: "Driver arrived", otp: booking?.otp };
        io.to(`passenger:${passengerId}`).emit("driver:arrived", arrivedPayload);
        io.to(`user:${passengerId}`).emit("driver:arrived", arrivedPayload);
        io.to(`user_${passengerId}`).emit("driver:arrived", arrivedPayload);
        io.to(`ride:${bookingId}`).emit("ride:status:updated", { status: "arrived" });
        console.log(`📍 Driver arrived, OTP: ${booking?.otp} → passenger: ${passengerId}`);
      } catch (err) { console.error("Arrived error:", err.message); }
    });

    // ── verify_otp ─────────────────────────────────────────
    socket.on("verify_otp", async (data) => {
      const { rideId, enteredOtp } = data;
      try {
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(rideId) });
        if (!booking) return socket.emit("otp_verified", { success: false, message: "Booking not found" });

        if (String(booking.otp) !== String(enteredOtp)) {
          return socket.emit("otp_verified", { success: false, message: "Invalid OTP" });
        }

        await bookingsCollection.updateOne(
          { _id: new ObjectId(rideId) },
          { $set: { bookingStatus: "picked_up", startedAt: new Date() } }
        );

        const passengerId = booking.passengerId?.toString();
        io.to(`passenger:${passengerId}`).emit("trip_started", { bookingId: rideId });
        io.to(`user:${passengerId}`).emit("trip_started", { bookingId: rideId });
        io.to(`user_${passengerId}`).emit("trip_started", { bookingId: rideId });
        io.to(`ride:${rideId}`).emit("ride:status:updated", { status: "picked_up" });

        socket.emit("otp_verified", { success: true, bookingId: rideId });
        console.log(`✅ OTP verified, trip started: ${rideId}`);
      } catch (err) { console.error("OTP verify error:", err.message); }
    });

    // ── ride:start ─────────────────────────────────────────
    socket.on("ride:start", async (data) => {
      const { bookingId } = data;
      try {
        await bookingsCollection.updateOne(
          { _id: new ObjectId(bookingId) },
          { $set: { bookingStatus: "started", updatedAt: new Date() } }
        );
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        const passengerId = booking?.passengerId?.toString();

        io.to(`passenger:${passengerId}`).emit("ride:started", { bookingId });
        io.to(`user:${passengerId}`).emit("ride:started", { bookingId });
        io.to(`user_${passengerId}`).emit("trip_started", { bookingId });
        io.to(`ride:${bookingId}`).emit("ride:status:updated", { status: "started" });
        console.log(`🚀 Ride started: ${bookingId}`);
      } catch (err) { console.error("Start error:", err.message); }
    });

    // ── ride:complete ──────────────────────────────────────
    socket.on("ride:complete", async (data) => {
      const { bookingId, riderId } = data;
      try {
        await bookingsCollection.updateOne(
          { _id: new ObjectId(bookingId) },
          { $set: { bookingStatus: "completed", completedAt: new Date() } }
        );
        await ridersCollection.updateOne(
          { _id: new ObjectId(riderId) },
          { $set: { status: "online", currentRideId: null } }
        );
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        const passengerId = booking?.passengerId?.toString();

        io.to(`passenger:${passengerId}`).emit("ride:completed", { bookingId });
        io.to(`user:${passengerId}`).emit("ride:completed", { bookingId });
        io.to(`user_${passengerId}`).emit("ride:completed", { bookingId });
        io.to(`ride:${bookingId}`).emit("ride:status:updated", { status: "completed" });
        console.log(`✅ Ride completed: ${bookingId}`);
      } catch (err) { console.error("Complete error:", err.message); }
    });

    // ── Chat ───────────────────────────────────────────────
    socket.on("typing", ({ roomId, userId, userName }) => { socket.to(roomId).emit("userTyping", { roomId, userId, userName }); });
    socket.on("stopTyping", ({ roomId, userId }) => { socket.to(roomId).emit("userStopTyping", { roomId, userId }); });

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

    // ── WebRTC ─────────────────────────────────────────────
    socket.on("callUser", ({ toUserId, offer, fromUserId }) => { const t = onlineUsers.get(String(toUserId)); if (t) io.to(t).emit("incomingCall", { fromUserId, offer }); });
    socket.on("answerCall", ({ toUserId, answer }) => { const t = onlineUsers.get(String(toUserId)); if (t) io.to(t).emit("callAccepted", { answer }); });
    socket.on("iceCandidate", ({ toUserId, candidate }) => { const t = onlineUsers.get(String(toUserId)); if (t) io.to(t).emit("iceCandidate", { candidate }); });
    socket.on("endCall", ({ toUserId }) => { const t = onlineUsers.get(String(toUserId)); if (t) io.to(t).emit("callEnded"); });

    // ── Notifications ──────────────────────────────────────
    socket.on("sendNotification", async (data) => {
      if (!socket.authenticated) return;
      const { userId, message, type, metadata } = data;
      try {
        const notification = {
          userId, message, type, isRead: false,
          createdAt: new Date(), updatedAt: new Date(),
          metadata: metadata || {}, sentBy: socket.userId, sentByRole: socket.userRole,
        };
        const result = await notificationsCollection.insertOne(notification);
        io.to(`user_${userId}`).emit("newNotification", { _id: result.insertedId, ...notification });
        socket.emit("notificationSent", { success: true, notificationId: result.insertedId });
      } catch (err) { console.error("Notification error:", err); }
    });

    // ── Stats ──────────────────────────────────────────────
    socket.on("getConnectionStats", () => {
      if (!socket.authenticated || socket.userRole !== "admin") return;
      socket.emit("connectionStats", {
        totalConnections: activeConnections.size,
        connections: Array.from(activeConnections.values()),
        timestamp: new Date(),
      });
    });

    // ── Disconnect ─────────────────────────────────────────
    socket.on("disconnect", async (reason) => {
      console.log(`🔌 Disconnected: ${socket.id} (${reason})`);
      activeConnections.delete(socket.id);
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) { onlineUsers.delete(userId); break; }
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

// ─────────────────────────────────────────────────────────────
function setupRoutes(app, collections) {
  const { chatCollection } = collections;

  // Dispatch API — API server (5000) এর জন্য
  app.post("/api/dispatch", (req, res) => {
    try {
      const { riderIds, ridePayload } = req.body;
      if (!riderIds || !ridePayload) {
        return res.status(400).json({ error: "Missing riderIds or ridePayload" });
      }
      riderIds.forEach((riderId) => {
        global.io.to(`rider:${riderId}`).emit("new-ride-request", ridePayload);
        global.io.to(`driver:${riderId}`).emit("new-ride-request", ridePayload);
        console.log(`🚀 Dispatched to rider: ${riderId}`);
      });
      res.status(200).json({ success: true, dispatched: riderIds.length });
    } catch (error) {
      console.error("Dispatch error:", error);
      res.status(500).json({ error: "Failed to dispatch" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const data = req.body;
      let { chatType, roomId, senderId, passengerId, riderId, senderRole, message, messageType, fileUrl } = data;
      chatType = chatType === "support" ? "support" : "ride";
      if (chatType === "ride" && !String(roomId).startsWith("ride_")) roomId = `ride_${roomId}`;
      if (chatType === "support" && !String(roomId).startsWith("support_")) roomId = `support_${roomId}`;

      const chatMessage = {
        roomId: String(roomId), rideId: data.rideId || null,
        passengerId: passengerId ? String(passengerId) : null,
        riderId: riderId ? String(riderId) : null,
        senderId: String(senderId), senderName: data.senderName || null,
        senderRole: senderRole || "passenger", chatType,
        message: message || "", messageType: messageType || "text",
        fileUrl: fileUrl || null, isRead: false, createdAt: new Date(),
      };

      const result = await chatCollection.insertOne(chatMessage);
      chatMessage._id = result.insertedId;
      global.io.to(String(roomId)).emit("receiveMessage", chatMessage);
      if (chatType === "support") global.io.to("support").emit("supportSessionUpdated", { roomId });

      res.status(201).json(chatMessage);
    } catch (error) {
      console.error("Chat send error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/chat/history/:roomId", async (req, res) => {
    try {
      const history = await chatCollection.find({ roomId: req.params.roomId }).sort({ createdAt: 1 }).toArray();
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
            _id: "$roomId", roomId: { $first: "$roomId" },
            passengerId: { $first: "$passengerId" }, senderName: { $first: "$senderName" },
            lastMessage: { $first: "$message" }, createdAt: { $first: "$createdAt" },
            unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $ne: ["$senderRole", "support"] }] }, 1, 0] } },
          }
        },
        { $sort: { createdAt: -1 } },
      ]).toArray();
      res.json(sessions);
    } catch (err) { res.status(500).json({ error: "Failed to fetch sessions" }); }
  });

  app.get("/api/health", (_, res) => res.json({ status: "OnWay Socket Server Running", port: PORT, timestamp: new Date() }));
}

// ─────────────────────────────────────────────────────────────
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

  await collections.chatCollection.createIndex({ roomId: 1 });
  await collections.chatCollection.createIndex({ createdAt: -1 });

  const app = express();
  const server = http.createServer(app);

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost:5000",
        "https://on-way-neon.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  global.io = io;

  io.use((socket, next) => {
    const { token, role, userId } = socket.handshake.auth;
    if (process.env.NODE_ENV === "development" && userId && role) {
      socket.userId = userId; socket.userRole = role; socket.authenticated = true;
      return next();
    }
    const verified = verifyToken(token);
    if (verified && isAdmin(role)) {
      socket.userId = userId; socket.userRole = role; socket.authenticated = true;
      return next();
    }
    next();
  });

  setupSocket(io, collections);
  setupRoutes(app, collections);

  setInterval(async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 86400000);
      await collections.gpsLocationsCollection.deleteMany({ timestamp: { $lt: oneDayAgo } });
    } catch (err) { console.error("Cleanup error:", err); }
  }, 3600000);

  server.listen(PORT, () => {
    console.log(`🚀 Socket.io Server running on port ${PORT}`);
  });
}

const shutdown = async () => {
  console.log("\n⏳ Shutting down...");
  if (global.io) global.io.close();
  await client.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});