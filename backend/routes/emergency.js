const express = require("express");
const router = express.Router();

module.exports = function (emergencyCollection) {
  // SOS Alert - Create emergency alert
  router.post("/sos", async (req, res) => {
    try {
      const { timestamp, location, userAgent, userId, rideId, userName, userPhone } = req.body;

      const emergencyAlert = {
        timestamp: timestamp || new Date().toISOString(),
        location: location || null,
        userAgent: userAgent || null,
        userId: userId || null,
        rideId: rideId || null,
        userName: userName || "Unknown",
        userPhone: userPhone || null,
        status: "active",
        resolvedAt: null,
        resolvedBy: null,
        notes: [],
        createdAt: new Date(),
      };

      const result = await emergencyCollection.insertOne(emergencyAlert);

      // TODO: Send real-time notification to support agents via Socket.IO
      // io.to("support-agents").emit("emergency-alert", emergencyAlert);

      res.status(201).json({
        success: true,
        message: "Emergency alert created successfully",
        alertId: result.insertedId,
        data: emergencyAlert,
      });
    } catch (error) {
      console.error("SOS Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create emergency alert",
        error: error.message,
      });
    }
  });

  // Get all emergency alerts (for support agents)
  router.get("/alerts", async (req, res) => {
    try {
      const { status } = req.query;
      
      const query = status ? { status } : {};
      const alerts = await emergencyCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      res.json({
        success: true,
        count: alerts.length,
        alerts,
      });
    } catch (error) {
      console.error("Get alerts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch alerts",
      });
    }
  });

  // Get single emergency alert
  router.get("/alerts/:id", async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const alert = await emergencyCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: "Alert not found",
        });
      }

      res.json({
        success: true,
        alert,
      });
    } catch (error) {
      console.error("Get alert error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch alert",
      });
    }
  });

  // Update emergency alert status
  router.patch("/alerts/:id", async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const { status, resolvedBy, note } = req.body;

      const updateData = {
        status,
        updatedAt: new Date(),
      };

      if (status === "resolved") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = resolvedBy;
      }

      if (note) {
        updateData.$push = {
          notes: {
            text: note,
            addedBy: resolvedBy,
            addedAt: new Date(),
          },
        };
      }

      const result = await emergencyCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Alert not found",
        });
      }

      res.json({
        success: true,
        message: "Alert updated successfully",
      });
    } catch (error) {
      console.error("Update alert error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update alert",
      });
    }
  });

  // Add note to emergency alert
  router.post("/alerts/:id/notes", async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const { note, addedBy } = req.body;

      const result = await emergencyCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $push: {
            notes: {
              text: note,
              addedBy: addedBy,
              addedAt: new Date(),
            },
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Alert not found",
        });
      }

      res.json({
        success: true,
        message: "Note added successfully",
      });
    } catch (error) {
      console.error("Add note error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add note",
      });
    }
  });

  return router;
};
