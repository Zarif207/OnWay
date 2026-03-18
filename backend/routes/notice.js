const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (noticeCollection, passengerCollection, transporter) => {
    const router = express.Router();

    // 1. GET: All Notices
    router.get("/", async (req, res) => {
        try {
            const notices = await noticeCollection.find({}).sort({ createdAt: -1 }).toArray();
            res.json({ success: true, data: notices });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

    // 2. POST: Create Notice & Send Mail
    router.post("/", async (req, res) => {
        try {
            const { title, message } = req.body;
            if (!title || !message) {
                return res.status(400).json({ success: false, message: "Title and message are required" });
            }

            const newNotice = {
                title,
                message,
                createdAt: new Date(),
            };

            const result = await noticeCollection.insertOne(newNotice);

            // --- Mail Sending Logic ---
            if (result.insertedId) {
                const subscribers = await passengerCollection.find({ status: "Active" }).toArray();
                const emailList = subscribers.map(sub => sub.email);

                if (emailList.length > 0) {
                    const mailOptions = {
                        from: `"OnWay Team" <${process.env.EMAIL_USER}>`,
                        bcc: emailList,
                        subject: `Official Notice: ${title}`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                                <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Important Notice from OnWay</h2>
                                <h3>${title}</h3>
                                <p style="line-height: 1.6; color: #333;">${message}</p>
                                <hr />
                                <p style="font-size: 12px; color: #888;">This is an automated official announcement. Please do not reply to this email.</p>
                            </div>
                        `
                    };

                    transporter.sendMail(mailOptions, (err) => {
                        if (err) console.error("❌ Notice Email Failed:", err);
                        else console.log("✅ Notice Sent to Subscribers");
                    });
                }
            }

            res.status(201).json({ success: true, message: "Notice published and emails sent!", insertedId: result.insertedId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

    // 3. DELETE: Remove Notice
    router.delete("/:id", async (req, res) => {
        try {
            const result = await noticeCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.json({ success: true, message: "Notice deleted" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

    router.put("/:id", async (req, res) => {
        try {
            const { title, message } = req.body;
            const result = await noticeCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { title, message, updatedAt: new Date() } }
            );
            res.json({ success: true, message: "Notice updated" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

    return router;
};