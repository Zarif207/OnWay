const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

module.exports = function (ridersCollection) {
  const router = express.Router();

  // 🔹 Create Rider (Register)
  router.post("/", async (req, res) => {
    try {
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
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      const existing = await ridersCollection.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Rider already exists" });
      }

      // Requirement: The payload doesn't have a password, so we hash a default one.
      const defaultPassword = "onway_rider_pass";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

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

      res.status(201).json({
        message: "Rider created successfully",
        riderId: result.insertedId,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // 🔹 Get All Riders
  router.get("/", async (req, res) => {
    try {
      const riders = await ridersCollection.find().toArray();
      res.json(riders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // 🔹 Get Single Rider
  router.get("/:id", async (req, res) => {
    try {
      const rider = await ridersCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!rider) {
        return res.status(404).json({ message: "Rider not found" });
      }

      res.json(rider);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // 🔹 Update Rider (Online / Approval)
  router.patch("/:id", async (req, res) => {
    try {
      const updateData = req.body;

      const result = await ridersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );

      res.json({ message: "Rider updated", result });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // 🔹 Delete Rider
  router.delete("/:id", async (req, res) => {
    try {
      await ridersCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      res.json({ message: "Rider deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};