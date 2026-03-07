const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (collections) => {
    const router = express.Router();
    const { passengerCollection, ridesCollection, emergencyCollection } = collections;

    // 1. Get all complaints
    router.get("/complaints", async (req, res) => {
        try {
            // You can create a complaints collection or filter from rides
            const complaints = [
                { id: 1, user: "John Doe", type: "Driver Behavior", status: "Pending", date: "2024-03-08", priority: "High" },
                { id: 2, user: "Jane Smith", type: "Payment Issue", status: "In Progress", date: "2024-03-07", priority: "Medium" },
            ];
            res.status(200).json({ success: true, data: complaints });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 2. Get all SOS alerts
    router.get("/sos-alerts", async (req, res) => {
        try {
            const sosAlerts = await emergencyCollection
                .find({})
                .sort({ timestamp: -1 })
                .limit(50)
                .toArray();
            
            res.status(200).json({ success: true, data: sosAlerts });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 3. Update SOS alert status
    router.patch("/sos-alerts/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            await emergencyCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status, updatedAt: new Date() } }
            );
            
            res.status(200).json({ success: true, message: "SOS alert updated" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 4. Get all refund requests
    router.get("/refunds", async (req, res) => {
        try {
            // You can create a refunds collection
            const refunds = [
                { id: 1, user: "Emma Davis", amount: "$25.50", reason: "Cancelled Ride", status: "Pending", date: "2024-03-08" },
                { id: 2, user: "James Wilson", amount: "$18.00", reason: "Overcharged", status: "Approved", date: "2024-03-07" },
            ];
            res.status(200).json({ success: true, data: refunds });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 5. Process refund
    router.patch("/refunds/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // "Approved" or "Rejected"
            
            // Update refund status in database
            res.status(200).json({ success: true, message: `Refund ${status}` });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 6. Get all verification requests
    router.get("/verifications", async (req, res) => {
        try {
            // Get users with pending verification
            const verifications = await passengerCollection
                .find({ 
                    role: "rider",
                    $or: [
                        { verificationStatus: "Pending" },
                        { verificationStatus: { $exists: false } }
                    ]
                })
                .toArray();
            
            res.status(200).json({ success: true, data: verifications });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 7. Update verification status
    router.patch("/verifications/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // "Approved" or "Rejected"
            
            await passengerCollection.updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        verificationStatus: status,
                        verifiedAt: new Date()
                    } 
                }
            );
            
            res.status(200).json({ success: true, message: `Verification ${status}` });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 8. Get chat support messages
    router.get("/chat-messages", async (req, res) => {
        try {
            // You can create a messages collection
            const messages = [
                { id: 1, user: "Alice Cooper", message: "I need help with my payment", time: "Just now", unread: 2 },
                { id: 2, user: "Bob Martin", message: "Where is my driver?", time: "5 mins ago", unread: 1 },
            ];
            res.status(200).json({ success: true, data: messages });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 9. Send chat message
    router.post("/chat-messages", async (req, res) => {
        try {
            const { userId, message } = req.body;
            
            // Save message to database
            res.status(201).json({ success: true, message: "Message sent" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 10. Get dashboard stats
    router.get("/stats", async (req, res) => {
        try {
            const totalComplaints = 15;
            const activeSOS = await emergencyCollection.countDocuments({ status: "Active" });
            const pendingRefunds = 5;
            const pendingVerifications = 8;
            
            res.status(200).json({ 
                success: true, 
                data: {
                    totalComplaints,
                    activeSOS,
                    pendingRefunds,
                    pendingVerifications
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 11. Update user role to support agent
    router.post("/make-support-agent", async (req, res) => {
        try {
            const { email } = req.body;
            
            if (!email) {
                return res.status(400).json({ success: false, message: "Email is required" });
            }

            // Check if user exists
            const user = await passengerCollection.findOne({ email });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // Update user role to supportAgent
            await passengerCollection.updateOne(
                { email },
                { 
                    $set: { 
                        role: "supportAgent",
                        updatedAt: new Date()
                    } 
                }
            );

            res.status(200).json({ 
                success: true, 
                message: `User ${email} is now a Support Agent`,
                data: { email, role: "supportAgent" }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};
