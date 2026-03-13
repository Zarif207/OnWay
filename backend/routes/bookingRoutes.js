const express = require("express");
const bookingController = require("../controllers/bookingController");

module.exports = (collections) => {
    const router = express.Router();
    const controller = bookingController(collections);

    router.get("/", controller.getBookings);
    router.post("/", controller.createBooking);
    router.get("/:id", controller.getBookingById);
    router.post("/verify-otp", controller.verifyOTP);
    router.patch("/:id/status", controller.updateStatus);

    return router;
};
