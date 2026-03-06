const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

module.exports = function (ridersCollection) {
  const router = express.Router();

  // 🔹 Create Rider (Register)
  router.post("/", async (req, res) => {
    try {
      console.log("📝 Rider registration request received:", {
        body: req.body,
        method: req.method
      });

      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        gender,
        dateOfBirth,
        identity,
        licenseNumber,
        vehicle,
        operationCities,
        image
      } = req.body;

      if (!firstName || !email || !phone) {
        console.log("❌ Validation failed: Missing required fields");
        return res.status(400).json({ 
          success: false,
          message: "First name, email, and phone are required" 
        });
      }

      const existing = await ridersCollection.findOne({ email });
      if (existing) {
        console.log("❌ Rider already exists:", email);
        return res.status(400).json({ 
          success: false,
          message: "Rider already exists with this email" 
        });
      }

      // The payload doesn't have a password, so we hash a default one.
      const defaultPassword = "onway_rider_pass";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const rider = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        password: hashedPassword,
        address: address || {},
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        identity: identity || {},
        licenseNumber: licenseNumber || null,
        vehicle: vehicle || {},
        operationCities: operationCities || [],
        image: image || null,
        role: "rider",
        isOnline: false,
        isApproved: false,
        createdAt: new Date(),
      };

      const result = await ridersCollection.insertOne(rider);
      console.log("✅ Rider created successfully:", result.insertedId);

      res.status(201).json({
        success: true,
        message: "Rider registered successfully",
        data: {
          riderId: result.insertedId,
          email: rider.email,
          name: rider.name
        }
      });
    } catch (error) {
      console.error("❌ Rider registration error:", error);
      res.status(500).json({ 
        success: false,
        message: "Rider registration failed",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // 🔹 Get All Riders
  router.get("/", async (req, res) => {
    try {
      const riders = await ridersCollection.find().toArray();
      res.json({ 
        success: true, 
        data: riders 
      });
    } catch (error) {
      console.error("Get riders error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch riders",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // 🔹 Get Single Rider
  router.get("/:id", async (req, res) => {
    try {
      const rider = await ridersCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!rider) {
        return res.status(404).json({ 
          success: false,
          message: "Rider not found" 
        });
      }

      res.json({ 
        success: true, 
        data: rider 
      });
    } catch (error) {
      console.error("Get rider error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch rider",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // 🔹 Update Rider (Online / Approval)
  router.patch("/:id", async (req, res) => {
    try {
      const updateData = req.body;
      
      // Remove sensitive fields
      delete updateData.password;
      delete updateData._id;

      const result = await ridersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Rider not found"
        });
      }

      res.json({ 
        success: true,
        message: "Rider updated successfully" 
      });
    } catch (error) {
      console.error("Update rider error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to update rider",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // 🔹 Delete Rider
  router.delete("/:id", async (req, res) => {
    try {
      const result = await ridersCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Rider not found"
        });
      }

      res.json({ 
        success: true,
        message: "Rider deleted successfully" 
      });
    } catch (error) {
      console.error("Delete rider error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to delete rider",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
};