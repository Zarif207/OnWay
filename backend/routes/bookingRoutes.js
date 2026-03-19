// routes/bookingRoutes.js
const express = require("express");
const bookingController = require("../controllers/bookingController");

module.exports = (collections) => {
    const router = express.Router();
    const controller = bookingController(collections);

    // Static routes আগে — specific paths
    router.get("/", controller.getBookings);
    router.post("/", controller.createBooking);
    router.post("/verify-otp", controller.verifyOTP);  // ← /:id এর আগে রাখো

    // Dynamic routes পরে — :id routes
    router.get("/:id", controller.getBookingById);
    router.patch("/:id/status", controller.updateStatus);
    router.post("/:id/accept", controller.acceptRide);

    return router;
};
// const express = require("express");
// const bookingController = require("../controllers/bookingController");

// module.exports = (collections) => {
//     const router = express.Router();
//     const controller = bookingController(collections);

//     router.get("/", controller.getBookings);
//     router.post("/", controller.createBooking);
//     router.get("/:id", controller.getBookingById);
//     router.post("/verify-otp", controller.verifyOTP);
//     router.patch("/:id/status", controller.updateStatus);
//     router.post("/:id/accept", controller.acceptRide);

//     return router;
// };
