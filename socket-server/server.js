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

    await chatCollection.createIndex({ roomId: 1 });
    await chatCollection.createIndex({ passengerId: 1 });
    await chatCollection.createIndex({ riderId: 1 });
    await chatCollection.createIndex({ createdAt: -1 });

    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: { origin: "*" },
    });

    const onlineUsers = new Map();

    // ================= SOCKET CONNECTION =================

    io.on("connection", (socket) => {
      console.log("🔌 User connected:", socket.id);

      // register user
      socket.on("registerUser", ({ userId }) => {
        onlineUsers.set(String(userId), socket.id);
        console.log("User registered:", userId);
      });

      // join chat room
      socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log("User joined room:", roomId);
      });

      // support agents join support room
      socket.on("joinSupport", () => {
        socket.join("support");
        console.log("Support agent joined support room");
      });

      // typing indicator
      socket.on("typing", ({ roomId, userId, userName }) => {
        socket.to(roomId).emit("userTyping", { roomId, userId, userName });
      });

      socket.on("stopTyping", ({ roomId, userId }) => {
        socket.to(roomId).emit("userStopTyping", { roomId, userId });
      });

      // mark messages as seen
      socket.on("markAsRead", async ({ roomId, userId }) => {
        if (!roomId || !userId) return;

        try {
          await chatCollection.updateMany(
            { roomId, isRead: false, senderId: { $ne: String(userId) } },
            { $set: { isRead: true } }
          );

          io.to(roomId).emit("messagesSeen", { roomId, userId });

          // Also notify support or rider lists about the update
          if (roomId.startsWith("support_")) {
            io.to("support").emit("supportSessionUpdated", { roomId });
          } else if (roomId.startsWith("ride_")) {
            const chatDoc = await chatCollection.findOne({ roomId }, { sort: { createdAt: -1 } });
            if (chatDoc) {
              if (chatDoc.riderId) {
                const sId = onlineUsers.get(String(chatDoc.riderId));
                if (sId) io.to(sId).emit("riderChatUpdated", { roomId });
              }
              if (chatDoc.passengerId) {
                const sId = onlineUsers.get(String(chatDoc.passengerId));
                if (sId) io.to(sId).emit("riderChatUpdated", { roomId });
              }
            }
          }
        } catch (error) {
          console.error("markAsRead error:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);

        for (const [userId, sockId] of onlineUsers.entries()) {
          if (sockId === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }
      });
    });

    // ================= SEND MESSAGE =================

    app.post("/api/chat/send", async (req, res) => {
      try {
        const data = req.body;

        // Determine chat type and enforce room naming
        let chatType = data.chatType === "support" ? "support" : "ride";
        let roomId = String(data.roomId);

        // Ensure room naming rules
        if (chatType === "ride" && !roomId.startsWith("ride_")) {
          roomId = `ride_${roomId}`;
        } else if (chatType === "support" && !roomId.startsWith("support_")) {
          roomId = `support_${roomId}`;
        }

        const senderId = String(data.senderId);
        const passengerId = data.passengerId ? String(data.passengerId) : null;
        const riderId = data.riderId ? String(data.riderId) : null;

        const senderRole = ["passenger", "rider", "support"].includes(data.senderRole)
          ? data.senderRole
          : "passenger";
        const message = typeof data.message === "string" ? data.message : "";

        if (message.length > 10000) {
          return res.status(413).json({ error: "Message too large" });
        }

        const chatMessage = {
          roomId,
          rideId: data.rideId || null,

          passengerId,
          riderId,

          senderId,
          senderName: data.senderName || null,
          senderRole,

          chatType,

          message,
          messageType: data.messageType || "text",
          fileUrl: data.fileUrl || null,

          isRead: false,
          createdAt: new Date(),
        };

        const result = await chatCollection.insertOne(chatMessage);
        chatMessage._id = result.insertedId;

        // send message to room
        io.to(roomId).emit("receiveMessage", chatMessage);

        // support notifications
        if (chatType === "support") {
          io.to("support").emit("supportSessionUpdated", { roomId });
        }

        // rider & passenger update
        if (chatType === "ride") {
          if (riderId && onlineUsers.has(riderId)) {
            io.to(onlineUsers.get(riderId)).emit("riderChatUpdated", { roomId });
          }

          if (passengerId && onlineUsers.has(passengerId)) {
            io.to(onlineUsers.get(passengerId)).emit("riderChatUpdated", { roomId });
          }
        }

        res.status(201).json(chatMessage);
      } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ error: "Failed to send message" });
      }
    });

    // ================= CHAT HISTORY =================

    app.get("/api/chat/history/:roomId", async (req, res) => {
      try {
        const { roomId } = req.params;
        const { userId, role } = req.query;

        if (!roomId) return res.status(400).json({ error: "Room ID required" });

        // Authorization check
        if (role !== "support") {
          const chatDoc = await chatCollection.findOne({ roomId });
          if (chatDoc) {
            const allowed =
              String(chatDoc.passengerId) === String(userId) ||
              String(chatDoc.riderId) === String(userId) ||
              String(chatDoc.senderId) === String(userId);
            if (!allowed) return res.status(403).json({ error: "Not authorized" });
          }
        }

        const history = await chatCollection
          .find({ roomId })
          .sort({ createdAt: 1 })
          .toArray();

        res.json(history || []);
      } catch (error) {
        console.error("History error:", error);
        res.status(500).json({ error: "Failed to load history" });
      }
    });

    // ================= RIDER CHAT LIST =================

    app.get("/api/rider/chats/:riderId", async (req, res) => {
      try {
        const { riderId } = req.params;

        const chats = await chatCollection
          .aggregate([
            { $match: { riderId, chatType: "ride" } },
            { $sort: { createdAt: -1 } },
            {
              $group: {
                _id: "$roomId",
                roomId: { $first: "$roomId" },
                passengerId: { $first: "$passengerId" },
                senderName: { $first: "$senderName" },
                lastMessage: { $first: "$message" },
                lastMessageTime: { $first: "$createdAt" },
                unreadCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$isRead", false] },
                          { $eq: ["$senderRole", "passenger"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { lastMessageTime: -1 } },
          ])
          .toArray();

        res.json(chats);
      } catch (error) {
        console.error("Rider chats error:", error);
        res.status(500).json({ error: "Failed to fetch rider chats" });
      }
    });

    // ================= PASSENGER CHAT LIST =================

    app.get("/api/passenger/chats/:passengerId", async (req, res) => {
      try {
        const { passengerId } = req.params;

        const chats = await chatCollection
          .aggregate([
            { $match: { passengerId, chatType: "ride" } },
            { $sort: { createdAt: -1 } },
            {
              $group: {
                _id: "$roomId",
                roomId: { $first: "$roomId" },
                riderId: { $first: "$riderId" },
                senderName: { $first: "$senderName" },
                lastMessage: { $first: "$message" },
                lastMessageTime: { $first: "$createdAt" },
                unreadCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$isRead", false] },
                          { $eq: ["$senderRole", "rider"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { lastMessageTime: -1 } },
          ])
          .toArray();

        res.json(chats);
      } catch (error) {
        console.error("Passenger chats error:", error);
        res.status(500).json({ error: "Failed to fetch passenger chats" });
      }
    });

    // ================= SUPPORT CHAT SESSIONS =================

    app.get("/api/support/sessions", async (req, res) => {
      try {
        const sessions = await chatCollection
          .aggregate([
            { $match: { chatType: "support" } },
            { $sort: { createdAt: -1 } },
            {
              $group: {
                _id: "$roomId",
                roomId: { $first: "$roomId" },
                passengerId: { $first: "$passengerId" },
                senderName: { $first: "$senderName" },
                lastMessage: { $first: "$message" },
                createdAt: { $first: "$createdAt" },
                unreadCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$isRead", false] },
                          { $ne: ["$senderRole", "support"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { createdAt: -1 } },
          ])
          .toArray();

        res.json(sessions);
      } catch (error) {
        console.error("Support sessions error:", error);
        res.status(500).json({ error: "Failed to fetch support sessions" });
      }
    });

    server.listen(PORT, () => {
      console.log(`🚀 Socket server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("FATAL ERROR:", error);
    process.exit(1);
  }
}

startSocketServer();