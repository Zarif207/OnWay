require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion } = require("mongodb");

const {setServers}  = require("node:dns/promises");

setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.SOCKET_PORT || 4002;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function startChatServer() {
    try {
        await client.connect();
        console.log("✅ MongoDB Connected");

        const db = client.db("onWayDB");
        const chatCollection = db.collection("chats");

        await chatCollection.createIndex({ roomId: 1 });
        await chatCollection.createIndex({ senderId: 1 });
        await chatCollection.createIndex({ senderRole: 1 });
        await chatCollection.createIndex({ chatType: 1 });
        await chatCollection.createIndex({ createdAt: -1 });

        const app = express();
        app.use(cors({ origin: "*" }));
        app.use(express.json());

        const server = http.createServer(app);
        const io = new Server(server, { cors: { origin: "*" } });

        // ── Online maps ──────────────────────────────────────────
        const onlineUsers = new Map(); // userId   → socketId
        const supportAgents = new Map(); // agentId  → socketId
        const adminUsers = new Map(); // adminId  → socketId

        // ════════════════════════════════════════════════════════
        //  SOCKET
        // ════════════════════════════════════════════════════════
        io.on("connection", (socket) => {
            console.log("🔌 Connected:", socket.id);

            // ── registerUser ─────────────────────────────────────
            socket.on("registerUser", ({ userId, role }) => {
                if (!userId) return;
                const uid = String(userId);
                onlineUsers.set(uid, socket.id);
                socket.userId = uid;
                socket.userRole = role;

                if (role === "support") {
                    socket.join("support_room");
                    supportAgents.set(uid, socket.id);
                }

                if (role === "admin") {
                    socket.join("admin_room");
                    adminUsers.set(uid, socket.id);
                    // ✅ broadcast "admin" key — frontend checks onlineStatus["admin"]
                    io.emit("userStatus", { userId: "admin", status: "online" });
                }

                // broadcast real userId status
                io.emit("userStatus", { userId: uid, status: "online" });

                // send current online list to this new socket
                const list = [];
                for (const [u] of onlineUsers.entries()) {
                    list.push({ userId: u, status: "online" });
                }
                if (adminUsers.size > 0) {
                    list.push({ userId: "admin", status: "online" });
                }
                socket.emit("onlineUsersList", list);

                console.log(`✅ Registered: ${role} → ${uid}`);
            });

            socket.on("joinRoom", ({ roomId }) => { if (roomId) socket.join(roomId); });
            socket.on("leaveRoom", ({ roomId }) => { if (roomId) socket.leave(roomId); });
            socket.on("joinSupport", () => socket.join("support_room"));

            // ── Typing ───────────────────────────────────────────
            socket.on("typing", ({ roomId, userId, userName }) =>
                socket.to(roomId).emit("userTyping", { roomId, userId, userName }));
            socket.on("stopTyping", ({ roomId, userId }) =>
                socket.to(roomId).emit("userStopTyping", { roomId, userId }));

            // ── Mark read ────────────────────────────────────────
            socket.on("markAsRead", async ({ roomId, userId }) => {
                if (!roomId || !userId) return;
                try {
                    await chatCollection.updateMany(
                        { roomId, isRead: false, senderId: { $ne: String(userId) } },
                        { $set: { isRead: true } }
                    );
                    io.to(roomId).emit("messagesSeen", { roomId, userId });

                    if (roomId.startsWith("support_")) {
                        io.to("support_room").emit("supportSessionUpdated", { roomId });
                        io.to("admin_room").emit("adminSessionUpdated", { roomId });
                    } else if (roomId.startsWith("ride_")) {
                        const doc = await chatCollection
                            .find({ roomId }).sort({ createdAt: -1 }).limit(1).toArray();
                        if (doc[0]) {
                            const { riderId, passengerId } = doc[0];
                            if (riderId) {
                                const s = onlineUsers.get(String(riderId));
                                if (s) io.to(s).emit("riderChatUpdated", { roomId });
                            }
                            if (passengerId) {
                                const s = onlineUsers.get(String(passengerId));
                                if (s) io.to(s).emit("riderChatUpdated", { roomId });
                            }
                        }
                        io.to("admin_room").emit("adminSessionUpdated", { roomId });
                    }
                } catch (err) { console.error("markAsRead:", err); }
            });

            // ── WebRTC ────────────────────────────────────────────
            socket.on("callUser", ({ toUserId, offer, fromUserId, callType, fromUserName }) => {
                let targetSocket = null;
                let resolvedTarget = String(toUserId);

                if (toUserId === "support") {
                    const e = supportAgents.entries().next().value;
                    if (e) { resolvedTarget = e[0]; targetSocket = e[1]; }
                } else if (toUserId === "admin") {
                    const e = adminUsers.entries().next().value;
                    if (e) { resolvedTarget = e[0]; targetSocket = e[1]; }
                } else {
                    targetSocket = onlineUsers.get(resolvedTarget);
                }

                if (targetSocket) {
                    io.to(targetSocket).emit("incomingCall", {
                        fromUserId,
                        fromUserName: fromUserName || "Unknown", // ✅ caller-এর নাম
                        offer,
                        callType,
                        toUserId: resolvedTarget,
                    });
                    console.log(`📞 ${fromUserName || fromUserId} → ${resolvedTarget} (${callType})`);
                } else {
                    socket.emit("callFailed", {
                        toUserId,
                        reason: "User is currently offline",
                    });
                }
            });

            socket.on("answerCall", ({ toUserId, answer }) => {
                const s = onlineUsers.get(String(toUserId));
                if (s) io.to(s).emit("callAccepted", { answer });
            });

            socket.on("iceCandidate", ({ toUserId, candidate }) => {
                const s = onlineUsers.get(String(toUserId));
                if (s) io.to(s).emit("iceCandidate", { candidate });
            });

            socket.on("endCall", ({ toUserId }) => {
                const s = onlineUsers.get(String(toUserId));
                if (s) io.to(s).emit("callEnded");
            });

            // ── Disconnect ───────────────────────────────────────
            socket.on("disconnect", () => {
                for (const [uid, sid] of onlineUsers.entries()) {
                    if (sid !== socket.id) continue;
                    const wasAdmin = adminUsers.has(uid);
                    onlineUsers.delete(uid);
                    supportAgents.delete(uid);
                    adminUsers.delete(uid);
                    io.emit("userStatus", { userId: uid, status: "offline" });
                    if (wasAdmin && adminUsers.size === 0) {
                        io.emit("userStatus", { userId: "admin", status: "offline" });
                    }
                    console.log(`📴 Offline: ${uid}`);
                    break;
                }
            });
        });

        // ════════════════════════════════════════════════════════
        //  REST — SEND MESSAGE
        // ════════════════════════════════════════════════════════
        app.post("/api/chat/send", async (req, res) => {
            try {
                const d = req.body;
                const chatType = d.chatType === "support" ? "support"
                    : d.chatType === "admin" ? "admin" : "ride";

                let roomId = String(d.roomId || "");
                if (chatType === "ride" && !roomId.startsWith("ride_")) roomId = `ride_${roomId}`;
                if (chatType === "support" && !roomId.startsWith("support_")) roomId = `support_${roomId}`;
                if (chatType === "admin" && !roomId.startsWith("admin_")) roomId = `admin_${roomId}`;

                const senderId = String(d.senderId);
                const passengerId = d.passengerId ? String(d.passengerId) : null;
                const riderId = d.riderId ? String(d.riderId) : null;
                const allowed = ["passenger", "rider", "support", "admin"];
                const senderRole = allowed.includes(d.senderRole) ? d.senderRole : "passenger";
                const message = typeof d.message === "string" ? d.message : "";
                if (message.length > 10000) return res.status(413).json({ error: "Too large" });

                const doc = {
                    roomId, rideId: d.rideId || null,
                    passengerId, riderId, senderId,
                    senderName: d.senderName || null, senderRole, chatType,
                    message, messageType: d.messageType || "text",
                    fileUrl: d.fileUrl || null, isRead: false, createdAt: new Date(),
                };

                const result = await chatCollection.insertOne(doc);
                doc._id = result.insertedId;

                io.to(roomId).emit("receiveMessage", doc);

                if (chatType === "support") {
                    io.to("support_room").emit("supportSessionUpdated", { roomId, chatMessage: doc });
                    io.to("admin_room").emit("adminNotification", { type: "support", roomId, chatMessage: doc });
                }
                if (chatType === "ride") {
                    if (riderId && onlineUsers.has(riderId)) io.to(onlineUsers.get(riderId)).emit("riderChatUpdated", { roomId });
                    if (passengerId && onlineUsers.has(passengerId)) io.to(onlineUsers.get(passengerId)).emit("riderChatUpdated", { roomId });
                    io.to("admin_room").emit("adminNotification", { type: "ride", roomId, chatMessage: doc });
                }
                if (chatType === "admin") {
                    io.to("admin_room").emit("adminNotification", { type: "admin", roomId, chatMessage: doc });
                }

                res.status(201).json(doc);
            } catch (err) {
                console.error("send:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — CHAT HISTORY
        // ════════════════════════════════════════════════════════
        app.get("/api/chat/history/:roomId", async (req, res) => {
            try {
                const { roomId } = req.params;
                const { userId, role } = req.query;
                if (!roomId) return res.status(400).json({ error: "roomId required" });

                if (role !== "support" && role !== "admin") {
                    const s = await chatCollection.findOne({ roomId });
                    if (s) {
                        const ok = String(s.passengerId) === String(userId)
                            || String(s.riderId) === String(userId)
                            || String(s.senderId) === String(userId);
                        if (!ok) return res.status(403).json({ error: "Forbidden" });
                    }
                }

                const history = await chatCollection
                    .find({ roomId })
                    .sort({ createdAt: 1 })
                    .toArray();
                res.json(history);
            } catch (err) {
                console.error("history:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — RIDER CHATS (ride list)
        // ════════════════════════════════════════════════════════
        app.get("/api/rider/chats/:riderId", async (req, res) => {
            try {
                const { riderId } = req.params;
                const rows = await chatCollection.aggregate([
                    { $match: { riderId: String(riderId), chatType: "ride" } },
                    { $sort: { createdAt: 1 } },
                    {
                        $group: {
                            _id: "$roomId",
                            roomId: { $first: "$roomId" },
                            passengerId: { $first: "$passengerId" },
                            senderName: { $max: { $cond: [{ $eq: ["$senderRole", "passenger"] }, "$senderName", null] } },
                            lastMessage: { $last: "$message" },
                            lastMessageTime: { $last: "$createdAt" },
                            unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$senderRole", "passenger"] }] }, 1, 0] } },
                        },
                    },
                    { $sort: { lastMessageTime: -1 } },
                ]).toArray();
                res.json(rows.map(r => ({ ...r, senderName: r.senderName || "Passenger" })));
            } catch (err) {
                console.error("rider/chats:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — PASSENGER CHATS (ride list)
        // ════════════════════════════════════════════════════════
        app.get("/api/passenger/chats/:passengerId", async (req, res) => {
            try {
                const { passengerId } = req.params;
                const rows = await chatCollection.aggregate([
                    { $match: { passengerId: String(passengerId), chatType: "ride" } },
                    { $sort: { createdAt: 1 } },
                    {
                        $group: {
                            _id: "$roomId",
                            roomId: { $first: "$roomId" },
                            riderId: { $first: "$riderId" },
                            senderName: { $max: { $cond: [{ $eq: ["$senderRole", "rider"] }, "$senderName", null] } },
                            lastMessage: { $last: "$message" },
                            lastMessageTime: { $last: "$createdAt" },
                            unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$senderRole", "rider"] }] }, 1, 0] } },
                        },
                    },
                    { $sort: { lastMessageTime: -1 } },
                ]).toArray();
                res.json(rows.map(r => ({ ...r, senderName: r.senderName || "Rider" })));
            } catch (err) {
                console.error("passenger/chats:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — PASSENGER SUPPORT SESSIONS
        //  match by senderRole="passenger" — immune to old bad data
        // ════════════════════════════════════════════════════════
        app.get("/api/support/sessions", async (req, res) => {
            try {
                const rows = await chatCollection.aggregate([
                    { $match: { chatType: "support", senderRole: "passenger" } },
                    { $sort: { createdAt: 1 } },
                    {
                        $group: {
                            _id: "$roomId",
                            roomId: { $first: "$roomId" },
                            passengerId: { $first: "$senderId" },
                            senderName: { $first: "$senderName" },
                            lastMessage: { $last: "$message" },
                            lastMessageTime: { $last: "$createdAt" },
                            unreadCount: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } },
                        },
                    },
                    { $sort: { lastMessageTime: -1 } },
                ]).toArray();
                res.json(rows);
            } catch (err) {
                console.error("support/sessions:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — RIDER SUPPORT SESSIONS
        //  match by senderRole="rider" — immune to old bad data
        // ════════════════════════════════════════════════════════
        app.get("/api/rider/support-sessions", async (req, res) => {
            try {
                const rows = await chatCollection.aggregate([
                    { $match: { chatType: "support", senderRole: "rider" } },
                    { $sort: { createdAt: 1 } },
                    {
                        $group: {
                            _id: "$roomId",
                            roomId: { $first: "$roomId" },
                            riderId: { $first: "$senderId" },
                            senderName: { $first: "$senderName" },
                            lastMessage: { $last: "$message" },
                            lastMessageTime: { $last: "$createdAt" },
                            unreadCount: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } },
                        },
                    },
                    { $sort: { lastMessageTime: -1 } },
                ]).toArray();
                res.json(rows);
            } catch (err) {
                console.error("rider/support-sessions:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — ADMIN: ALL SESSIONS
        // ════════════════════════════════════════════════════════
        app.get("/api/admin/all-sessions", async (req, res) => {
            try {
                const { type } = req.query;
                const match = type ? { chatType: type } : {};
                const rows = await chatCollection.aggregate([
                    { $match: match },
                    { $sort: { createdAt: 1 } },
                    {
                        $group: {
                            _id: "$roomId",
                            roomId: { $first: "$roomId" },
                            chatType: { $first: "$chatType" },
                            passengerId: { $first: "$passengerId" },
                            riderId: { $first: "$riderId" },
                            senderName: { $first: "$senderName" },
                            lastMessage: { $last: "$message" },
                            lastMessageTime: { $last: "$createdAt" },
                            totalMessages: { $sum: 1 },
                            unreadCount: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } },
                        },
                    },
                    { $sort: { lastMessageTime: -1 } },
                ]).toArray();
                res.json(rows);
            } catch (err) {
                console.error("admin/all-sessions:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — ADMIN: STATS
        // ════════════════════════════════════════════════════════
        app.get("/api/admin/stats", async (req, res) => {
            try {
                const [rides, support, unread, total] = await Promise.all([
                    chatCollection.distinct("roomId", { chatType: "ride" }),
                    chatCollection.distinct("roomId", { chatType: "support" }),
                    chatCollection.countDocuments({ isRead: false }),
                    chatCollection.countDocuments({}),
                ]);
                res.json({
                    totalRideChats: rides.length,
                    totalSupportSessions: support.length,
                    totalUnread: unread,
                    totalMessages: total,
                    onlineUsers: onlineUsers.size,
                });
            } catch (err) {
                console.error("stats:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — ADMIN: SUPPORT-AGENT CHATS (support → admin)
        // ════════════════════════════════════════════════════════
        app.get("/api/admin/support-chats", async (req, res) => {
            try {
                const rows = await chatCollection.aggregate([
                    { $match: { chatType: "admin", senderRole: "support" } },
                    { $sort: { createdAt: 1 } },
                    {
                        $group: {
                            _id: "$roomId",
                            roomId: { $first: "$roomId" },
                            senderId: { $first: "$senderId" },
                            senderName: { $first: "$senderName" },
                            lastMessage: { $last: "$message" },
                            lastMessageTime: { $last: "$createdAt" },
                            unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $ne: ["$senderRole", "admin"] }] }, 1, 0] } },
                        },
                    },
                    { $sort: { lastMessageTime: -1 } },
                ]).toArray();
                res.json(rows);
            } catch (err) {
                console.error("admin/support-chats:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — ONLINE STATUS
        // ════════════════════════════════════════════════════════
        app.get("/api/online/support-agents", (_req, res) => {
            res.json([...supportAgents.keys()].map(u => ({ userId: u, status: "online" })));
        });

        app.get("/api/online/admins", (_req, res) => {
            res.json([...adminUsers.keys()].map(u => ({ userId: u, status: "online" })));
        });

        // ════════════════════════════════════════════════════════
        //  REST — EDIT MESSAGE
        // ════════════════════════════════════════════════════════
        app.patch("/api/chat/message/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { message, userId } = req.body;
                if (!message?.trim()) return res.status(400).json({ error: "Empty message" });

                const { ObjectId } = require("mongodb");
                const doc = await chatCollection.findOne({ _id: new ObjectId(id) });
                if (!doc) return res.status(404).json({ error: "Not found" });
                if (String(doc.senderId) !== String(userId))
                    return res.status(403).json({ error: "Not your message" });

                await chatCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { message: message.trim(), edited: true, editedAt: new Date() } }
                );

                const updated = { ...doc, message: message.trim(), edited: true };
                // ✅ broadcast to room
                io.to(doc.roomId).emit("messageEdited", updated);

                res.json(updated);
            } catch (err) {
                console.error("edit:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ════════════════════════════════════════════════════════
        //  REST — DELETE MESSAGE
        // ════════════════════════════════════════════════════════
        app.delete("/api/chat/message/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { userId } = req.body;

                const { ObjectId } = require("mongodb");
                const doc = await chatCollection.findOne({ _id: new ObjectId(id) });
                if (!doc) return res.status(404).json({ error: "Not found" });
                if (String(doc.senderId) !== String(userId))
                    return res.status(403).json({ error: "Not your message" });

                // Soft delete — message text replace করো
                await chatCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { message: "", deleted: true, deletedAt: new Date() } }
                );

                const updated = { ...doc, message: "", deleted: true };
                // ✅ broadcast to room
                io.to(doc.roomId).emit("messageDeleted", { _id: id, roomId: doc.roomId });

                res.json({ success: true });
            } catch (err) {
                console.error("delete:", err);
                res.status(500).json({ error: "Failed" });
            }
        });

        // ── Start ────────────────────────────────────────────────
        server.listen(PORT, () =>
            console.log(`🚀 Chat server on port ${PORT}`)
        );
    } catch (err) {
        console.error("FATAL:", err);
        process.exit(1);
    }
}

startChatServer();
