const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (promoCollection) => {
    const router = express.Router();

    router.post("/", async (req, res) => {
        try {
            const {
                code,
                discountType,
                discountValue,
                maxDiscount,
                minRideAmount,
                expiryDate,
                usageLimit,
            } = req.body;

            if (!code || !discountType || !discountValue || !expiryDate) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                });
            }

            const existing = await promoCollection.findOne({
                code: code.toUpperCase(),
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Promo code already exists",
                });
            }

            const newPromo = {
                code: code.toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                maxDiscount: maxDiscount ? Number(maxDiscount) : null,
                minRideAmount: minRideAmount ? Number(minRideAmount) : 0,
                expiryDate: new Date(expiryDate),
                usageLimit: usageLimit ? Number(usageLimit) : 100,
                usedCount: 0,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await promoCollection.insertOne(newPromo);

            res.status(201).json({
                success: true,
                message: "Promo created successfully",
                data: result.insertedId,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create promo",
                error: error.message,
            });
        }
    });

    router.get("/", async (req, res) => {
        try {
            const promos = await promoCollection
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            res.json({
                success: true,
                count: promos.length,
                data: promos,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });


    router.post("/apply", async (req, res) => {
        try {
            const { code, rideAmount } = req.body;

            if (!code || !rideAmount) {
                return res.status(400).json({
                    success: false,
                    message: "Code and ride amount required",
                });
            }

            const promo = await promoCollection.findOne({
                code: code.toUpperCase(),
                active: true,
            });

            if (!promo) {
                return res.status(404).json({
                    success: false,
                    message: "Invalid promo code",
                });
            }

            if (new Date() > new Date(promo.expiryDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Promo expired",
                });
            }

            if (rideAmount < promo.minRideAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum ride amount ${promo.minRideAmount} required`,
                });
            }

            if (promo.usedCount >= promo.usageLimit) {
                return res.status(400).json({
                    success: false,
                    message: "Usage limit reached",
                });
            }

            let discount = 0;

            if (promo.discountType === "percentage") {
                discount = (rideAmount * promo.discountValue) / 100;
                if (promo.maxDiscount) {
                    discount = Math.min(discount, promo.maxDiscount);
                }
            } else {
                discount = promo.discountValue;
            }

            const finalAmount = rideAmount - discount;

            res.json({
                success: true,
                discount,
                finalAmount,
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

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ID",
                });
            }

            const updateData = {
                $set: {
                    ...req.body,
                    updatedAt: new Date(),
                },
            };

            await promoCollection.updateOne(
                { _id: new ObjectId(id) },
                updateData
            );

            res.json({
                success: true,
                message: "Promo updated successfully",
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
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ID",
                });
            }

            await promoCollection.deleteOne({
                _id: new ObjectId(req.params.id),
            });

            res.json({
                success: true,
                message: "Promo deleted",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });


    router.patch("/:id/toggle", async (req, res) => {
        try {
            const promo = await promoCollection.findOne({
                _id: new ObjectId(req.params.id),
            });

            await promoCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { active: !promo.active, updatedAt: new Date() } }
            );

            res.json({
                success: true,
                message: "Promo status updated",
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