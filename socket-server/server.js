require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion } = require("mongodb");

const PORT = process.env.SOCKET_PORT || 4001;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function startSocketServer() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully");

    const database = client.db("onWayDB");
    const chatCollection = database.collection("chats");

    // Indexes for performance
    await chatCollection.createIndex({ roomId: 1 });
    await chatCollection.createIndex({ createdAt: -1 });

    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: "*" },
    });

    const onlineUsers = new Map();

    // ================= SOCKET LOGIC =================

    io.on("connection", (socket) => {
      console.log("🔌 User connected:", socket.id);

      // Register User with Role
      socket.on("registerUser", ({ userId, role }) => {
        if (!userId) return;
        onlineUsers.set(String(userId), { socketId: socket.id, role });

        // Admin বা Support হলে তারা স্পেসিফিক রোলে জয়েন করবে
        if (role === "admin") socket.join("admin_group");
        if (role === "support") socket.join("support_group");

        console.log(`User ${userId} registered as ${role}`);
      });

      // Join Specific Chat Room
      socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log("Joined Room:", roomId);
      });

      // Typing Indicators
      socket.on("typing", ({ roomId, userId, userName }) => {
        socket.to(roomId).emit("userTyping", { roomId, userId, userName });
      });

      socket.on("stopTyping", ({ roomId, userId }) => {
        socket.to(roomId).emit("userStopTyping", { roomId, userId });
      });

      // WebRTC Signaling (Call features)
      socket.on("callUser", ({ toUserId, offer, fromUserId }) => {
        const target = onlineUsers.get(String(toUserId));
        if (target) io.to(target.socketId).emit("incomingCall", { fromUserId, offer });
      });

      socket.on("answerCall", ({ toUserId, answer }) => {
        const target = onlineUsers.get(String(toUserId));
        if (target) io.to(target.socketId).emit("callAccepted", { answer });
      });

      socket.on("iceCandidate", ({ toUserId, candidate }) => {
        const target = onlineUsers.get(String(toUserId));
        if (target) io.to(target.socketId).emit("iceCandidate", { candidate });
      });

      socket.on("disconnect", () => {
        for (const [userId, data] of onlineUsers.entries()) {
          if (data.socketId === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }
        console.log("❌ User disconnected");
      });
    });

    // ================= CHAT API (Send Message) =================

    app.post("/api/chat/send", async (req, res) => {
      try {
        const {
          roomId, senderId, senderName, senderRole,
          message, messageType, fileUrl, chatType,
          receiverId
        } = req.body;

        // Validation: মেসেজ অথবা ফাইল যেকোনো একটা থাকতে হবে
        if (!message && !fileUrl) {
          return res.status(400).json({ error: "Message or File is required" });
        }

        const chatMessage = {
          roomId,
          senderId: String(senderId),
          senderName,
          senderRole, // passenger, rider, support, admin
          message: message || "",
          messageType: messageType || "text", // text, image, file
          fileUrl: fileUrl || null,
          chatType, // ride, support, admin_internal
          isRead: false,
          createdAt: new Date(),
        };

        const result = await chatCollection.insertOne(chatMessage);
        chatMessage._id = result.insertedId;

        // ১. রুমে মেসেজ পাঠানো (Real-time update for active chat)
        io.to(roomId).emit("receiveMessage", chatMessage);

        // ২. রিসিভারকে নোটিফিকেশন পাঠানো (যদি সে রুমে না থাকে)
        if (receiverId) {
          const receiver = onlineUsers.get(String(receiverId));
          if (receiver) {
            io.to(receiver.socketId).emit("newMessageNotification", {
              senderName,
              message: messageType === "text" ? message : "Sent a file",
              roomId
            });
          }
        }

        // ৩. রোল ভিত্তিক আপডেট (যেমন এডমিনকে জানানো)
        if (chatType === "support") {
          io.to("support_group").emit("supportUpdate", { roomId });
        } else if (chatType === "admin_internal") {
          io.to("admin_group").emit("adminUpdate", { roomId });
        }

        res.status(201).json(chatMessage);
      } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ error: "Failed to send message" });
      }
    });

    // ================= CHAT HISTORY & LISTS =================

    app.get("/api/chat/history/:roomId", async (req, res) => {
      try {
        const { roomId } = req.params;
        const history = await chatCollection
          .find({ roomId })
          .sort({ createdAt: 1 })
          .toArray();
        res.json(history);
      } catch (error) {
        res.status(500).json({ error: "Failed to load history" });
      }
    });

    // Support Session List (For Agents/Admins)
    app.get("/api/support/sessions", async (req, res) => {
      try {
        const sessions = await chatCollection.aggregate([
          { $match: { chatType: "support" } },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$roomId",
              lastMessage: { $first: "$message" },
              senderName: { $first: "$senderName" },
              unreadCount: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } },
              updatedAt: { $first: "$createdAt" }
            }
          },
          { $sort: { updatedAt: -1 } }
        ]).toArray();
        res.json(sessions);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch sessions" });
      }
    });

    server.listen(PORT, () => {
      console.log(`🚀 Updated OnWay Socket Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("FATAL ERROR:", error);
    process.exit(1);
  }
}

startSocketServer();




// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// const { MongoClient, ServerApiVersion } = require("mongodb");

// const PORT = process.env.SOCKET_PORT || 4001;
// const uri = process.env.MONGODB_URI;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function startSocketServer() {
//   try {
//     await client.connect();
//     console.log("✅ MongoDB Connected Successfully");

//     const database = client.db("onWayDB");
//     const chatCollection = database.collection("chats");

//     await chatCollection.createIndex({ roomId: 1 });
//     await chatCollection.createIndex({ passengerId: 1 });
//     await chatCollection.createIndex({ riderId: 1 });
//     await chatCollection.createIndex({ createdAt: -1 });

//     const app = express();
//     app.use(cors({ origin: "*" }));
//     app.use(express.json());

//     const server = http.createServer(app);

//     const io = new Server(server, {
//       cors: { origin: "*" },
//     });

//     const onlineUsers = new Map();

//     // ================= SOCKET CONNECTION =================

//     io.on("connection", (socket) => {
//       console.log("🔌 User connected:", socket.id);

//       // register user
//       socket.on("registerUser", ({ userId }) => {
//         if (!userId) return;
//         onlineUsers.set(String(userId), socket.id);
//         console.log("User registered:", userId);
//       });

//       // join chat room
//       socket.on("joinRoom", ({ roomId }) => {
//         socket.join(roomId);
//         console.log("User joined room:", roomId);
//       });

//       // support agents join support room
//       socket.on("joinSupport", () => {
//         socket.join("support");
//         console.log("Support agent joined support room");
//       });

//       // typing indicator
//       socket.on("typing", ({ roomId, userId, userName }) => {
//         socket.to(roomId).emit("userTyping", { roomId, userId, userName });
//       });

//       socket.on("stopTyping", ({ roomId, userId }) => {
//         socket.to(roomId).emit("userStopTyping", { roomId, userId });
//       });

//       // mark messages as seen
//       socket.on("markAsRead", async ({ roomId, userId }) => {
//         if (!roomId || !userId) return;

//         try {
//           await chatCollection.updateMany(
//             { roomId, isRead: false, senderId: { $ne: String(userId) } },
//             { $set: { isRead: true } }
//           );

//           io.to(roomId).emit("messagesSeen", { roomId, userId });

//           // Also notify support or rider lists about the update
//           if (roomId.startsWith("support_")) {
//             io.to("support").emit("supportSessionUpdated", { roomId });
//           } else if (roomId.startsWith("ride_")) {
//             // const chatDoc = await chatCollection.findOne({ roomId }, { sort: { createdAt: -1 } });
//             const chatDocs = await chatCollection.find({ roomId }).sort({ createdAt: -1 }).limit(1).toArray();
//             const chatDoc = chatDocs[0];
//             if (chatDoc) {
//               if (chatDoc.riderId) {
//                 const sId = onlineUsers.get(String(chatDoc.riderId));
//                 if (sId) io.to(sId).emit("riderChatUpdated", { roomId });
//               }
//               if (chatDoc.passengerId) {
//                 const sId = onlineUsers.get(String(chatDoc.passengerId));
//                 if (sId) io.to(sId).emit("riderChatUpdated", { roomId });
//               }
//             }
//           }
//         } catch (error) {
//           console.error("markAsRead error:", error);
//         }
//       });

//       // call request
//       socket.on("callUser", ({ toUserId, offer, fromUserId }) => {
//         const targetSocket = onlineUsers.get(String(toUserId));

//         if (targetSocket) {
//           io.to(targetSocket).emit("incomingCall", {
//             fromUserId,
//             offer
//           });
//         } else {
//           console.log(`User ${toUserId} not online`);
//         }
//       });

//       // call answer
//       socket.on("answerCall", ({ toUserId, answer }) => {
//         const targetSocket = onlineUsers.get(String(toUserId));

//         if (targetSocket) {
//           io.to(targetSocket).emit("callAccepted", {
//             answer
//           });
//         }
//       });

//       // ice candidate
//       socket.on("iceCandidate", ({ toUserId, candidate }) => {
//         const targetSocket = onlineUsers.get(String(toUserId));

//         if (targetSocket) {
//           io.to(targetSocket).emit("iceCandidate", {
//             candidate
//           });
//         }
//       });

//       // end call
//       socket.on("endCall", ({ toUserId }) => {
//         const targetSocket = onlineUsers.get(String(toUserId));

//         if (targetSocket) {
//           io.to(targetSocket).emit("callEnded");
//         }
//       });

//       socket.on("disconnect", () => {
//         console.log("❌ User disconnected:", socket.id);

//         for (const [userId, sockId] of onlineUsers.entries()) {
//           if (sockId === socket.id) {
//             onlineUsers.delete(userId);
//             break;
//           }
//         }
//       });
//     });

//     // ================= SEND MESSAGE =================

//     app.post("/api/chat/send", async (req, res) => {
//       try {
//         const data = req.body;

//         // Determine chat type and enforce room naming
//         let chatType = data.chatType === "support" ? "support" : "ride";
//         let roomId = String(data.roomId);

//         // Ensure room naming rules
//         if (chatType === "ride" && !roomId.startsWith("ride_")) {
//           roomId = `ride_${roomId}`;
//         } else if (chatType === "support" && !roomId.startsWith("support_")) {
//           roomId = `support_${roomId}`;
//         }

//         const senderId = String(data.senderId);
//         const passengerId = data.passengerId ? String(data.passengerId) : null;
//         const riderId = data.riderId ? String(data.riderId) : null;

//         const senderRole = ["passenger", "rider", "support"].includes(data.senderRole)
//           ? data.senderRole
//           : "passenger";
//         const message = typeof data.message === "string" ? data.message : "";

//         if (message.length > 10000) {
//           return res.status(413).json({ error: "Message too large" });
//         }

//         const chatMessage = {
//           roomId,
//           rideId: data.rideId || null,

//           passengerId,
//           riderId,

//           senderId,
//           senderName: data.senderName || null,
//           senderRole,

//           chatType,

//           message,
//           messageType: data.messageType || "text",
//           fileUrl: data.fileUrl || null,

//           isRead: false,
//           createdAt: new Date(),
//         };

//         const result = await chatCollection.insertOne(chatMessage);
//         chatMessage._id = result.insertedId;

//         // send message to room
//         io.to(roomId).emit("receiveMessage", chatMessage);

//         // support notifications
//         if (chatType === "support") {
//           io.to("support").emit("supportSessionUpdated", { roomId });
//         }

//         // rider & passenger update
//         if (chatType === "ride") {
//           if (riderId && onlineUsers.has(riderId)) {
//             io.to(onlineUsers.get(riderId)).emit("riderChatUpdated", { roomId });
//           }

//           if (passengerId && onlineUsers.has(passengerId)) {
//             io.to(onlineUsers.get(passengerId)).emit("riderChatUpdated", { roomId });
//           }
//         }

//         res.status(201).json(chatMessage);
//       } catch (error) {
//         console.error("Send message error:", error);
//         res.status(500).json({ error: "Failed to send message" });
//       }
//     });

//     // ================= CHAT HISTORY =================

//     app.get("/api/chat/history/:roomId", async (req, res) => {
//       try {
//         const { roomId } = req.params;
//         const { userId, role } = req.query;

//         if (!roomId) return res.status(400).json({ error: "Room ID required" });

//         // Authorization check
//         if (role !== "support") {
//           const chatDoc = await chatCollection.findOne({ roomId });
//           if (chatDoc) {
//             const allowed =
//               String(chatDoc.passengerId) === String(userId) ||
//               String(chatDoc.riderId) === String(userId) ||
//               String(chatDoc.senderId) === String(userId);
//             if (!allowed) return res.status(403).json({ error: "Not authorized" });
//           }
//         }

//         const history = await chatCollection
//           .find({ roomId })
//           .sort({ createdAt: 1 })
//           .toArray();

//         res.json(history || []);
//       } catch (error) {
//         console.error("History error:", error);
//         res.status(500).json({ error: "Failed to load history" });
//       }
//     });

//     // ================= RIDER CHAT LIST =================

//     app.get("/api/rider/chats/:riderId", async (req, res) => {
//       try {
//         const { riderId } = req.params;

//         const chats = await chatCollection
//           .aggregate([
//             { $match: { riderId, chatType: "ride" } },
//             { $sort: { createdAt: -1 } },
//             {
//               $group: {
//                 _id: "$roomId",
//                 roomId: { $first: "$roomId" },
//                 passengerId: { $first: "$passengerId" },
//                 senderName: { $first: "$senderName" },
//                 lastMessage: { $first: "$message" },
//                 lastMessageTime: { $first: "$createdAt" },
//                 unreadCount: {
//                   $sum: {
//                     $cond: [
//                       {
//                         $and: [
//                           { $eq: ["$isRead", false] },
//                           { $eq: ["$senderRole", "passenger"] },
//                         ],
//                       },
//                       1,
//                       0,
//                     ],
//                   },
//                 },
//               },
//             },
//             { $sort: { lastMessageTime: -1 } },
//           ])
//           .toArray();

//         res.json(chats);
//       } catch (error) {
//         console.error("Rider chats error:", error);
//         res.status(500).json({ error: "Failed to fetch rider chats" });
//       }
//     });

//     // ================= PASSENGER CHAT LIST =================

//     app.get("/api/passenger/chats/:passengerId", async (req, res) => {
//       try {
//         const { passengerId } = req.params;

//         const chats = await chatCollection
//           .aggregate([
//             { $match: { passengerId, chatType: "ride" } },
//             { $sort: { createdAt: -1 } },
//             {
//               $group: {
//                 _id: "$roomId",
//                 roomId: { $first: "$roomId" },
//                 riderId: { $first: "$riderId" },
//                 senderName: { $first: "$senderName" },
//                 lastMessage: { $first: "$message" },
//                 lastMessageTime: { $first: "$createdAt" },
//                 unreadCount: {
//                   $sum: {
//                     $cond: [
//                       {
//                         $and: [
//                           { $eq: ["$isRead", false] },
//                           { $eq: ["$senderRole", "rider"] },
//                         ],
//                       },
//                       1,
//                       0,
//                     ],
//                   },
//                 },
//               },
//             },
//             { $sort: { lastMessageTime: -1 } },
//           ])
//           .toArray();

//         res.json(chats);
//       } catch (error) {
//         console.error("Passenger chats error:", error);
//         res.status(500).json({ error: "Failed to fetch passenger chats" });
//       }
//     });

//     // ================= SUPPORT CHAT SESSIONS =================

//     app.get("/api/support/sessions", async (req, res) => {
//       try {
//         const sessions = await chatCollection
//           .aggregate([
//             { $match: { chatType: "support" } },
//             { $sort: { createdAt: -1 } },
//             {
//               $group: {
//                 _id: "$roomId",
//                 roomId: { $first: "$roomId" },
//                 passengerId: { $first: "$passengerId" },
//                 senderName: { $first: "$senderName" },
//                 lastMessage: { $first: "$message" },
//                 createdAt: { $first: "$createdAt" },
//                 unreadCount: {
//                   $sum: {
//                     $cond: [
//                       {
//                         $and: [
//                           { $eq: ["$isRead", false] },
//                           { $ne: ["$senderRole", "support"] },
//                         ],
//                       },
//                       1,
//                       0,
//                     ],
//                   },
//                 },
//               },
//             },
//             { $sort: { createdAt: -1 } },
//           ])
//           .toArray();

//         res.json(sessions);
//       } catch (error) {
//         console.error("Support sessions error:", error);
//         res.status(500).json({ error: "Failed to fetch support sessions" });
//       }
//     });

//     server.listen(PORT, () => {
//       console.log(`🚀 Socket server running on port ${PORT}`);
//     });

//   } catch (error) {
//     console.error("FATAL ERROR:", error);
//     process.exit(1);
//   }
// }

// startSocketServer();



// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// const { MongoClient, ServerApiVersion } = require("mongodb");

// const PORT = process.env.SOCKET_PORT || 4001;
// const uri = process.env.MONGODB_URI;

// // Validate MongoDB URI
// if (!uri) {
//   console.error("❌ ERROR: MONGODB_URI is not defined in .env file");
//   console.error("Please create a .env file in socket-server directory with:");
//   console.error("MONGODB_URI=your_mongodb_connection_string");
//   process.exit(1);
// }

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: false,
//     deprecationErrors: true,
//   },
// });

// // ------------------- GLOBAL DATA -------------------
// const onlineUsers = new Map();
// const activeConnections = new Map();

// // ------------------- HELPER FUNCTIONS -------------------
// function verifyToken(token) {
//   if (process.env.NODE_ENV === 'development') {
//     return { valid: true };
//   }
//   if (!token || token.length < 10) return null;
//   return { valid: true }; // TODO: Replace with real JWT verification
// }

// function isAdmin(userRole) {
//   return userRole === "admin" || userRole === "supportAgent";
// }

// async function connectDB() {
//   try {
//     await client.connect();
//     await client.db("admin").command({ ping: 1 });
//     console.log("✅ MongoDB connected (Socket Server)");
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error);
//     process.exit(1);
//   }
// }

// // ------------------- START SERVER -------------------
// async function startSocketServer() {
//   await connectDB();
//   const database = client.db("onWayDB");

//   // Collections
//   const chatCollection = database.collection("chats");
//   const gpsLocationsCollection = database.collection("gpsLocations");
//   const notificationsCollection = database.collection("notifications");
//   const rideSessionsCollection = database.collection("rideSessions");

//   // Indexes for chat collection
//   await chatCollection.createIndex({ roomId: 1 });
//   await chatCollection.createIndex({ passengerId: 1 });
//   await chatCollection.createIndex({ riderId: 1 });
//   await chatCollection.createIndex({ createdAt: -1 });

//   const app = express();
//   app.use(cors({ origin: "*" }));
//   app.use(express.json());

//   const server = http.createServer(app);

//   const io = new Server(server, {
//     cors: {
//       origin: [
//         "http://localhost:3000",
//         "http://localhost:4000",
//         "http://localhost:5000",
//         "https://on-way-neon.vercel.app",
//         process.env.FRONTEND_URL
//       ].filter(Boolean),
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//     pingTimeout: 60000,
//     pingInterval: 25000,
//   });

//   // ------------------- SOCKET.IO AUTH -------------------
//   io.use((socket, next) => {
//     const token = socket.handshake.auth.token;
//     const userRole = socket.handshake.auth.role;
//     const userId = socket.handshake.auth.userId;

//     console.log(`🔐 Authentication attempt - Role: ${userRole}, UserId: ${userId}, Token: ${token ? 'Present' : 'Missing'}`);

//     if (process.env.NODE_ENV === 'development') {
//       if (userId && userRole && isAdmin(userRole)) {
//         socket.userId = userId;
//         socket.userRole = userRole;
//         socket.authenticated = true;
//         console.log(`✅ Authentication successful (DEV MODE) - ${userRole} (${userId})`);
//         return next();
//       } else {
//         console.log(`❌ Authorization failed - Role: ${userRole} is not authorized`);
//         return next(new Error("Authorization failed: Admin access required"));
//       }
//     }

//     const verified = verifyToken(token);
//     if (!verified) return next(new Error("Authentication failed: Invalid token"));
//     if (!isAdmin(userRole)) return next(new Error("Authorization failed: Admin access required"));

//     socket.userId = userId;
//     socket.userRole = userRole;
//     socket.authenticated = true;

//     console.log(`✅ Authentication successful - ${userRole} (${userId})`);
//     next();
//   });

//   // ------------------- SOCKET.IO CONNECTION -------------------
//   io.on("connection", (socket) => {
//     console.log("🔌 User connected:", socket.id);

//     // Admin connections
//     if (socket.authenticated) {
//       activeConnections.set(socket.id, {
//         userId: socket.userId,
//         role: socket.userRole,
//         connectedAt: new Date(),
//       });

//       rideSessionsCollection.insertOne({
//         socketId: socket.id,
//         userId: socket.userId,
//         role: socket.userRole,
//         type: "admin_connection",
//         connectedAt: new Date(),
//         status: "active",
//       }).catch(err => console.error("Error logging connection:", err));

//     }

//     // ---------- Chat registration ----------
//     socket.on("registerUser", ({ userId }) => {
//       onlineUsers.set(String(userId), socket.id);
//       console.log("User registered:", userId);
//     });

//     socket.on("joinRoom", ({ roomId }) => {
//       socket.join(roomId);
//       console.log("User joined room:", roomId);
//     });

//     socket.on("joinSupport", () => {
//       socket.join("support");
//       console.log("Support agent joined support room");
//     });

//     socket.on("typing", ({ roomId, userId, userName }) => {
//       socket.to(roomId).emit("userTyping", { roomId, userId, userName });
//     });

//     socket.on("stopTyping", ({ roomId, userId }) => {
//       socket.to(roomId).emit("userStopTyping", { roomId, userId });
//     });

//     socket.on("markAsRead", async ({ roomId, userId }) => {
//       if (!roomId || !userId) return;

//       try {
//         await chatCollection.updateMany(
//           { roomId, isRead: false, senderId: { $ne: String(userId) } },
//           { $set: { isRead: true } }
//         );

//         io.to(roomId).emit("messagesSeen", { roomId, userId });

//         // Also notify support or rider lists about the update
//         if (roomId.startsWith("support_")) {
//           io.to("support").emit("supportSessionUpdated", { roomId });
//         } else if (roomId.startsWith("ride_")) {
//           const chatDoc = await chatCollection.findOne({ roomId }, { sort: { createdAt: -1 } });
//           if (chatDoc) {
//             if (chatDoc.riderId) {
//               const sId = onlineUsers.get(String(chatDoc.riderId));
//               if (sId) io.to(sId).emit("riderChatUpdated", { roomId });
//             }
//             if (chatDoc.passengerId) {
//               const sId = onlineUsers.get(String(chatDoc.passengerId));
//               if (sId) io.to(sId).emit("riderChatUpdated", { roomId });
//             }
//           }
//         }
//       } catch (error) {
//         console.error("markAsRead error:", error);
//       }
//     });

//     // ---------- Admin monitoring ----------
//     socket.on("joinNotifications", (userId) => {
//       if (!socket.authenticated) {
//         socket.emit("error", { message: "Unauthorized" });
//         return;
//       }

//       socket.join(`user_${userId}`);
//       console.log(`🔔 Admin ${socket.id} joined notifications for user: ${userId}`);

//       socket.emit("joinedNotifications", {
//         userId,
//         message: "Successfully joined notification room"
//       });
//     });

//     socket.on("joinRide", (rideId) => {
//       if (!socket.authenticated) {
//         socket.emit("error", { message: "Unauthorized" });
//         return;
//       }

//       socket.join(`ride_${rideId}`);
//       console.log(`📍 Admin ${socket.id} monitoring ride: ${rideId}`);

//       socket.emit("joinedRide", {
//         rideId,
//         message: "Successfully joined ride monitoring"
//       });
//     });

//     socket.on("gpsUpdate", async (data) => {
//       const { rideId, driverId, latitude, longitude, speed, heading } = data;

//       try {
//         // ✅ Save GPS location to database FIRST
//         const gpsData = {
//           rideId,
//           driverId,
//           latitude,
//           longitude,
//           speed: speed || 0,
//           heading: heading || 0,
//           timestamp: new Date(),
//           socketId: socket.id,
//         };

//         const result = await gpsLocationsCollection.insertOne(gpsData);

//         console.log(`📍 GPS saved to DB: Ride ${rideId}, Driver ${driverId}`);

//         // ✅ Then broadcast to admin dashboard monitoring this ride
//         io.to(`ride_${rideId}`).emit("receiveGpsUpdate", {
//           _id: result.insertedId,
//           ...gpsData,
//         });

//         // Send acknowledgment
//         socket.emit("gpsUpdateAck", {
//           success: true,
//           rideId,
//           savedId: result.insertedId
//         });

//       } catch (error) {
//         console.error("❌ Error saving GPS location:", error);
//         socket.emit("gpsUpdateAck", {
//           success: false,
//           error: "Failed to save GPS data"
//         });
//       }
//     });

//     socket.on("sendNotification", async (data) => {
//       if (!socket.authenticated) {
//         socket.emit("error", { message: "Unauthorized" });
//         return;
//       }

//       const { userId, message, type, metadata } = data;

//       try {
//         // ✅ Save notification to database FIRST
//         const notification = {
//           userId,
//           message,
//           type,
//           metadata: metadata || {},
//           isRead: false,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           sentBy: socket.userId,
//           sentByRole: socket.userRole,
//         };

//         const result = await notificationsCollection.insertOne(notification);

//         const savedNotification = {
//           _id: result.insertedId,
//           ...notification
//         };

//         console.log(`🔔 Notification saved to DB and sent to user ${userId}: ${type}`);

//         // ✅ Then emit to specific user's notification room
//         io.to(`user_${userId}`).emit("newNotification", savedNotification);

//         // Send acknowledgment to sender
//         socket.emit("notificationSent", {
//           success: true,
//           notificationId: result.insertedId
//         });

//       } catch (error) {
//         console.error("❌ Error sending notification:", error);
//         socket.emit("notificationSent", {
//           success: false,
//           error: "Failed to send notification"
//         });
//       }
//     });

//     socket.on("getActiveRides", async () => {
//       if (!socket.authenticated) {
//         socket.emit("error", { message: "Unauthorized" });
//         return;
//       }

//       try {
//         const activeRides = await rideSessionsCollection
//           .find({ status: "active", type: "ride" })
//           .sort({ startedAt: -1 })
//           .limit(50)
//           .toArray();

//         socket.emit("activeRides", {
//           success: true,
//           rides: activeRides
//         });
//       } catch (error) {
//         console.error("Error fetching active rides:", error);
//         socket.emit("activeRides", {
//           success: false,
//           error: "Failed to fetch active rides"
//         });
//       }
//     });

//     socket.on("getConnectionStats", () => {
//       if (!socket.authenticated || socket.userRole !== "admin") {
//         socket.emit("error", { message: "Unauthorized" });
//         return;
//       }

//       const stats = {
//         totalConnections: activeConnections.size,
//         connections: Array.from(activeConnections.values()),
//         timestamp: new Date(),
//       };

//       socket.emit("connectionStats", stats);
//     });

//     socket.on("disconnect", async (reason) => {
//       console.log(`🔌 Admin client disconnected: ${socket.id} - Reason: ${reason}`);

//       // Remove from active connections
//       activeConnections.delete(socket.id);

//       // Update session in database
//       try {
//         await rideSessionsCollection.updateOne(
//           { socketId: socket.id, status: "active" },
//           {
//             $set: {
//               status: "disconnected",
//               disconnectedAt: new Date(),
//               disconnectReason: reason,
//             }
//           }
//         );
//       } catch (error) {
//         console.error("Error updating disconnection:", error);
//       }
//     });

//     socket.on("error", (error) => {
//       console.error(`❌ Socket error for ${socket.id}:`, error);
//     });
//   });

//   // ------------------- PERIODIC CLEANUP -------------------
//   setInterval(async () => {
//     try {
//       const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
//       const result = await gpsLocationsCollection.deleteMany({
//         timestamp: { $lt: oneDayAgo }
//       });

//       if (result.deletedCount > 0) {
//         console.log(`🧹 Cleaned up ${result.deletedCount} old GPS records`);
//       }
//     } catch (error) {
//       console.error("Error cleaning up GPS data:", error);
//     }
//   }, 60 * 60 * 1000); // Every hour

//   // ------------------- REST API -------------------

//   // ================= SEND MESSAGE =================

//   app.post("/api/chat/send", async (req, res) => {
//     try {
//       const data = req.body;

//       // Determine chat type and enforce room naming
//       let chatType = data.chatType === "support" ? "support" : "ride";
//       let roomId = String(data.roomId);

//       // Ensure room naming rules
//       if (chatType === "ride" && !roomId.startsWith("ride_")) {
//         roomId = `ride_${roomId}`;
//       } else if (chatType === "support" && !roomId.startsWith("support_")) {
//         roomId = `support_${roomId}`;
//       }

//       const senderId = String(data.senderId);
//       const passengerId = data.passengerId ? String(data.passengerId) : null;
//       const riderId = data.riderId ? String(data.riderId) : null;

//       const senderRole = ["passenger", "rider", "support"].includes(data.senderRole)
//         ? data.senderRole
//         : "passenger";
//       const message = typeof data.message === "string" ? data.message : "";

//       if (message.length > 10000) {
//         return res.status(413).json({ error: "Message too large" });
//       }

//       const chatMessage = {
//         roomId,
//         rideId: data.rideId || null,

//         passengerId,
//         riderId,

//         senderId,
//         senderName: data.senderName || null,
//         senderRole,

//         chatType,

//         message,
//         messageType: data.messageType || "text",
//         fileUrl: data.fileUrl || null,

//         isRead: false,
//         createdAt: new Date(),
//       };

//       const result = await chatCollection.insertOne(chatMessage);
//       chatMessage._id = result.insertedId;

//       // send message to room
//       io.to(roomId).emit("receiveMessage", chatMessage);

//       // support notifications
//       if (chatType === "support") {
//         io.to("support").emit("supportSessionUpdated", { roomId });
//       }

//       // rider & passenger update
//       if (chatType === "ride") {
//         if (riderId && onlineUsers.has(riderId)) {
//           io.to(onlineUsers.get(riderId)).emit("riderChatUpdated", { roomId });
//         }

//         if (passengerId && onlineUsers.has(passengerId)) {
//           io.to(onlineUsers.get(passengerId)).emit("riderChatUpdated", { roomId });
//         }
//       }

//       res.status(201).json(chatMessage);
//     } catch (error) {
//       console.error("Send message error:", error);
//       res.status(500).json({ error: "Failed to send message" });
//     }
//   });

//   // ================= CHAT HISTORY =================

//   app.get("/api/chat/history/:roomId", async (req, res) => {
//     try {
//       const { roomId } = req.params;
//       const { userId, role } = req.query;

//       if (!roomId) return res.status(400).json({ error: "Room ID required" });

//       // Authorization check
//       if (role !== "support") {
//         const chatDoc = await chatCollection.findOne({ roomId });
//         if (chatDoc) {
//           const allowed =
//             String(chatDoc.passengerId) === String(userId) ||
//             String(chatDoc.riderId) === String(userId) ||
//             String(chatDoc.senderId) === String(userId);
//           if (!allowed) return res.status(403).json({ error: "Not authorized" });
//         }
//       }

//       const history = await chatCollection
//         .find({ roomId })
//         .sort({ createdAt: 1 })
//         .toArray();

//       res.json(history || []);
//     } catch (error) {
//       console.error("History error:", error);
//       res.status(500).json({ error: "Failed to load history" });
//     }
//   });

//   // ================= RIDER CHAT LIST =================

//   app.get("/api/rider/chats/:riderId", async (req, res) => {
//     try {
//       const { riderId } = req.params;

//       const chats = await chatCollection
//         .aggregate([
//           { $match: { riderId, chatType: "ride" } },
//           { $sort: { createdAt: -1 } },
//           {
//             $group: {
//               _id: "$roomId",
//               roomId: { $first: "$roomId" },
//               passengerId: { $first: "$passengerId" },
//               senderName: { $first: "$senderName" },
//               lastMessage: { $first: "$message" },
//               lastMessageTime: { $first: "$createdAt" },
//               unreadCount: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $and: [
//                         { $eq: ["$isRead", false] },
//                         { $eq: ["$senderRole", "passenger"] },
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//           },
//           { $sort: { lastMessageTime: -1 } },
//         ])
//         .toArray();

//       res.json(chats);
//     } catch (error) {
//       console.error("Rider chats error:", error);
//       res.status(500).json({ error: "Failed to fetch rider chats" });
//     }
//   });

//   // ================= PASSENGER CHAT LIST =================

//   app.get("/api/passenger/chats/:passengerId", async (req, res) => {
//     try {
//       const { passengerId } = req.params;

//       const chats = await chatCollection
//         .aggregate([
//           { $match: { passengerId, chatType: "ride" } },
//           { $sort: { createdAt: -1 } },
//           {
//             $group: {
//               _id: "$roomId",
//               roomId: { $first: "$roomId" },
//               riderId: { $first: "$riderId" },
//               senderName: { $first: "$senderName" },
//               lastMessage: { $first: "$message" },
//               lastMessageTime: { $first: "$createdAt" },
//               unreadCount: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $and: [
//                         { $eq: ["$isRead", false] },
//                         { $eq: ["$senderRole", "rider"] },
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//           },
//           { $sort: { lastMessageTime: -1 } },
//         ])
//         .toArray();

//       res.json(chats);
//     } catch (error) {
//       console.error("Passenger chats error:", error);
//       res.status(500).json({ error: "Failed to fetch passenger chats" });
//     }
//   });

//   // ================= SUPPORT CHAT SESSIONS =================

//   app.get("/api/support/sessions", async (req, res) => {
//     try {
//       const sessions = await chatCollection
//         .aggregate([
//           { $match: { chatType: "support" } },
//           { $sort: { createdAt: -1 } },
//           {
//             $group: {
//               _id: "$roomId",
//               roomId: { $first: "$roomId" },
//               passengerId: { $first: "$passengerId" },
//               senderName: { $first: "$senderName" },
//               lastMessage: { $first: "$message" },
//               createdAt: { $first: "$createdAt" },
//               unreadCount: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $and: [
//                         { $eq: ["$isRead", false] },
//                         { $ne: ["$senderRole", "support"] },
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//           },
//           { $sort: { createdAt: -1 } },
//         ])
//         .toArray();

//       res.json(sessions);
//     } catch (error) {
//       console.error("Support sessions error:", error);
//       res.status(500).json({ error: "Failed to fetch support sessions" });
//     }
//   });

//   // Export io instance for use in other modules
//   global.io = io;


//   // ------------------- START SERVER -------------------
//   server.listen(PORT, () => {
//     console.log(`🚀 Socket.io server running on http://localhost:${PORT}`);
//     console.log(`🔐 Authentication: ENABLED`);
//     console.log(`📊 Admin monitoring: ACTIVE`);
//     console.log(`💾 Database persistence: ENABLED`);
//   });
// }

// // ------------------- GRACEFUL SHUTDOWN -------------------
// process.on("SIGINT", async () => {
//   console.log("\n⏳ Closing MongoDB connection...");
//   if (global.io) global.io.close();
//   await client.close();
//   console.log("✅ MongoDB connection closed");
//   process.exit(0);
// });

// startSocketServer();