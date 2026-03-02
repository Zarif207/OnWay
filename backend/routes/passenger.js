const express = require("express");
const bcrypt = require("bcryptjs");

module.exports = (passengerCollection) => {
    const router = express.Router();

    // Get Users
    router.get("/", async (req, res) => {
        const users = await passengerCollection.find({}).toArray();
        res.json({ success: true, data: users });
    });

    // Find User
    router.get("/find", async (req, res) => {
        const email = req.query.email;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await passengerCollection.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    });

    // Create User
    router.post("/", async (req, res) => {
        try {
            const { name, email, phone, password, role, image, authProvider } =
                req.body;

            if (!email || !name || (!password && !authProvider)) {
                return res.status(400).json({
                    message: "Missing required fields",
                });
            }

            const existingUser = await passengerCollection.findOne({ email });

            if (existingUser) {
                return res.status(400).json({
                    message: "User already exists",
                });
            }

            let newUser = {
                name,
                email,
                phone,
                image: image || "",
                role: role || "passenger",
                authProvider: authProvider || "credentials",
                createdAt: new Date(),
                latLogsin: new Date(),
            };

            if (password) {
                newUser.password = await bcrypt.hash(password, 10);
            }

            const result = await passengerCollection.insertOne(newUser);

            res.status(201).json({
                success: true,
                data: result.insertedId,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};