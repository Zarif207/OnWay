require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const PORT = process.env.SOCKET_PORT || 4001;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function startSocketServer() {
  try {
    await client.connect();
    const database = client.db("onWayDB");
    const chatCollection = database.collection("chats");
    const gpsLocationsCollection = database.collection("gpsLocations");

    const app = express();
    app.use(cors({ origin: "*", methods: ["GET", "POST"], credentials: true }));
    app.use(express.json());

    // --- API Section ---

    // ১. চ্যাট হিস্ট্রি (মেসেঞ্জার স্টাইল)
    app.get("/api/chat/history/:roomId", async (req, res) => {
      const { roomId } = req.params;
      const history = await chatCollection.find({ roomId }).sort({ createdAt: 1 }).toArray();
      res.json(history);
    });

    // ২. সাপোর্ট এজেন্টদের জন্য একটিভ সেশন লিস্ট
    app.get("/api/chat/active-sessions", async (req, res) => {
      const sessions = await chatCollection.aggregate([
        { $match: { chatType: "support" } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$roomId", lastMessage: { $first: "$message" }, senderName: { $first: "$senderName" }, createdAt: { $first: "$createdAt" }, unreadCount: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } } } },
        { $sort: { createdAt: -1 } }
      ]).toArray();
      res.json(sessions);
    });

    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: "*" } });

    // --- Socket Logic ---
    const onlineUsers = new Map(); // UserID -> SocketID mapping

    io.on("connection", (socket) => {
      console.log("🔌 Connected:", socket.id);

      // ইউজার কানেক্ট হলে তাকে রেজিস্টার করা (Messenger Style Online Status)
      socket.on("registerUser", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("userStatus", { userId, status: "online" });
      });

      // ১. রুমে জয়েন করা (Ride or Support)
      socket.on("joinRoom", ({ roomId, userId }) => {
        socket.join(roomId);
        console.log(`👤 User ${userId} joined room: ${roomId}`);
      });

      // ২. মেসেজ পাঠানো (Real Messenger Logic)
      socket.on("sendMessage", async (data) => {
        const { roomId, senderId, senderName, senderRole, chatType, message } = data;

        const chatMessage = {
          roomId,
          senderId,
          senderName,
          senderRole,
          chatType, // 'ride' or 'support'
          message,
          isRead: false,
          createdAt: new Date()
        };

        const result = await chatCollection.insertOne(chatMessage);
        chatMessage._id = result.insertedId;

        // নির্দিষ্ট রুমে মেসেজ পাঠানো
        io.to(roomId).emit("receiveMessage", chatMessage);
      });

      // ৩. মেসেজ 'Seen' বা 'Read' আপডেট
      socket.on("markAsRead", async ({ roomId, userId }) => {
        await chatCollection.updateMany(
          { roomId, senderId: { $ne: userId }, isRead: false },
          { $set: { isRead: true } }
        );
        socket.to(roomId).emit("messagesSeen", { roomId, userId });
      });

      // ৪. অডিও কলিং (WebRTC Signaling) - Uber/Messenger Like
      socket.on("callUser", (data) => {
        // data: { userToCall, signalData, from, name }
        const receiverSocketId = onlineUsers.get(data.userToCall);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("incomingCall", {
            signal: data.signalData,
            from: data.from,
            name: data.name
          });
        }
      });

      socket.on("answerCall", (data) => {
        const callerSocketId = onlineUsers.get(data.to);
        if (callerSocketId) {
          io.to(callerSocketId).emit("callAccepted", data.signal);
        }
      });

      // ৫. টাইপিং ইন্ডিকেটর
      socket.on("typing", ({ roomId, userName }) => {
        socket.to(roomId).emit("userTyping", { userName });
      });

      socket.on("stopTyping", ({ roomId }) => {
        socket.to(roomId).emit("userStoppedTyping");
      });

      // ডিসকানেক্ট
      socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            io.emit("userStatus", { userId, status: "offline" });
            break;
          }
        }
        console.log("🔌 Disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => console.log(`🚀 Server on port: ${PORT}`));

  } catch (error) {
    console.error("❌ Error:", error);
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

// /* ===============================
//    MongoDB Setup
// ================================ */

// if (!uri) {
//   console.error("❌ MONGODB_URI is missing");
//   process.exit(1);
// }

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// /* ===============================
//    Database Connect
// ================================ */

// async function connectDB() {
//   try {
//     if (!client.topology) {
//       await client.connect();
//     }

//     await client.db("admin").command({ ping: 1 });

//     console.log("✅ MongoDB connected (Socket Server)");

//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error);
//     process.exit(1);
//   }
// }

// /* ===============================
//    Start Server
// ================================ */

// async function startSocketServer() {

//   await connectDB();

//   const database = client.db("onWayDB");

//   const gpsLocationsCollection = database.collection("gpsLocations");
//   const chatCollection = database.collection("chats");

//   /* Express App */
//   const app = express();

//   app.use(cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   }));

//   app.use(express.json());

//   /* Health Check */
//   app.get("/", (req, res) => {
//     res.send("🚀 OnWay Socket Server Running");
//   });

//   /* Chat History API */
//   app.get("/api/chat/history/:roomId", async (req, res) => {
//     try {

//       const { roomId } = req.params;

//       const history = await chatCollection
//         .find({ roomId })
//         .sort({ createdAt: 1 })
//         .limit(100)
//         .toArray();

//       res.json(history);

//     } catch (error) {
//       console.error(error);
//       res.status(500).json([]);
//     }
//   });

//   const server = http.createServer(app);

//   /* Socket Server */
//   const io = new Server(server, {
//     cors: {
//       origin: "*"
//     }
//   });

//   /* ===============================
//      Socket Events
//   ================================= */

//   io.on("connection", (socket) => {

//     console.log("🔌 Client Connected:", socket.id);

//     /* Room Join */
//     socket.on("joinRide", (rideId) => {
//       if (!rideId) return;
//       socket.join(rideId);
//     });

//     socket.on("joinSupport", (passengerId) => {
//       if (!passengerId) return;

//       socket.join(`support_${passengerId}`);
//     });

//     /* GPS Streaming */
//     socket.on("gpsUpdate", async (data) => {

//       try {
//         if (!data?.rideId) return;

//         const { rideId, driverId, latitude, longitude } = data;

//         await gpsLocationsCollection.insertOne({
//           rideId,
//           driverId,
//           latitude,
//           longitude,
//           timestamp: new Date()
//         });

//         socket.to(rideId).emit("receiveGpsUpdate", {
//           driverId,
//           latitude,
//           longitude,
//           timestamp: new Date()
//         });

//       } catch (error) {
//         console.error("GPS Error:", error);
//       }

//     });
//     // Active chat room list fetch kora (unique users)
//     app.get("/api/chat/active-sessions", async (req, res) => {
//       try {
//         // Shudhu "support" type chat room gulo unique vabe niye asha
//         const sessions = await chatCollection.aggregate([
//           { $match: { chatType: "support" } },
//           {
//             $group: {
//               _id: "$roomId",
//               lastMessage: { $last: "$message" },
//               lastSender: { $last: "$senderName" },
//               updatedAt: { $last: "$createdAt" }
//             }
//           },
//           { $sort: { updatedAt: -1 } }
//         ]).toArray();

//         res.status(200).json(sessions);
//       } catch (error) {
//         res.status(500).json({ error: "Failed to fetch active sessions" });
//       }
//     });

//     /* ===============================
//     Chat Session API (Outside Socket)
// ================================ */
// app.get("/api/chat/active-sessions", async (req, res) => {
//     try {
//         const sessions = await chatCollection.aggregate([
//             { $match: { chatType: "support" } },
//             {
//                 $group: {
//                     _id: "$roomId",
//                     lastMessage: { $last: "$message" },
//                     lastSender: { $last: "$senderName" },
//                     updatedAt: { $last: "$createdAt" }
//                 }
//             },
//             { $sort: { updatedAt: -1 } }
//         ]).toArray();

//         res.status(200).json(sessions);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch active sessions" });
//     }
// });

//     /* Chat Message */
//     socket.on("sendMessage", async (data) => {

//       try {

//         if (!data?.roomId || !data?.message) return;

//         const chatMessage = {
//           roomId: data.roomId,
//           senderId: data.senderId,
//           senderName: data.senderName || "User",
//           senderRole: data.senderRole,
//           chatType: data.chatType || "ride",
//           message: data.message,
//           createdAt: new Date()
//         };

//         await chatCollection.insertOne(chatMessage);

//         io.to(data.roomId).emit("receiveMessage", chatMessage);

//         console.log(
//           `✉️ [${chatMessage.chatType.toUpperCase()}] Message → ${data.roomId}`
//         );

//       } catch (error) {
//         console.error("Chat Error:", error);
//       }

//     });

//     /* Typing */
//     socket.on("typing", (data) => {
//       if (!data?.roomId) return;

//       socket.to(data.roomId).emit("userTyping", data);
//     });

//     socket.on("stopTyping", (data) => {
//       if (!data?.roomId) return;

//       socket.to(data.roomId).emit("userStoppedTyping", data);
//     });

//     socket.on("disconnect", () => {
//       console.log("🔌 Client disconnected:", socket.id);
//     });

//   });

//   /* Server Start */

//   server.listen(PORT, () => {
//     console.log(`🚀 Socket server running on port: ${PORT}`);
//   });

// }

// /* Shutdown Safe */

// process.on("SIGINT", async () => {
//   try {
//     await client.close();
//   } catch { }

//   process.exit(0);
// });

// startSocketServer();