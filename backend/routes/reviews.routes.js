const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (reviewsCollection) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            const reviews = await reviewsCollection
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                data: reviews,
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

            await reviewsCollection.deleteOne({
                _id: new ObjectId(id),
            });

            res.json({
                success: true,
                message: "Review deleted",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    router.get("/driver/:driverId/rating", async (req, res) => {
        try {
            const { driverId } = req.params;

            const stats = await reviewsCollection
                .aggregate([
                    { $match: { driverId: driverId } },
                    {
                        $group: {
                            _id: "$driverId",
                            averageRating: { $avg: "$rating" },
                            totalReviews: { $sum: 1 },
                        },
                    },
                ])
                .toArray();

            if (stats.length === 0) {
                return res.json({
                    averageRating: 0,
                    totalReviews: 0,
                });
            }

            res.json(stats[0]);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    router.post("/", async (req, res) => {
        try {
            const { rideId, driverId, passengerId, rating, review } = req.body;

            if (!rideId || !driverId || !passengerId || !rating) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                });
            }

            const newReview = {
                rideId,
                driverId,
                passengerId,
                rating: Number(rating),
                review: review || "",
                createdAt: new Date(),
            };

            const result = await reviewsCollection.insertOne(newReview);

            res.status(201).json({
                success: true,
                message: "Review submitted successfully",
                data: result.insertedId,
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