const express = require("express");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const newsletterRoute = (newsletterCollection) => {

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
                        <p>Safe travels,<br>The OnWay Team</p>
                    </div>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) console.error(" Welcome Email Failed:", error);
                else console.log(" Welcome Email Sent");
            });

            res.status(201).json({
                success: true,
                message: "Successfully subscribed!",
                data: result
            });

        } catch (error) {
            res.status(500).json({ success: false, message: "Internal server error." });
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

    router.delete("/delete/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const result = await newsletterCollection.deleteOne({ _id: new ObjectId(id) });
            res.status(200).json({ success: true, message: "Deleted successfully!" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Internal server error." });
        }
    });

    return router;
};

module.exports = { newsletterRoute, transporter };