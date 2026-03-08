const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (notificationsCollection) => {
    const router = express.Router();

    // GET /api/notifications - Get all notifications for a user
    router.get("/", async (req, res) => {
        try {
            const { userId, limit = 20, unreadOnly = false } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "userId is required"
                });
            }

            const query = { userId };
            if (unreadOnly === 'true') {
                query.isRead = false;
            }

            const notifications = await notificationsCollection
                .find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .toArray();

            const unreadCount = await notificationsCollection.countDocuments({
                userId,
                isRead: false
            });

            res.status(200).json({
                success: true,
                data: notifications,
                unreadCount,
                total: notifications.length
            });
        } catch (error) {
            console.error("Fetch Notifications Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch notifications",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // GET /api/notifications/unread-count - Get unread count only
    router.get("/unread-count", async (req, res) => {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "userId is required"
                });
            }

            const unreadCount = await notificationsCollection.countDocuments({
                userId,
                isRead: false
            });

            res.status(200).json({
                success: true,
                unreadCount
            });
        } catch (error) {
            console.error("Fetch Unread Count Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch unread count",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // POST /api/notifications - Create a new notification
    router.post("/", async (req, res) => {
        try {
            const { userId, message, type, metadata } = req.body;

            if (!userId || !message || !type) {
                return res.status(400).json({
                    success: false,
                    message: "userId, message, and type are required"
                });
            }

            const notification = {
                userId,
                message,
                type, // 'booking', 'driver_registration', 'cancellation', 'payment', 'system'
                metadata: metadata || {},
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await notificationsCollection.insertOne(notification);

            res.status(201).json({
                success: true,
                message: "Notification created successfully",
                data: {
                    _id: result.insertedId,
                    ...notification
                }
            });
        } catch (error) {
            console.error("Create Notification Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create notification",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PATCH /api/notifications/:id/read - Mark notification as read
    router.patch("/:id/read", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid notification ID"
                });
            }

            const result = await notificationsCollection.updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        isRead: true,
                        readAt: new Date(),
                        updatedAt: new Date()
                    } 
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Notification not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Notification marked as read"
            });
        } catch (error) {
            console.error("Mark Read Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to mark notification as read",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PATCH /api/notifications/mark-all-read - Mark all notifications as read
    router.patch("/mark-all-read", async (req, res) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "userId is required"
                });
            }

            const result = await notificationsCollection.updateMany(
                { userId, isRead: false },
                { 
                    $set: { 
                        isRead: true,
                        readAt: new Date(),
                        updatedAt: new Date()
                    } 
                }
            );

            res.status(200).json({
                success: true,
                message: "All notifications marked as read",
                modifiedCount: result.modifiedCount
            });
        } catch (error) {
            console.error("Mark All Read Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to mark all notifications as read",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // DELETE /api/notifications/:id - Delete a notification
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid notification ID"
                });
            }

            const result = await notificationsCollection.deleteOne({
                _id: new ObjectId(id)
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Notification not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Notification deleted successfully"
            });
        } catch (error) {
            console.error("Delete Notification Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete notification",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // DELETE /api/notifications/clear-all - Clear all notifications for a user
    router.delete("/clear-all", async (req, res) => {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "userId is required"
                });
            }

            const result = await notificationsCollection.deleteMany({ userId });

            res.status(200).json({
                success: true,
                message: "All notifications cleared",
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error("Clear All Notifications Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to clear notifications",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
};
