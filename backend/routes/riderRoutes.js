const express = require("express");
const riderController = require("../controllers/riderController");

module.exports = (collections) => {
    const router = express.Router();
    const controller = riderController(collections);

    router.get("/nearby", controller.getNearbyRiders);
    router.get("/", controller.getRiderById); // Adjusted based on usage
    router.get("/:id", controller.getRiderById);
    router.get("/dashboard/:id", controller.getDashboardStats);
    router.patch("/:id/status", controller.updateStatus);

    return router;
};
