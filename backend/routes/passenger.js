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
            console.error("Get users error:", error);
            res.status(500).json({ 
                success: false, 
                message: "Failed to fetch users",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            console.error("Find user error:", error);
            res.status(500).json({ 
                success: false,
                message: "Failed to find user",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Create User (Register)
    router.post("/", async (req, res) => {
        try {
            console.log("📝 Register request received:", {
                body: req.body,
                headers: req.headers,
                method: req.method
            });

            const { name, email, phone, password, role, image, authProvider } = req.body;

            // Validation
            if (!email || !name) {
                console.log("❌ Validation failed: Missing email or name");
                return res.status(400).json({
                    success: false,
                    message: "Email and name are required",
                });
            }

            if (!password && !authProvider) {
                console.log("❌ Validation failed: Missing password or authProvider");
                return res.status(400).json({
                    success: false,
                    message: "Password is required for credential-based registration",
                });
            }

            // Check existing user
            const existingUser = await passengerCollection.findOne({ email });

            if (existingUser) {
                console.log("❌ User already exists:", email);
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email",
                });
            }

            // Create new user object
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
            if (password) newUser.password = await bcrypt.hash(password, 10);
            const result = await passengerCollection.insertOne(newUser);
            res.status(201).json({ success: true, data: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

            // Hash password if provided
            if (password) {
                const salt = await bcrypt.genSalt(10);
                newUser.password = await bcrypt.hash(password, salt);
                console.log("✅ Password hashed successfully");
            }

            // Insert user
            const result = await passengerCollection.insertOne(newUser);
            console.log("✅ User created successfully:", result.insertedId);

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
            console.error("❌ Register error:", error);
            res.status(500).json({ 
                success: false,
                message: "Registration failed",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Update User
    router.patch("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Remove sensitive fields from update
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
            console.error("Update user error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update user",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
};
