const express = require("express");
const { ObjectId } = require("mongodb");
const socketStore = require("../utils/socketStore");

module.exports = (bookingsCollection) => {
    const router = express.Router();

    // GET /api/bookings - Get all bookings
    router.get("/", async (req, res) => {
        try {
            const { passengerId, status, recent } = req.query;
            let query = {};
            if (passengerId) {
                query.passengerId = passengerId;
            }
            if (status) {
                query.bookingStatus = status;
            }

            // FEATURE 1: Only show rides created within the last 60 seconds if 'recent' is true
            if (recent === "true") {
                const sixtySecondsAgo = new Date(Date.now() - 60000);
                query.createdAt = { $gte: sixtySecondsAgo };
            }

            const bookings = await bookingsCollection.find(query).sort({ createdAt: -1 }).toArray();

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

            const { findNearbyDrivers } = require("../utils/riderMatching");

            // PART 4 — Backend Ride Matching Flow
            const bookingData = {
                passengerId: passengerId ? new ObjectId(passengerId) : null,
                riderId: null,
                pickupLocation,
                dropoffLocation,
                routeGeometry,
                distance,
                duration,
                price,
                bookingStatus: "searching", // PART 4 Requirement
                otp: Math.floor(1000 + Math.random() * 9000).toString(),
                paymentMethod: "cash",
                paymentStatus: "pending",
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await bookingsCollection.insertOne(bookingData);
            const bookingId = result.insertedId;
            console.log(`✅ [PIPELINE] Passenger booking created: ${bookingId} for passenger ${passengerId || "Anonymous"}`);

            // 🔍 FAST IN-MEMORY MATCHING & DISPATCH
            try {
                console.log(`📡 [DISPATCH] Initiating search for pickup: [${pickupLocation.lat}, ${pickupLocation.lng}] (Radius: 5km)`);
                const nearbyDrivers = socketStore.findNearbyRiders(
                    pickupLocation.lat,
                    pickupLocation.lng,
                    5 // 5km radius
                );

                console.log(`📡 [DISPATCH] Fast-match found ${nearbyDrivers.length} connected riders within 5km`);

                if (nearbyDrivers.length > 0 && req.io) {
                    // Fetch passenger details
                    let passengerName = "Passenger";
                    try {
                        const passenger = await req.collections.passengerCollection.findOne({ _id: new ObjectId(passengerId) });
                        if (passenger && passenger.name) passengerName = passenger.name;
                    } catch (err) {
                        console.error("Error fetching passenger for dispatch:", err);
                    }

                    const ridePayload = {
                        bookingId: bookingId.toString(),
                        pickupLocation: pickupLocation.address || "Pickup Point",
                        dropLocation: dropoffLocation.address || "Drop-off Point",
                        pickupCoords: [pickupLocation.lat, pickupLocation.lng],
                        dropCoords: [dropoffLocation.lat, dropoffLocation.lng],
                        distance,
                        duration,
                        price, // Ensure price is included
                        fare: price,
                        passengerName,
                        createdAt: new Date()
                    };

                    nearbyDrivers.forEach(driver => {
                        const riderRoom = `rider:${driver._id}`;
                        req.io.to(riderRoom).emit("new-ride-request", ridePayload);
                        console.log(`🚀 [SOCKET] Dispatching to rider: ${driver._id} in room: ${riderRoom} (dist: ${driver.distance.toFixed(2)}km)`);
                    });
                } else {
                    console.log(`⚠️ [DISPATCH] No active connected riders found within 5km for booking ${bookingId}`);
                }
            } catch (dispatchError) {
                console.error("❌ Real-time Dispatch Error:", dispatchError);
            }

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
                        _id: bookingId,
                        ...bookingData,
                    });
                }
            } catch (notifError) {
                console.error("Notification error:", notifError);
            }

            // ⏱️ FEATURE 2: AUTO REMOVE AFTER 60 SECONDS
            setTimeout(async () => {
                try {
                    const currentBooking = await bookingsCollection.findOne({ _id: bookingId });

                    if (currentBooking && currentBooking.bookingStatus === "searching") {
                        console.log(`⏰ [EXPIRY] Ride ${bookingId} expired. No driver accepted within 60s.`);

                        await bookingsCollection.updateOne(
                            { _id: bookingId },
                            {
                                $set: {
                                    bookingStatus: "expired",
                                    updatedAt: new Date()
                                }
                            }
                        );

                        // Notify passenger via socket
                        if (req.io) {
                            const passengerRoom = `user:${passengerId}`;
                            req.io.to(passengerRoom).emit("ride-expired", {
                                bookingId: bookingId.toString(),
                                message: "No drivers accepted your ride"
                            });
                            console.log(`🚀 [SOCKET] Emitted ride-expired to ${passengerRoom}`);
                        }
                    }
                } catch (expiryError) {
                    console.error("❌ Expiry Logic Error:", expiryError);
                }
            }, 60000); // 60 seconds

            res.status(201).json({
                success: true,
                booking: {
                    _id: bookingId,
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

    // POST /api/bookings/fare-estimate
    router.post("/fare-estimate", async (req, res) => {
        try {
            const { distance, duration } = req.body;

            if (distance === undefined || duration === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Distance and duration are required"
                });
            }

            // Fare constants
            const rates = {
                bike: { base: 30, perKm: 12, perMin: 2 },
                car: { base: 50, perKm: 25, perMin: 3 },
                premium: { base: 100, perKm: 45, perMin: 5 }
            };

            const estimates = Object.keys(rates).map(type => {
                const rate = rates[type];
                const price = rate.base + (distance * rate.perKm) + (duration * rate.perMin);
                return {
                    type,
                    estimatedPrice: Math.round(price),
                    currency: "BDT"
                };
            });

            res.status(200).json({
                success: true,
                estimates
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
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

            // 🔄 RESET RIDER STATUS IF COMPLETED OR CANCELLED
            if (["completed", "cancelled"].includes(bookingStatus)) {
                try {
                    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });
                    if (booking && booking.riderId) {
                        const ridersCollection = req.collections.ridersCollection;
                        await ridersCollection.updateOne(
                            { _id: new ObjectId(booking.riderId) },
                            {
                                $set: {
                                    status: "online",
                                    currentRideId: null,
                                    updatedAt: new Date()
                                }
                            }
                        );
                        console.log(`✅ [STATUS] Rider ${booking.riderId} reset to online after ride ${bookingStatus}`);
                    }
                } catch (riderError) {
                    console.error("❌ Error resetting rider status in bookings.js:", riderError);
                }
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

    // PATCH /api/bookings/:id/status - Compatibility endpoint for dashboard
    router.patch("/:id/status", async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // status here refers to bookingStatus (arrived, picked_up, completed)

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid ID" });
            }

            const result = await bookingsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { bookingStatus: status, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            // 🔄 RESET RIDER STATUS IF COMPLETED OR CANCELLED
            if (["completed", "cancelled"].includes(status)) {
                try {
                    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });
                    if (booking && booking.riderId) {
                        const ridersCollection = req.collections.ridersCollection;
                        await ridersCollection.updateOne(
                            { _id: new ObjectId(booking.riderId) },
                            {
                                $set: {
                                    status: "online",
                                    currentRideId: null,
                                    updatedAt: new Date()
                                }
                            }
                        );
                        console.log(`✅ [STATUS] Rider ${booking.riderId} reset to online after ride ${status}`);
                    }
                } catch (riderError) {
                    console.error("❌ Error resetting rider status in bookings.js status endpoint:", riderError);
                }
            }

            res.json({ success: true, bookingStatus: status });
        } catch (error) {
            console.error("PATCH booking status error:", error);
            res.status(500).json({ success: false, message: "Server error" });
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
