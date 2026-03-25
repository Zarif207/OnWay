const express = require("express");

module.exports = (gpsLocationsCollection) => {
    const router = express.Router();

    // POST /api/location/update
    router.post("/update", async (req, res) => {
        try {
            const { driverId, rideId, latitude, longitude } = req.body;

            if (!driverId || !rideId || latitude === undefined || longitude === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "driverId, rideId, latitude, and longitude are required",
                });
            }

            const payload = {
                driverId,
                rideId,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                timestamp: new Date(),
            };

            await gpsLocationsCollection.insertOne(payload);
            res.json({ success: true, data: payload });
        } catch (err) {
            console.error("POST /location/update error:", err);
            res.status(500).json({ success: false, message: "Failed to update location" });
        }
    });

    // GET /api/location/active-location/:rideId
    router.get("/active-location/:rideId", async (req, res) => {
        try {
            const { rideId } = req.params;

            if (!rideId) {
                return res.status(400).json({ success: false, message: "rideId is required" });
            }

            const location = await gpsLocationsCollection.findOne(
                { rideId },
                { sort: { timestamp: -1 } }
            );

            if (!location) {
                return res.status(404).json({ success: false, message: "No active location found" });
            }

            res.json({ success: true, data: location });
        } catch (err) {
            console.error("GET /location/active-location error:", err);
            res.status(500).json({ success: false, message: "Failed to fetch location" });
        }
    });

    // GET /api/location/history/:rideId
    router.get("/history/:rideId", async (req, res) => {
        try {
            const { rideId } = req.params;
            const history = await gpsLocationsCollection
                .find({ rideId })
                .sort({ timestamp: 1 })
                .toArray();
            res.json({ success: true, data: history, count: history.length });
        } catch (err) {
            console.error("GET /location/history error:", err);
            res.status(500).json({ success: false, message: "Failed to fetch location history" });
        }
    });

    return router;
};
