const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (promoCollection, newsletterCollection, transporter) => {
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

            // 1. Validation
            if (!code || !discountType || !discountValue || !expiryDate) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                });
            }

            // 2. Check if exists
            const existing = await promoCollection.findOne({
                code: code.toUpperCase(),
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Promo code already exists",
                });
            }

            // 3. Create Promo Object
            const newPromo = {
                code: code.toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                maxDiscount: maxDiscount ? Number(maxDiscount) : null,
                minRideAmount: minRideAmount ? Number(minRideAmount) : 0,
                expiryDate: new Date(expiryDate),
                usageLimit: usageLimit ? Number(usageLimit) : 100,
                usedCount: 0,
                active: new Date(expiryDate) > new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // 4. Insert into Database
            const result = await promoCollection.insertOne(newPromo);

            if (result.insertedId) {
                const subscribers = await newsletterCollection.find({ status: "active" }).toArray();
                const emailList = subscribers.map(sub => sub.email);

                if (emailList.length > 0) {
                    const mailOptions = {
                        from: `"OnWay Offers" <${process.env.EMAIL_USER}>`,
                        bcc: emailList,
                        subject: `🎁 New Promo Code: ${code.toUpperCase()}`,
                        html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                            <h2 style="color: #22c55e;">Exclusive Offer for You!</h2>
                            <p>Hi there,</p>
                            <p>We have a new discount for your next ride. Use the code below:</p>
                            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                                ${code.toUpperCase()}
                            </div>
                            <p><b>Discount:</b> ${discountValue}${discountType === 'percentage' ? '%' : ' TK'}</p>
                            <p><b>Expires on:</b> ${new Date(expiryDate).toLocaleDateString()}</p>
                            <br>
                            <p>Safe travels,<br>The OnWay Team</p>
                        </div>
                    `
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) console.error("❌ Notification Email Failed:", err);
                        else console.log("✅ Promo Notification Sent");
                    });
                }
            }

            res.status(201).json({
                success: true,
                message: "Promo created successfully and subscribers notified!",
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
            const now = new Date();

            await promoCollection.updateMany(
                {
                    active: true,
                    expiryDate: { $lt: now }
                },
                {
                    $set: { active: false, updatedAt: now }
                }
            );

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
                    message: "Invalid or inactive promo code",
                });
            }

            if (new Date() > new Date(promo.expiryDate)) {

                await promoCollection.updateOne(
                    { _id: promo._id },
                    { $set: { active: false, updatedAt: new Date() } }
                );
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

    // 4. UPDATE PROMO
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

    // 5. DELETE PROMO
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

    // 6. TOGGLE STATUS
    router.patch("/:id/toggle", async (req, res) => {
        try {
            const promo = await promoCollection.findOne({
                _id: new ObjectId(req.params.id),
            });

            if (!promo) {
                return res.status(404).json({ success: false, message: "Promo not found" });
            }

            if (!promo.active && new Date(promo.expiryDate) < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot activate an expired promo. Please update expiry date first."
                });
            }

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