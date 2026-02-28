const express = require("express");
const { ObjectId } = require("mongodb");

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

            res.status(201).json({
                success: true,
                message: "Ride created successfully",
                data: result.insertedId,
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

    // GET SINGLE RIDE
    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Ride ID",
                });
            }

            const ride = await ridesCollection.findOne({
                _id: new ObjectId(id),
            });

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    message: "Ride not found",
                });
            }

            res.json({
                success: true,
                data: ride,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch ride",
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