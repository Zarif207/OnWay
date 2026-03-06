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
                return res.status(400).json({ 
                    success: false,
                    message: "Email is required" 
                });
            }

            const user = await passengerCollection.findOne({ email });

            // Return null if user not found (NextAuth expects this)
            if (!user) {
                return res.status(200).json(null);
            }

            // Return user data
            res.status(200).json(user);
        } catch (error) {
            console.error("Find user error:", error);
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

            // Validation
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
                role: role || "passenger",
                status: "Active",
                authProvider: authProvider || "credentials",
                createdAt: new Date(),
                lastLogin: new Date(),
            };

            // Hash password if provided (for credentials login)
            if (password) {
                newUser.password = await bcrypt.hash(password, 10);
            }

            // Insert user into database
            const result = await passengerCollection.insertOne(newUser);
            
            console.log(`✅ User created: ${email} (${authProvider || 'credentials'})`);

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
