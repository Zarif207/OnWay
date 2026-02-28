const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (ridesCollection) => {
    const router = express.Router();

    router.post("/", async (req, res) => {
        try {
            const rideData = {
                ...req.body,
                createdAt: new Date(),
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
                error: error.message,
            });
        }
    });

    router.get("/", async (req, res) => {
        try {
            const rides = await ridesCollection
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                data: rides,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;

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
                error: error.message,
            });
        }
    });

    router.get("/email/:email", async (req, res) => {
        try {
            const { email } = req.params;

            const rides = await ridesCollection
                .find({ email: email })
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                data: rides,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    router.get("/driver/:driverId", async (req, res) => {
        try {
            const { driverId } = req.params;

            const rides = await ridesCollection
                .find({ driverId: driverId })
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                data: rides,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    router.put("/:id", async (req, res) => {
        try {
            const { id } = req.params;

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
                error: error.message,
            });
        }
    });

    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;

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
                error: error.message,
            });
        }
    });

    return router;
};