const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (blogsCollection, newsletterCollection, transporter) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            const blogs = await blogsCollection.find({}).sort({ publishedAt: -1 }).toArray();
            res.json({
                success: true,
                count: blogs.length,
                data: blogs,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

    // 2. GET: Single Blog by ID
    router.get("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const blog = await blogsCollection.findOne(query);
            if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

            res.json({ success: true, data: blog });
        } catch (error) {
            res.status(500).json({ success: false, message: "Invalid ID format" });
        }
    });

    // 3. POST: Create New Blog (Admin)
    router.post("/", async (req, res) => {
        try {
            const newBlog = req.body;

            if (!newBlog.publishedAt) {
                newBlog.publishedAt = new Date().toISOString().split('T')[0];
            }

            const result = await blogsCollection.insertOne(newBlog);

            if (result.insertedId) {
                try {
                    const subscribers = await newsletterCollection.find({ status: "active" }).toArray();
                    const emailList = subscribers.map(sub => sub.email);

                    if (emailList.length > 0) {
                        const mailOptions = {
                            from: `"OnWay Official" <${process.env.EMAIL_USER}>`,
                            bcc: emailList,
                            subject: `New Blog Post: ${newBlog.title} 📝`,
                            html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                                <h2 style="color: #22c55e;">New Update from OnWay!</h2>
                                <p>Hi there,</p>
                                <p>We just published a new blog post: <b>"${newBlog.title}"</b>. Stay updated with our latest news and features.</p>
                                
                                <div style="text-align: center; margin: 25px 0;">
                                    <a href="${process.env.FRONTEND_URL}/blog/${result.insertedId}" 
                                       style="background-color: #22c55e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                       Read Full Blog
                                    </a>
                                </div>
                                
                                <p>Happy reading,<br>The OnWay Team</p>
                                <hr style="border: none; border-top: 1px solid #eee;" />
                                <p style="font-size: 11px; color: #888;">You are receiving this because you subscribed to OnWay Newsletter.</p>
                            </div>
                        `
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error("❌ Blog Notification Email Failed:", error);
                            } else {
                                console.log("✅ Blog Notification Sent: " + info.response);
                            }
                        });
                    }
                } catch (mailError) {
                    console.error("Error fetching subscribers:", mailError);
                }
            }

            res.status(201).json({
                success: true,
                message: "Blog created successfully and subscribers notified!",
                insertedId: result.insertedId,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

    // 4. PATCH: Update Blog (Admin)
    router.patch("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedData = req.body;

            delete updatedData._id;

            const updateDoc = {
                $set: updatedData,
            };

            const result = await blogsCollection.updateOne(filter, updateDoc);

            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: "Blog not found" });
            }

            res.json({
                success: true,
                message: "Blog updated successfully",
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

    // 5. DELETE: Remove Blog (Admin)
    router.delete("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await blogsCollection.deleteOne(query);

            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, message: "Blog not found" });
            }

            res.json({
                success: true,
                message: "Blog deleted successfully",
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

    return router;
};