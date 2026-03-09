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
    console.log("✅ MongoDB Connected");

    const database = client.db("onWayDB");
    const chatCollection = database.collection("chats");

    // MongoDB Index (Performance)
    await chatCollection.createIndex({ roomId: 1 });
    await chatCollection.createIndex({ riderId: 1 });
    await chatCollection.createIndex({ passengerId: 1 });
    await chatCollection.createIndex({ chatType: 1 });
    await chatCollection.createIndex({ createdAt: -1 });

    const app = express();

    app.use(cors({
      origin: "*"
    }));

    app.use(express.json());
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*"
      }
    });

    // ONLINE USERS
    const onlineUsers = new Map();

    // SEND MESSAGE API
    app.post("/api/chat/send", async (req, res) => {

      try {

        const data = req.body;
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
          status: "sent",
          createdAt: new Date(),
        };

        const result = await chatCollection.insertOne(chatMessage);
        chatMessage._id = result.insertedId;

        // Emit to specific room
        io.to(data.roomId).emit("receiveMessage", chatMessage);

        // Dashboard Update
        if (data.chatType === "support") {
          io.emit("supportSessionUpdated");
        }

        if (data.chatType === "ride") {
          io.emit("riderChatUpdated");
        }

        res.json(chatMessage);

      } catch (error) {

        console.error("❌ Send Message Error:", error);
        res.status(500).json({ error: "Message send failed" });
      }

    });

    // CHAT HISTORY
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

    // RIDER DASHBOARD CHATS
    app.get("/api/rider/chats/:riderId", async (req, res) => {
      try {
        const { riderId } = req.params;
        const chats = await chatCollection.aggregate([

          { $match: { riderId, chatType: "ride" } },

          { $sort: { createdAt: -1 } },

          {
            $group: {
              _id: "$roomId",
              passengerId: { $first: "$passengerId" },
              lastMessage: { $first: "$message" },
              createdAt: { $first: "$createdAt" },

              unreadCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$isRead", false] },
                        { $eq: ["$senderRole", "passenger"] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }

            }
          },

          { $sort: { createdAt: -1 } }

        ]).toArray();

        res.json(chats);

      } catch (error) {
        res.status(500).json({ error: "Failed to fetch rider chats" });
      }

    });

    // SUPPORT DASHBOARD
    app.get("/api/support/sessions", async (req, res) => {

      try {
        const sessions = await chatCollection.aggregate([
          { $match: { chatType: "support" } },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$roomId",
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
                        { $ne: ["$senderRole", "support"] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          },

          { $sort: { createdAt: -1 } }

        ]).toArray();

        res.json(sessions);

      } catch (error) {
        res.status(500).json({ error: "Failed to fetch support sessions" });
      }
    });

    // SOCKET EVENTS

    io.on("connection", (socket) => {
      console.log("🔌 User Connected:", socket.id);
      // REGISTER USER
      socket.on("registerUser", ({ userId }) => {
        onlineUsers.set(userId, socket.id);
        io.emit("userStatus", {
          userId,
          status: "online"
        });
      });

      // JOIN ROOM
      socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log(`👤 Joined room ${roomId}`);
      });

      // TYPING
      socket.on("typing", ({ roomId, userId, userName }) => {

        socket.to(roomId).emit("userTyping", {
          roomId,
          userId,
          userName
        });

      });

      socket.on("stopTyping", ({ roomId }) => {
        socket.to(roomId).emit("userStoppedTyping", { roomId });

      });

      // READ STATUS
      socket.on("markAsRead", async ({ roomId, userId }) => {

        await chatCollection.updateMany(
          { roomId, senderId: { $ne: userId }, isRead: false },
          { $set: { isRead: true } }
        );

        io.to(roomId).emit("messagesSeen", {
          roomId,
          userId
        });

      });

      // DISCONNECT
      socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            io.emit("userStatus", {
              userId,
              status: "offline"
            });
            break;
          }
        }
        console.log("❌ User Disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Socket Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server Start Error:", error);
  }

}
startSocketServer();
