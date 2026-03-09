const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (bookingsCollection) => {
    const router = express.Router();

    // GET /api/bookings - Get all bookings
    router.get("/", async (req, res) => {
        try {
            const bookings = await bookingsCollection.find({}).toArray();
            
            res.status(200).json({
                success: true,
                data: bookings,
                count: bookings.length
            });
        } catch (error) {
            console.error("Fetch Bookings Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error while fetching bookings",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

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

            // 🔔 Send notification to admins about new booking
            try {
                const notificationHelper = require("../utils/notificationHelper");
                
                // Get all collections from request
                const collections = {
                    notificationsCollection: req.collections?.notificationsCollection,
                    passengerCollection: req.collections?.passengerCollection,
                };

                if (collections.notificationsCollection && collections.passengerCollection) {
                    await notificationHelper.notifyBookingCreated(collections, {
                        _id: result.insertedId,
                        ...bookingData,
                    });
                }
            } catch (notifError) {
                console.error("Notification error:", notifError);
                // Don't fail the booking if notification fails
            }

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

    // PATCH /api/bookings/:id - Update booking status
    router.patch("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { bookingStatus } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Booking ID"
                });
            }

            const result = await bookingsCollection.updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        bookingStatus,
                        updatedAt: new Date()
                    } 
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            res.json({
                success: true,
                message: "Booking status updated successfully"
            });
        } catch (error) {
            console.error("Update Booking Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error while updating booking",
                error: error.message
            });
        }
    });

    // DELETE /api/bookings/:id - Delete booking
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Booking ID"
                });
            }

            const result = await bookingsCollection.deleteOne({
                _id: new ObjectId(id)
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            res.json({
                success: true,
                message: "Booking deleted successfully"
            });
        } catch (error) {
            console.error("Delete Booking Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error while deleting booking",
                error: error.message
            });
        }
    });

    // POST /api/bookings/bulk-delete - Bulk delete bookings
    router.post("/bulk-delete", async (req, res) => {
        try {
            const { ids } = req.body;

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or empty IDs array"
                });
            }

            const objectIds = ids.map(id => new ObjectId(id));
            const result = await bookingsCollection.deleteMany({
                _id: { $in: objectIds }
            });

            res.json({
                success: true,
                message: `${result.deletedCount} bookings deleted successfully`,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error("Bulk Delete Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error while bulk deleting bookings",
                error: error.message
            });
        }
    });

    return router;
};
