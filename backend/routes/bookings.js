const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (bookingsCollection) => {
    const router = express.Router();

    // POST /api/bookings
    router.post("/", async (req, res) => {
        try {
            const {
                pickupLocation,
                dropoffLocation,
                routeGeometry,
                distance,
                duration,
                price,
                passengerId,
                bookingStatus
            } = req.body;

            // Validation
            if (!pickupLocation || !dropoffLocation || !routeGeometry || distance === undefined || duration === undefined || price === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields are missing: pickupLocation, dropoffLocation, routeGeometry, distance, duration, and price are required."
                });
            }

            const bookingData = {
                pickupLocation,
                dropoffLocation,
                routeGeometry,
                distance,
                duration,
                price,
                passengerId: passengerId || null,
                bookingStatus: bookingStatus || "pending",
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await bookingsCollection.insertOne(bookingData);

            res.status(201).json({
                success: true,
                booking: {
                    _id: result.insertedId,
                    ...bookingData
                }
            });
        } catch (error) {
            console.error("Booking Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error while saving booking",
                error: error.message
            });
        }
    });

    // GET /api/bookings/:id
    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Booking ID"
                });
            }

            const booking = await bookingsCollection.findOne({
                _id: new ObjectId(id)
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            res.json({
                success: true,
                booking
            });
        } catch (error) {
            console.error("Fetch Booking Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error while fetching booking",
                error: error.message
            });
        }
    });

    return router;
};
