const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

module.exports = (passengerCollection) => {
    const router = express.Router();

    // 1. Get All Users
    router.get("/", async (req, res) => {
        try {
            const users = await passengerCollection.find({}).toArray();
            res.status(200).json({ success: true, data: users });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // 2. Find User (NextAuth Credentials-er jonno khub gurutto purno)
    router.get("/find", async (req, res) => {
        try {
            const email = req.query.email;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const user = await passengerCollection.findOne({ email });

            // NextAuth (v5) Authorize function 404 pele crash kore HTML return kore
            // Tai user na pele 200 status e null pathano safest way
            if (!user) {
                return res.status(200).json(null);
            }

            res.status(200).json(user);
        } catch (error) {
            console.error("Find user error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // 3. Create User (Registration & Social Login Sync)
    router.post("/", async (req, res) => {
        try {
            const { name, email, phone, password, role, image, authProvider } = req.body;

            if (!email || !name || (!password && !authProvider)) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const existingUser = await passengerCollection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            let newUser = {
                name,
                email,
                phone: phone || "",
                image: image || "",
                role: role || "passenger",
                status: "Active",
                authProvider: authProvider || "credentials",
                createdAt: new Date(),
                lastLogin: new Date(),
            };

            // Password thakle hash korbe (Credentials login-er khetre)
            if (password) {
                newUser.password = await bcrypt.hash(password, 10);
            }

            const result = await passengerCollection.insertOne(newUser);
            res.status(201).json({ success: true, data: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 4. Update Login Time (NextAuth events-er jonno)
    router.patch("/update-login", async (req, res) => {
        try {
            const { email } = req.body;
            await passengerCollection.updateOne(
                { email },
                { $set: { lastLogin: new Date() } }
            );
            res.status(200).json({ success: true, message: "Login time updated" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 5. Update Status
    router.patch("/status/:id", async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            await passengerCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: status } }
            );
            res.status(200).json({ success: true, message: "Status updated" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 6. Update User Data
    router.put("/update/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { name, phone, role } = req.body;
            await passengerCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { name, phone, role } }
            );
            res.status(200).json({ success: true, message: "User updated" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 7. Delete User
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            await passengerCollection.deleteOne({ _id: new ObjectId(id) });
            res.status(200).json({ success: true, message: "User deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 8. Bulk Delete
    router.post("/bulk-delete", async (req, res) => {
        try {
            const { ids } = req.body;
            const objectIds = ids.map(id => new ObjectId(id));
            await passengerCollection.deleteMany({ _id: { $in: objectIds } });
            res.status(200).json({ success: true, message: "Users deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
