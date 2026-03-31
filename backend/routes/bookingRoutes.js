// routes/bookingRoutes.js
const express = require("express");
const bookingController = require("../controllers/bookingController");

module.exports = (collections) => {
    const router = express.Router();
    const controller = bookingController(collections);

    // Static routes first
    router.get("/", controller.getBookings);
    router.post("/", controller.createBooking);
    router.get("/unpaid-check", controller.checkUnpaidBooking);
    router.post("/verify-otp", controller.verifyOTP);

    // Dynamic :id routes
    router.get("/:id", controller.getBookingById);
    router.patch("/:id/status", controller.updateStatus);
    router.post("/:id/accept", controller.acceptRide);
    router.post("/:id/start-trip", controller.startTrip);

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
