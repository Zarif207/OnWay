const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

const newsletterRoutes = (newsletterCollection) => {

    // ১. ট্রান্সপোর্টার ফাংশনের ভেতরে রাখা ভালো যাতে লেটেস্ট ENV পায়
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // ২. সাবস্ক্রাইব রুট
    router.post("/subscribe", async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email address is required."
                });
            }

            const existing = await newsletterCollection.findOne({ email });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "You have already subscribed with this email!"
                });
            }

            const result = await newsletterCollection.insertOne({
                email,
                subscribedAt: new Date(),
                status: "active"
            });

            // ৩. ইমেইল পাঠানোর লজিক
            const mailOptions = {
                from: `"OnWay Official" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Welcome to OnWay Newsletter! 🚀",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                        <h2 style="color: #22c55e; text-align: center;">Welcome to OnWay!</h2>
                        <p>Hi there,</p>
                        <p>Thank you for subscribing to our newsletter. We are thrilled to have you with us!</p>
                        <p>From now on, you'll be the first to know about our <b>exclusive offers, new ride features, and mobility updates.</b></p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || '#'}" style="background-color: #22c55e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;">Visit Our Website</a>
                        </div>
                        <p>Safe travels,<br>The OnWay Team</p>
                        <hr style="border: none; border-top: 1px solid #eee;" />
                        <p style="font-size: 11px; color: #888; text-align: center;">If you didn't sign up for this, you can safely ignore this email.</p>
                    </div>
                `
            };

            // ইমেইল পাঠানোর চেষ্টা
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("❌ Email Sending Failed:", error);
                    // এখানে রেসপন্স পাঠানোর দরকার নেই কারণ সাবস্ক্রিপশন অলরেডি সাকসেসফুল
                } else {
                    console.log("✅ Welcome Email Sent: " + info.response);
                }
            });

            res.status(201).json({
                success: true,
                message: "Successfully subscribed! A welcome email has been sent.",
                data: result
            });

        } catch (error) {
            console.error("Newsletter Subscription Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error. Please try again later."
            });
        }
    });

    router.get("/subscribers", async (req, res) => {
        try {
            const result = await newsletterCollection.find().toArray();
            res.status(200).send(result);
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to fetch subscribers." });
        }
    });

    return router;
};

module.exports = newsletterRoutes;