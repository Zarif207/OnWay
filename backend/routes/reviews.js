const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (reviewsCollection) => {
    const router = express.Router();

    // GET ALL REVIEWS
    router.get("/", async (req, res) => {
        try {
            const reviews = await reviewsCollection
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                count: reviews.length,
                data: reviews,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch reviews",
                error: error.message,
            });
        }
    });

    // GET LAST 10 REVIEWS
    router.get("/latest", async (req, res) => {
        try {
            const reviews = await reviewsCollection
                .find({})
                .sort({ createdAt: -1 })
                .limit(10)
                .toArray();

            res.json({
                success: true,
                count: reviews.length,
                data: reviews,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch latest reviews",
                error: error.message,
            });
        }
    });

    // GET REVIEWS BY DRIVER
    router.get("/driver/:driverId", async (req, res) => {
        try {
            const { driverId } = req.params;

            const reviews = await reviewsCollection
                .find({ driverId })
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                count: reviews.length,
                data: reviews,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch driver reviews",
                error: error.message,
            });
        }
    });

    // GET DRIVER RATING STATS
    router.get("/driver/:driverId/rating", async (req, res) => {
        try {
            const { driverId } = req.params;

            const stats = await reviewsCollection
                .aggregate([
                    { $match: { driverId } },
                    {
                        $group: {
                            _id: "$driverId",
                            averageRating: { $avg: "$rating" },
                            totalReviews: { $sum: 1 },
                        },
                    },
                ])
                .toArray();

            if (!stats.length) {
                return res.json({
                    success: true,
                    averageRating: 0,
                    totalReviews: 0,
                });
            }

            res.json({
                success: true,
                averageRating: Number((stats[0].averageRating || 0).toFixed(1)),
                totalReviews: stats[0].totalReviews,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to calculate rating",
                error: error.message,
            });
        }
    });

    // CREATE REVIEW (UPDATED)
    router.post("/", async (req, res) => {
        try {
            const {
                rideId,
                driverId,
                passengerId,
                passengerName,
                passengerImage,
                rating,
                review,
            } = req.body;

            // Validation
            if (
                !rideId ||
                !driverId ||
                !passengerId ||
                !passengerName ||
                !passengerImage ||
                rating === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                });
            }

            const numericRating = Number(rating);

            if (numericRating < 1 || numericRating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5",
                });
            }

            const existingReview = await reviewsCollection.findOne({
                rideId,
                passengerId,
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: "You have already reviewed this ride.",
                });
            }

            const newReview = {
                rideId,
                driverId,
                passengerId,
                passengerName,
                passengerImage,
                rating: numericRating,
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
                message: "Failed to submit review",
                error: error.message,
            });
        }
    });

    // DELETE REVIEW
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Review ID format",
                });
            }

            const result = await reviewsCollection.deleteOne({
                _id: new ObjectId(id),
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Review not found in database",
                });
            }

            res.json({
                success: true,
                message: "Review deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error during deletion",
                error: error.message,
            });
        }
    });
    return router;
};