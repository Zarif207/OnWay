const express = require("express");

module.exports = (gpsLocationsCollection) => {
    const router = express.Router();

    router.post("/update", async (req, res) => {
        const { driverId, rideId, latitude, longitude } = req.body;

        if (!driverId || !rideId || !latitude || !longitude) {
            return res.status(400).json({
                message: "Required fields missing",
            });
        }

        const payload = {
            driverId,
            rideId,
            latitude,
            longitude,
            timestamp: new Date(),
        };

        await gpsLocationsCollection.insertOne(payload);

        res.json({ success: true, data: payload });
    });

    router.get("/active-location/:rideId", async (req, res) => {
        const { rideId } = req.params;

        const location = await gpsLocationsCollection.findOne(
            { rideId },
            { sort: { timestamp: -1 } }
        );

        if (!location) {
            return res.status(404).json({
                message: "No active location found",
            });
        }

        res.json({ success: true, data: location });
    });

    return router;
};