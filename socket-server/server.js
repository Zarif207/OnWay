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

    // ================= SEND MESSAGE =================

    app.post("/api/chat/send", async (req, res) => {
      try {
        const data = req.body;

        if (!data.roomId || !data.senderId) {
          return res.status(400).json({ error: "Missing roomId or senderId" });
        }

        const chatMessage = {
          roomId: data.roomId,
          rideId: data.rideId || null,

          passengerId: data.passengerId || null,
          riderId: data.riderId || null,

          senderId: data.senderId,
          senderName: data.senderName,
          senderRole: data.senderRole,

          chatType: data.chatType,

          message: data.message || "",
          messageType: data.messageType || "text",
          fileUrl: data.fileUrl || null,

          isRead: false,
          createdAt: new Date(),
        };

        const result = await chatCollection.insertOne(chatMessage);
        chatMessage._id = result.insertedId;

        io.to(data.roomId).emit("receiveMessage", chatMessage);

        if (data.chatType === "support") io.emit("supportSessionUpdated");
        if (data.chatType === "ride") io.emit("riderChatUpdated");

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
        const { userId } = req.query;

        const history = await chatCollection
          .find({
            roomId,
            $or: [
              { passengerId: userId },
              { riderId: userId },
              { senderRole: "support" },
            ],
          })
          .sort({ createdAt: 1 })
          .toArray();

        res.json(history);
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

    // ================= SOCKET EVENTS =================

    io.on("connection", (socket) => {
      console.log("🔌 New Connection:", socket.id);

      // register user

      socket.on("registerUser", ({ userId }) => {
        onlineUsers.set(userId, socket.id);
        io.emit("userStatus", { userId, status: "online" });
      });

      // join room (support allowed)

      socket.on("joinRoom", async ({ roomId, userId, role }) => {
        try {
          const chat = await chatCollection.findOne({ roomId });

          if (!chat) {
            socket.join(roomId);
            return;
          }

          const allowed =
            chat.passengerId === userId ||
            chat.riderId === userId ||
            role === "support";

          if (allowed) {
            socket.join(roomId);
            console.log(`👤 ${userId} joined room ${roomId}`);
          } else {
            console.log("❌ Unauthorized room join attempt");
          }
        } catch (error) {
          console.log("joinRoom error:", error);
        }
      });

      // leave room

      socket.on("leaveRoom", ({ roomId }) => {
        socket.leave(roomId);
      });

      // typing

      socket.on("typing", ({ roomId, userId, userName }) => {
        socket.to(roomId).emit("userTyping", { roomId, userId, userName });
      });

      socket.on("stopTyping", ({ roomId }) => {
        socket.to(roomId).emit("userStoppedTyping", { roomId });
      });

      // mark as read

      socket.on("markAsRead", async ({ roomId, userId }) => {
        try {
          await chatCollection.updateMany(
            {
              roomId,
              senderId: { $ne: userId },
              isRead: false,
            },
            { $set: { isRead: true } }
          );

          io.to(roomId).emit("messagesSeen", { roomId, userId });
        } catch (error) {
          console.log("markAsRead error:", error);
        }
      });

      socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            io.emit("userStatus", { userId, status: "offline" });
            break;
          }
        }
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Socket Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("FATAL ERROR:", error);
    process.exit(1);
  }
}

startSocketServer();