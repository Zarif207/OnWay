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
            res.status(500).json({
                success: false,
                message: "Failed to fetch users"
            });
        }
    });

    // 2. Find User
    router.get("/find", async (req, res) => {
        try {
            const email = req.query.email;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required"
                });
            }

            const user = await passengerCollection.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to find user"
            });
        }
    });

    // 3. Register User
    router.post("/", async (req, res) => {
        try {
            const { name, email, phone, password, role, image, authProvider } = req.body;

            if (!email || !name) {
                return res.status(400).json({
                    success: false,
                    message: "Email and name are required",
                });
            }

            if (!password && !authProvider) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required",
                });
            }

            const existingUser = await passengerCollection.findOne({ email });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists",
                });
            }

            const newUser = {
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

            if (password) {
                newUser.password = await bcrypt.hash(password, 10);
            }

            const result = await passengerCollection.insertOne(newUser);

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    userId: result.insertedId,
                    email: newUser.email,
                    name: newUser.name
                }
            });

        } catch (error) {
            console.error("Register error:", error);
            res.status(500).json({
                success: false,
                message: "Registration failed"
            });
        }
    });

    // 4. Update User
    router.patch("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            delete updateData.password;
            delete updateData._id;

            const result = await passengerCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...updateData, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                message: "User updated successfully"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update user"
            });
        }
    });

    return router;
};