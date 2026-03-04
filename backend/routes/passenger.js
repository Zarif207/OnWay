const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

module.exports = (passengerCollection) => {
    const router = express.Router();

    // 1. Get All Users
    router.get("/", async (req, res) => {
        try {
            const users = await passengerCollection.find({}).toArray();
            res.json({ success: true, data: users });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 2. Find User 
    router.get("/find", async (req, res) => {
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await passengerCollection.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    });

    // 3. Create User 
    router.post("/", async (req, res) => {
        try {
            const { name, email, phone, password, role, image, authProvider } = req.body;
            if (!email || !name || (!password && !authProvider)) {
                return res.status(400).json({ message: "Missing required fields" });
            }
            const existingUser = await passengerCollection.findOne({ email });
            if (existingUser) return res.status(400).json({ message: "User already exists" });

            let newUser = {
                name, email, phone,
                image: image || "",
                role: role || "passenger",
                status: "Active",
                authProvider: authProvider || "credentials",
                createdAt: new Date(),
                lastLogin: new Date(),
            };
            if (password) newUser.password = await bcrypt.hash(password, 10);
            const result = await passengerCollection.insertOne(newUser);
            res.status(201).json({ success: true, data: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 4. Patch route to update status 
    router.patch("/status/:id", async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            await passengerCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: status } }
            );
            res.json({ success: true, message: "Status updated" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 5. Update User Data (New)
    router.put("/update/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { name, phone, role } = req.body;
            await passengerCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { name, phone, role } }
            );
            res.json({ success: true, message: "User updated" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 6. Delete User (New)
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            await passengerCollection.deleteOne({ _id: new ObjectId(id) });
            res.json({ success: true, message: "User deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Bulk Delete Route 
    router.post("/bulk-delete", async (req, res) => {
        try {
            const { ids } = req.body;
            const objectIds = ids.map(id => new ObjectId(id));
            await passengerCollection.deleteMany({ _id: { $in: objectIds } });
            res.json({ success: true, message: "Users deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};