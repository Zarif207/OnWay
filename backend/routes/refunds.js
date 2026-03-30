const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

module.exports = (collections) => {
  const { refundsCollection, bookingsCollection, passengerCollection } = collections;

  // GET /api/refunds — all refunds (support agent)
  router.get("/", async (req, res) => {
    try {
      const { status } = req.query;
      const query = status ? { status } : {};
      const refunds = await refundsCollection.find(query).sort({ createdAt: -1 }).toArray();
      res.json({ success: true, data: refunds });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/refunds/passenger/:passengerId — passenger's own refunds
  router.get("/passenger/:passengerId", async (req, res) => {
    try {
      const { passengerId } = req.params;
      if (!ObjectId.isValid(passengerId))
        return res.status(400).json({ success: false, message: "Invalid passengerId" });
      const refunds = await refundsCollection
        .find({ passengerId: new ObjectId(passengerId) })
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, data: refunds });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/refunds — passenger submits refund request
  router.post("/", async (req, res) => {
    try {
      const { passengerId, bookingId, cause, description, amount } = req.body;
      if (!passengerId || !cause)
        return res.status(400).json({ success: false, message: "passengerId and cause are required" });

      // Get passenger name
      let passengerName = "Passenger";
      try {
        const p = await passengerCollection.findOne({ _id: new ObjectId(passengerId) });
        if (p?.name) passengerName = p.name;
      } catch (_) {}

      // Get booking amount if bookingId provided
      let refundAmount = amount || 0;
      let bookingInfo = null;
      if (bookingId && ObjectId.isValid(bookingId)) {
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        if (booking) {
          refundAmount = refundAmount || booking.price || 0;
          bookingInfo = {
            pickup: booking.pickupLocation?.address || "N/A",
            dropoff: booking.dropoffLocation?.address || "N/A",
            rideType: booking.rideType || booking.vehicleType || "standard",
            date: booking.createdAt,
          };
        }
      }

      const refund = {
        passengerId: new ObjectId(passengerId),
        passengerName,
        bookingId: bookingId && ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : null,
        bookingInfo,
        cause,
        description: description || "",
        amount: refundAmount,
        status: "pending",
        agentNote: "",
      };

      const result = await refundsCollection.insertOne({ ...refund, createdAt: new Date(), updatedAt: new Date() });
      res.status(201).json({ success: true, data: { _id: result.insertedId, ...refund } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // PATCH /api/refunds/:id — support agent approve/reject
  router.patch("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, agentNote } = req.body;
      if (!["approved", "rejected"].includes(status))
        return res.status(400).json({ success: false, message: "status must be approved or rejected" });
      if (!ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid id" });

      await refundsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, agentNote: agentNote || "", updatedAt: new Date() } }
      );
      res.json({ success: true, message: `Refund ${status}` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};
