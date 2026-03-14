const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (lostItemsCollection) => {
  const router = express.Router();

  // @route   POST /api/lost-items
  // @desc    Report a lost item
  // @access  Public (or semi-public depending on auth)
  router.post("/", async (req, res) => {
    try {
      const { rideId, itemName, description, phone } = req.body;

      if (!rideId || !itemName || !description || !phone) {
        return res.status(400).json({
          success: false,
          message: "All fields are required (rideId, itemName, description, phone)"
        });
      }

      const newLostItem = {
        rideId,
        itemName,
        description,
        phone,
        status: "pending", // Default status
        createdAt: new Date()
      };

      const result = await lostItemsCollection.insertOne(newLostItem);

      return res.status(201).json({
        success: true,
        message: "Lost item reported successfully",
        data: { _id: result.insertedId, ...newLostItem }
      });
    } catch (error) {
      console.error("Error reporting lost item:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // @route   GET /api/lost-items
  // @desc    Get all lost items for admin
  // @access  Admin
  router.get("/", async (req, res) => {
    try {
      const lostItems = await lostItemsCollection.find({}).sort({ createdAt: -1 }).toArray();

      res.status(200).json({
        success: true,
        data: lostItems
      });
    } catch (error) {
      console.error("Error fetching lost items:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // @route   PATCH /api/lost-items/:id/status
  // @desc    Update lost item status
  // @access  Admin
  router.patch("/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // e.g., 'found', 'closed', 'contacted'

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
      }

      const result = await lostItemsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Lost item not found" });
      }

      res.status(200).json({
        success: true,
        message: `Status updated to ${status}`
      });
    } catch (error) {
      console.error("Error updating lost item status:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  return router;
};
