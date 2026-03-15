const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (blogsCollection) => {
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
            res.status(201).json({
                success: true,
                message: "Blog created successfully",
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