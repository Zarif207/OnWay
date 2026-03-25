const express = require("express");
const { ObjectId } = require("mongodb");

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:4001";

module.exports = (ridesCollection) => {
    const router = express.Router();

    // CREATE RIDE
    router.post("/", async (req, res) => {
        try {
            const rideData = {
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: req.body.status || "pending",
            };

            const result = await ridesCollection.insertOne(rideData);
            const insertedRide = { _id: result.insertedId, ...rideData };

            // Broadcast to drivers via socket server
            fetch(`${SOCKET_URL}/api/emit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: "new_ride_request", room: "drivers", payload: insertedRide }),
            }).catch(() => {});

            res.status(201).json({
                success: true,
                message: "Ride created successfully",
                data: insertedRide,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create ride",
                error: error.message,
            });
        }
    });

    // GET RIDES BY DRIVER
    router.get("/driver/:driverId", async (req, res) => {
        try {
            const { driverId } = req.params;
            const { status } = req.query;

            let query = { driverId };

            if (status) {
                query.status = status;
            }

            const rides = await ridesCollection
                .find(query)
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                count: rides.length,
                data: rides,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch driver rides",
                error: error.message,
            });
        }
    });

    // GET RIDES BY EMAIL
    router.get("/email/:email", async (req, res) => {
        try {
            const { email } = req.params;

            const rides = await ridesCollection
                .find({ email })
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                count: rides.length,
                data: rides,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch user rides",
                error: error.message,
            });
        }
    });

    // GET ALL RIDES
    router.get("/", async (req, res) => {
        try {
            const rides = await ridesCollection
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                count: rides.length,
                data: rides,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch rides",
                error: error.message,
            });
        }
    });

    // GET SINGLE RIDE (FEATURE UPDATE: Checks both rides and bookings collections)
    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Ride ID format",
                });
            }

            const objectId = new ObjectId(id);

            // 1. Check in rides collection (legacy/archive)
            let ride = await ridesCollection.findOne({ _id: objectId });

            // 2. If not found, check in bookings collection (active rides)
            if (!ride && req.collections?.bookingsCollection) {
                ride = await req.collections.bookingsCollection.findOne({ _id: objectId });
            }

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    message: "Ride not found in archives or active bookings",
                });
            }

            // Ensure consistent response format for frontend
            res.json({
                success: true,
                ride: {
                    ...ride,
                    // Map common fields if mismatched
                    status: ride.status || ride.bookingStatus,
                    fare: ride.fare || ride.price
                }
            });
        } catch (error) {
            console.error("Fetch Single Ride Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch ride details",
                error: error.message,
            });
        }
    });

    // UPDATE RIDE
    router.put("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Ride ID",
                });
            }

            const updateData = {
                $set: {
                    ...req.body,
                    updatedAt: new Date(),
                },
            };

            const result = await ridesCollection.updateOne(
                { _id: new ObjectId(id) },
                updateData
            );

            res.json({
                success: true,
                message: "Ride updated successfully",
                modifiedCount: result.modifiedCount,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update ride",
                error: error.message,
            });
        }
    });

    // DELETE RIDE
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Ride ID",
                });
            }

            const result = await ridesCollection.deleteOne({
                _id: new ObjectId(id),
            });

            res.json({
                success: true,
                message: "Ride deleted successfully",
                deletedCount: result.deletedCount,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete ride",
                error: error.message,
            });
        }
    });

    return router;
};