const { ObjectId } = require("mongodb");
const generateOTP = require("../utils/generateOTP");
const socketStore = require("../utils/socketStore");
const Booking = require("../models/Booking");
const Rider = require("../models/Rider");
const Passenger = require("../models/Passenger");

const bookingController = (collections) => {
    const bookingModel = new Booking(collections.bookingsCollection);
    const riderModel = new Rider(collections.ridersCollection);
    const passengerModel = new Passenger(collections.passengerCollection);

    return {
        // GET /api/bookings
        getBookings: async (req, res) => {
            try {
                const { passengerId, status, recent } = req.query;
                let query = {};
                if (passengerId) query.passengerId = new ObjectId(passengerId);
                if (status) query.bookingStatus = status;

                if (recent === "true") {
                    const sixtySecondsAgo = new Date(Date.now() - 60000);
                    query.createdAt = { $gte: sixtySecondsAgo };
                }

                const bookings = await bookingModel.find(query);
                res.status(200).json({ success: true, data: bookings, count: bookings.length });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // POST /api/bookings
        createBooking: async (req, res) => {
            try {
                const { pickupLocation, dropoffLocation, routeGeometry, distance, duration, price, passengerId } = req.body;

                if (!pickupLocation || !dropoffLocation || !routeGeometry || distance === undefined || duration === undefined || price === undefined) {
                    return res.status(400).json({ success: false, message: "Missing required fields" });
                }

                const otp = generateOTP();
                const bookingData = {
                    passengerId: passengerId ? new ObjectId(passengerId) : null,
                    riderId: null,
                    pickupLocation,
                    dropoffLocation,
                    routeGeometry,
                    distance,
                    duration,
                    price,
                    bookingStatus: "searching",
                    otp,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const booking = await bookingModel.create(bookingData);

                // Real-time dispatch
                const nearbyDrivers = socketStore.findNearbyRiders(pickupLocation.lat, pickupLocation.lng, 5);
                if (nearbyDrivers.length > 0 && req.io) {
                    let passengerName = "Passenger";
                    const passenger = await passengerModel.findById(passengerId);
                    if (passenger) passengerName = passenger.name;

                    const ridePayload = {
                        bookingId: booking._id.toString(),
                        pickupLocation: pickupLocation.address,
                        dropLocation: dropoffLocation.address,
                        pickupCoords: [pickupLocation.lat, pickupLocation.lng],
                        dropCoords: [dropoffLocation.lat, dropoffLocation.lng],
                        distance,
                        duration,
                        price,
                        passengerName,
                        createdAt: new Date()
                    };

                    nearbyDrivers.forEach(driver => {
                        req.io.to(`rider:${driver._id}`).emit("new-ride-request", ridePayload);
                    });
                }

                res.status(201).json({ success: true, booking });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // GET /api/bookings/:id
        getBookingById: async (req, res) => {
            try {
                const booking = await bookingModel.findById(req.params.id);
                if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
                res.status(200).json({ success: true, booking });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // POST /api/bookings/verify-otp
        verifyOTP: async (req, res) => {
            try {
                const { bookingId, otp } = req.body;
                if (!bookingId || !otp) return res.status(400).json({ success: false, message: "Missing bookingId or otp" });

                const isValid = await bookingModel.verifyOTP(bookingId, otp);
                if (isValid) {
                    // Notify passenger via socket
                    if (req.io) {
                        const booking = await bookingModel.findById(bookingId);
                        req.io.to(`user:${booking.passengerId}`).emit("ride:started", { bookingId });
                    }
                    res.status(200).json({ success: true, message: "OTP Verified. Ride started." });
                } else {
                    res.status(400).json({ success: false, message: "Invalid OTP code" });
                }
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // PATCH /api/bookings/:id/status
        updateStatus: async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;
                await bookingModel.updateStatus(id, status);

                if (["completed", "cancelled"].includes(status)) {
                    const booking = await bookingModel.findById(id);
                    if (booking && booking.riderId) {
                        await riderModel.updateStatus(booking.riderId, "online");
                    }
                }

                res.status(200).json({ success: true, message: "Status updated" });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        }
    };
};

module.exports = bookingController;
