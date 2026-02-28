const express = require("express");

module.exports = (blogsCollection) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        const blogs = await blogsCollection.find({}).toArray();
        res.json({
            success: true,
            data: blogs,
        });
    });

    return router;
};