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

    // 2. Find User by Email
    router.get("/find", async (req, res) => {
        try {
            const email = req.query.email;

            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const user = await passengerCollection.findOne({ email });

            // Return null if user not found (NextAuth expects this)
            if (!user) {
                return res.status(200).json(null);
            }

            // Return user data
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // 3. Create User (Registration & OAuth Sync)
    router.post("/", async (req, res) => {
        try {
            const { name, email, phone, password, role, image, authProvider } = req.body;

            if (!email || !name) {
                return res.status(400).json({
                    success: false,
                    message: "Email and name are required"
                });
            }

            if (!password && !authProvider) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required for credential-based registration"
                });
            }

            // Check if user already exists
            const existingUser = await passengerCollection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email"
                });
            }

            // Create new user object
            const newUser = {
                name,
                email,
                phone: phone || "",
                image: image || "",
                role: "passenger", // Always force passenger role for this route
                status: "Active",
                authProvider: authProvider || "credentials",
                address: "",
                language: "English",
                notifications: true,
                rating: 5.0,
                currentRideId: null,
                savedLocations: [],
                walletBalance: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLogin: new Date(),
            };

            // Hash password if provided (for credentials login)
            if (password) {
                newUser.password = await bcrypt.hash(password, 10);
            }

            // Insert user into database
            const result = await passengerCollection.insertOne(newUser);

            console.log(`✅ User created: ${email} (${authProvider || 'credentials'})`);

            // 🔔 Send notification to admins (only for new passenger registrations, not OAuth sync)
            if (!authProvider || authProvider === "credentials") {
                try {
                    const notificationHelper = require("../utils/notificationHelper");
                    await notificationHelper.notifyUserRegistration(req.collections, {
                        _id: result.insertedId,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                    });
                } catch (notifError) {
                    console.error("Notification error:", notifError);
                    // Don't fail the registration if notification fails
                }
            }

            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: {
                    userId: result.insertedId,
                    email: newUser.email,
                    role: newUser.role
                }
            });

        } catch (error) {
            console.error("Create user error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create user",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
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

    // 6. Update User Data by ID
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

    // 6.1 Update User Data by Email
    router.patch("/update", async (req, res) => {
        try {
            const { email, name, phone } = req.body;

            if (!email) {
                return res.status(400).json({ success: false, message: "Email is required" });
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;

            const result = await passengerCollection.updateOne(
                { email },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            res.status(200).json({ success: true, message: "Profile updated successfully" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
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

    // 9. Get User by ID (for profile)
    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID"
                });
            }

            const user = await passengerCollection.findOne({ _id: new ObjectId(id) });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Remove password from response
            delete user.password;

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error("Get user by ID error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch user",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // 10. Update Profile
    router.patch("/profile/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { name, phone, image } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID"
                });
            }

            const updateData = {
                updatedAt: new Date()
            };

            if (name) updateData.name = name;
            if (phone !== undefined) updateData.phone = phone;
            if (image !== undefined) updateData.image = image;

            const result = await passengerCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Profile updated successfully"
            });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update profile",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // 11. Change Password
    router.patch("/change-password/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID"
                });
            }

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Current password and new password are required"
                });
            }

            // Get user
            const user = await passengerCollection.findOne({ _id: new ObjectId(id) });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Check if user has password (OAuth users don't)
            if (!user.password) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot change password for OAuth users"
                });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect"
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await passengerCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { password: hashedPassword, updatedAt: new Date() } }
            );

            res.status(200).json({
                success: true,
                message: "Password changed successfully"
            });
        } catch (error) {
            console.error("Change password error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to change password",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
};