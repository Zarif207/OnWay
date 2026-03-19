const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (lostItemsCollection) => {
  const router = express.Router();

  // Helper: convert id to ObjectId safely
  const safeObjectId = (id) =>
    id && ObjectId.isValid(id) ? new ObjectId(id) : id || null;

  // ─────────────────────────────────────────────────────────
  // POST /api/lost-items  –  Passenger reports a lost item
  // ─────────────────────────────────────────────────────────
  router.post("/", async (req, res) => {
    try {
      const {
        rideId,
        passengerId,
        passengerName,   // sent from frontend session
        itemName,
        description,
        phone,
        itemImage,
      } = req.body;

      if (!itemName || !description || !phone) {
        return res.status(400).json({
          success: false,
          message: "itemName, description, and phone are required",
        });
      }

      const newLostItem = {
        rideId:          safeObjectId(rideId),
        passengerId:     safeObjectId(passengerId),
        passengerName:   passengerName || "Unknown Passenger",
        itemName,
        itemDescription: description,   // normalised field for the dashboard
        phone,
        itemImage:       itemImage || "",
        status:          "Pending",     // capital-P to match frontend status filters
        createdAt:       new Date(),
        updatedAt:       new Date(),
      };

      const result = await lostItemsCollection.insertOne(newLostItem);

      return res.status(201).json({
        success: true,
        message: "Lost item reported successfully",
        data: { _id: result.insertedId, ...newLostItem },
      });
    } catch (error) {
      console.error("Error reporting lost item:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ─────────────────────────────────────────────────────────
  // GET /api/lost-items  –  Admin / support: all lost items
  // ─────────────────────────────────────────────────────────
  router.get("/", async (req, res) => {
    try {
      const lostItems = await lostItemsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).json({ success: true, data: lostItems });
    } catch (error) {
      console.error("Error fetching lost items:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ─────────────────────────────────────────────────────────
  // PATCH /api/lost-items/:id  –  Update status
  //   body: { status: "Recovered" | "Not Found" | "Pending" }
  // ─────────────────────────────────────────────────────────
  router.patch("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = ["Pending", "Recovered", "Not Found"];
      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be one of: Pending, Recovered, Not Found",
        });
      }

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
      }

      const update = { status, updatedAt: new Date() };
      if (status !== "Pending") update.resolvedAt = new Date();

      const result = await lostItemsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Lost item not found" });
      }

      res.status(200).json({ success: true, message: `Status updated to "${status}"` });
    } catch (error) {
      console.error("Error updating lost item status:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  return router;
};
