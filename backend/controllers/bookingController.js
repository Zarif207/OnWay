// controllers/bookingController.js
const { ObjectId } = require("mongodb");
const generateOTP = require("../utils/generateOTP");
const socketStore = require("../utils/socketStore");
const rideSimulation = require("../services/rideSimulationService");
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

                if (passengerId) {
                    if (!ObjectId.isValid(passengerId)) {
                        return res.status(400).json({ success: false, message: "Invalid passengerId" });
                    }
                    query.passengerId = new ObjectId(passengerId);
                }
                if (status) query.bookingStatus = status;

                if (recent === "true") {
                    query.createdAt = { $gte: new Date(Date.now() - 60000) };
                }

                const bookings = await bookingModel.find(query);
                res.status(200).json({ success: true, data: bookings, count: bookings.length });
            } catch (error) {
                console.error("getBookings error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // POST /api/bookings
        createBooking: async (req, res) => {
            try {
                const {
                    pickupLocation,
                    dropoffLocation,
                    routeGeometry,
                    distance,
                    duration,
                    price,
                    passengerId,
                    rideType,
                    surgeApplied
                } = req.body;

                if (!pickupLocation || !dropoffLocation || !routeGeometry || distance === undefined || duration === undefined || price === undefined) {
                    return res.status(400).json({ success: false, message: "Missing required fields" });
                }

                // Zone check
                const ALLOWED_ZONES = [
                    { name: "Dhaka", minLat: 23.70, maxLat: 23.90, minLng: 90.35, maxLng: 90.50 },
                    { name: "Chittagong", minLat: 22.28, maxLat: 22.45, minLng: 91.75, maxLng: 91.90 },
                    { name: "Sylhet", minLat: 24.85, maxLat: 24.95, minLng: 91.82, maxLng: 91.92 },
                    { name: "Rajshahi", minLat: 24.35, maxLat: 24.42, minLng: 88.55, maxLng: 88.65 },
                ];

                const inZone = ALLOWED_ZONES.some(
                    (z) =>
                        pickupLocation.lat >= z.minLat && pickupLocation.lat <= z.maxLat &&
                        pickupLocation.lng >= z.minLng && pickupLocation.lng <= z.maxLng
                );

                if (!inZone) {
                    return res.status(400).json({
                        success: false,
                        message: "Service unavailable in your area. We serve Dhaka, Chittagong, Sylhet, and Rajshahi.",
                    });
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
                    rideType: rideType || "standard",
                    surgeApplied: surgeApplied || false,
                    bookingStatus: "searching",
                    otp,
                    paymentMethod: "cash",
                    paymentStatus: "pending",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const booking = await bookingModel.create(bookingData);
                const bookingId = booking._id.toString();

                console.log(`✅ Booking created: ${bookingId}`);

                // Real-time dispatch to nearby drivers
                try {
                    const nearbyDrivers = await collections.ridersCollection.find({
                        location: {
                            $near: {
                                $geometry: {
                                    type: "Point",
                                    coordinates: [pickupLocation.lng, pickupLocation.lat]
                                },
                                $maxDistance: 5000 // 5km radius
                            }
                        },
                        status: "online"
                    }).toArray();

                    console.log(`📡 Found ${nearbyDrivers.length} nearby drivers using $near query`);

                    if (nearbyDrivers.length > 0) {
                        let passengerName = "Passenger";
                        try {
                            const passenger = await passengerModel.findById(passengerId);
                            if (passenger?.name) passengerName = passenger.name;
                        } catch (e) { }

                        const ridePayload = {
                            bookingId,
                            pickupLocation: pickupLocation.address || "Pickup Point",
                            dropLocation: dropoffLocation.address || "Drop-off Point",
                            pickupCoords: [pickupLocation.lat, pickupLocation.lng],
                            dropCoords: [dropoffLocation.lat, dropoffLocation.lng],
                            distance,
                            duration,
                            price,
                            fare: price,
                            passengerName,
                            createdAt: new Date(),
                        };

                        const riderIds = nearbyDrivers.map(d => d._id.toString());

                        if (req.io) {
                            nearbyDrivers.forEach((driver) => {
                                // server.js room format
                                req.io.to(`driver:${driver._id}`).emit("new-ride-request", ridePayload);
                                // socket-server room format
                                req.io.to(`rider:${driver._id}`).emit("new-ride-request", ridePayload);
                                console.log(`🚀 Dispatched to port 5000 driver: ${driver._id}`);
                            });
                        }

                        // Forward to Port 4001 socket server
                        const axios = require("axios");
                        try {
                            const socketUrl = process.env.SOCKET_URL || "http://localhost:4001";
                            await axios.post(`${socketUrl}/api/dispatch`, {
                                riderIds,
                                ridePayload
                            });
                            console.log(`🚀 Forwarded dispatch to Socket Server (Port 4001) for ${riderIds.length} riders`);
                        } catch (forwardErr) {
                            console.error("❌ Failed to forward dispatch to Port 4001:", forwardErr.message);
                        }
                    }
                } catch (dispatchError) {
                    console.error("Dispatch error:", dispatchError);
                    // dispatch fail হলেও booking তৈরি হয়ে যাবে
                }

                // Auto-expire after 60 seconds
                setTimeout(async () => {
                    try {
                        const current = await bookingModel.findById(bookingId);
                        if (current?.bookingStatus === "searching") {
                            await bookingModel.updateStatus(bookingId, "expired");
                            if (req.io && passengerId) {
                                req.io.to(`passenger:${passengerId}`).emit("ride-expired", {
                                    bookingId,
                                    message: "No drivers accepted your ride",
                                });
                            }
                            console.log(`⏰ Booking ${bookingId} expired`);
                        }
                    } catch (e) {
                        console.error("Expire error:", e);
                    }
                }, 60000);

                res.status(201).json({ success: true, booking });
            } catch (error) {
                console.error("createBooking error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // GET /api/bookings/:id
        getBookingById: async (req, res) => {
            try {
                const booking = await bookingModel.findById(req.params.id);
                if (!booking) {
                    return res.status(404).json({ success: false, message: "Booking not found" });
                }
                res.status(200).json({ success: true, booking });
            } catch (error) {
                console.error("getBookingById error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // POST /api/bookings/verify-otp
        verifyOTP: async (req, res) => {
            try {
                const { bookingId, otp } = req.body;

                if (!bookingId || !otp) {
                    return res.status(400).json({ success: false, message: "bookingId and otp are required" });
                }

                const isValid = await bookingModel.verifyOTP(bookingId, otp);

                if (!isValid) {
                    return res.status(400).json({ success: false, message: "Invalid OTP code" });
                }

                await bookingModel.updateStatus(bookingId, "picked_up");

                // Notify passenger trip started
                if (req.io) {
                    const booking = await bookingModel.findById(bookingId);
                    if (booking?.passengerId) {
                        req.io.to(`passenger:${booking.passengerId}`).emit("trip_started", { bookingId });
                        req.io.to(`user:${booking.passengerId}`).emit("ride:started", { bookingId });
                    }
                }

                res.status(200).json({ success: true, message: "OTP verified. Trip started!" });
            } catch (error) {
                console.error("verifyOTP error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // PATCH /api/bookings/:id/status
        updateStatus: async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;

                const allowedStatuses = ["searching", "accepted", "arrived", "picked_up", "ongoing", "completed", "cancelled", "expired"];
                if (!allowedStatuses.includes(status)) {
                    return res.status(400).json({ success: false, message: "Invalid status" });
                }

                await bookingModel.updateStatus(id, status);

                // Reset rider status when ride ends
                if (["completed", "cancelled"].includes(status)) {
                    const booking = await bookingModel.findById(id);
                    if (booking?.riderId) {
                        await riderModel.updateStatus(booking.riderId, "online");
                        rideSimulation.stopSimulation(id);

                        if (req.io) {
                            req.io.to(`passenger:${booking.passengerId}`).emit(`ride:${status}`, { bookingId: id });
                        }
                    }
                }

                res.status(200).json({ success: true, message: "Status updated", bookingStatus: status });
            } catch (error) {
                console.error("updateStatus error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // POST /api/bookings/:id/accept
        acceptRide: async (req, res) => {
            try {
                const { id } = req.params;
                const { riderId } = req.body;

                if (!riderId) {
                    return res.status(400).json({ success: false, message: "riderId is required" });
                }

                const booking = await bookingModel.findById(id);
                if (!booking) {
                    return res.status(404).json({ success: false, message: "Booking not found" });
                }

                if (booking.bookingStatus !== "searching") {
                    return res.status(400).json({ success: false, message: "Ride is no longer available" });
                }

                // Update booking
                await collections.bookingsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            riderId: new ObjectId(riderId),
                            bookingStatus: "accepted",
                            acceptedAt: new Date(),
                            updatedAt: new Date(),
                        },
                    }
                );

                const rider = await riderModel.findById(riderId);
                if (!rider) {
                    return res.status(404).json({ success: false, message: "Rider not found" });
                }

                await riderModel.updateStatus(riderId, "busy");

                // Notify passenger
                if (req.io) {
                    const acceptancePayload = {
                        bookingId: id,
                        riderId,
                        otp: booking.otp,
                        driver: {
                            name: rider.name || "Driver",
                            phone: rider.phone || "",
                            image: rider.image || "",
                            rating: rider.rating || 5.0,
                            vehicle: rider.vehicle || {},
                        },
                    };

                    // দুটো room এ পাঠাও — compatibility এর জন্য
                    req.io.to(`passenger:${booking.passengerId}`).emit("ride:accepted", acceptancePayload);
                    req.io.to(`user:${booking.passengerId}`).emit("ride:accepted", acceptancePayload);
                    req.io.to(`passenger:${booking.passengerId}`).emit("rideAccepted", acceptancePayload);

                    // Simulation শুরু করো
                    const serviceAreas = rider.serviceAreas || [];
                    rideSimulation.startSimulation(
                        id,
                        riderId,
                        serviceAreas,
                        booking.pickupLocation.lat,
                        booking.pickupLocation.lng,
                        req.io,
                        async (rideId) => {
                            await bookingModel.updateStatus(rideId, "arrived");
                        }
                    );
                }

                res.status(200).json({
                    success: true,
                    message: "Ride accepted",
                    booking: await bookingModel.findById(id),
                });
            } catch (error) {
                console.error("acceptRide error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        // POST /api/bookings/:id/start-trip
        // Called when passenger clicks "Verify & Start Trip".
        // Enriches the booking with rider/passenger details and sets status to ongoing.
        startTrip: async (req, res) => {
            try {
                const { id } = req.params;

                const booking = await bookingModel.findById(id);
                if (!booking) {
                    return res.status(404).json({ success: false, message: "Booking not found" });
                }

                // Fetch rider details
                let riderName    = null;
                let riderImage   = null;
                let vehicleName  = null;
                let driverRating = null;

                if (booking.riderId) {
                    try {
                        const rider = await riderModel.findById(booking.riderId.toString());
                        if (rider) {
                            riderName    = rider.name   || null;
                            riderImage   = rider.image  || rider.profileImage || null;
                            vehicleName  = rider.vehicle?.model || rider.vehicleDetails?.brand || rider.car || null;
                            driverRating = rider.rating || null;
                        }
                    } catch (e) {
                        console.warn("Could not fetch rider details:", e.message);
                    }
                }

                // Fetch passenger details
                let passengerName  = null;
                let passengerImage = null;

                if (booking.passengerId) {
                    try {
                        const passenger = await passengerModel.findById(booking.passengerId.toString());
                        if (passenger) {
                            passengerName  = passenger.name  || null;
                            passengerImage = passenger.image || passenger.profileImage || null;
                        }
                    } catch (e) {
                        console.warn("Could not fetch passenger details:", e.message);
                    }
                }

                // Persist enriched data + status change
                await collections.bookingsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            bookingStatus: "ongoing",
                            tripStartedAt: new Date(),
                            updatedAt:     new Date(),
                            riderName,
                            riderImage,
                            vehicleName,
                            driverRating,
                            passengerName,
                            passengerImage,
                        },
                    }
                );

                // Notify via socket
                if (req.io && booking.passengerId) {
                    req.io.to(`passenger:${booking.passengerId}`).emit("trip_started", { bookingId: id });
                    req.io.to(`user:${booking.passengerId}`).emit("ride:started",     { bookingId: id });
                }

                const updated = await bookingModel.findById(id);
                console.log(`🚀 Trip started: ${id}`);

                res.status(200).json({ success: true, message: "Trip started", booking: updated });
            } catch (error) {
                console.error("startTrip error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // GET /api/bookings/unpaid-check?passengerId=xxx
        checkUnpaidBooking: async (req, res) => {
            try {
                const { passengerId } = req.query;
                if (!passengerId) {
                    return res.status(400).json({ success: false, message: "passengerId is required" });
                }
                const unpaid = await bookingModel.hasUnpaidBooking(passengerId);
                res.status(200).json({
                    success: true,
                    hasUnpaid: !!unpaid,
                    unpaidBookingId: unpaid ? unpaid._id.toString() : null,
                });
            } catch (error) {
                console.error("checkUnpaidBooking error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
    };
};

module.exports = bookingController;

// const { ObjectId } = require("mongodb");
// const generateOTP = require("../utils/generateOTP");
// const socketStore = require("../utils/socketStore");
// const rideSimulation = require("../services/rideSimulationService");
// const Booking = require("../models/Booking");
// const Rider = require("../models/Rider");
// const Passenger = require("../models/Passenger");

// const bookingController = (collections) => {
//     const bookingModel = new Booking(collections.bookingsCollection);
//     const riderModel = new Rider(collections.ridersCollection);
//     const passengerModel = new Passenger(collections.passengerCollection);

//     return {
//         // GET /api/bookings
//         getBookings: async (req, res) => {
//             try {
//                 const { passengerId, status, recent } = req.query;
//                 let query = {};
//                 if (passengerId) query.passengerId = new ObjectId(passengerId);
//                 if (status) query.bookingStatus = status;

//                 if (recent === "true") {
//                     const sixtySecondsAgo = new Date(Date.now() - 60000);
//                     query.createdAt = { $gte: sixtySecondsAgo };
//                 }

//                 const bookings = await bookingModel.find(query);
//                 res.status(200).json({ success: true, data: bookings, count: bookings.length });
//             } catch (error) {
//                 res.status(500).json({ success: false, message: error.message });
//             }
//         },

//         // POST /api/bookings
//         createBooking: async (req, res) => {
//             try {
//                 const { pickupLocation, dropoffLocation, routeGeometry, distance, duration, price, passengerId } = req.body;

//                 if (!pickupLocation || !dropoffLocation || !routeGeometry || distance === undefined || duration === undefined || price === undefined) {
//                     return res.status(400).json({ success: false, message: "Missing required fields" });
//                 }

//                 const otp = generateOTP();
//                 const bookingData = {
//                     passengerId: passengerId ? new ObjectId(passengerId) : null,
//                     riderId: null,
//                     pickupLocation,
//                     dropoffLocation,
//                     routeGeometry,
//                     distance,
//                     duration,
//                     price,
//                     bookingStatus: "searching",
//                     otp,
//                     createdAt: new Date(),
//                     updatedAt: new Date()
//                 };

//                 const booking = await bookingModel.create(bookingData);

//                 // Real-time dispatch
//                 const nearbyDrivers = socketStore.findNearbyRiders(pickupLocation.lat, pickupLocation.lng, 5);
//                 if (nearbyDrivers.length > 0 && req.io) {
//                     let passengerName = "Passenger";
//                     const passenger = await passengerModel.findById(passengerId);
//                     if (passenger) passengerName = passenger.name;

//                     const ridePayload = {
//                         bookingId: booking._id.toString(),
//                         pickupLocation: pickupLocation.address,
//                         dropLocation: dropoffLocation.address,
//                         pickupCoords: [pickupLocation.lat, pickupLocation.lng],
//                         dropCoords: [dropoffLocation.lat, dropoffLocation.lng],
//                         distance,
//                         duration,
//                         price,
//                         passengerName,
//                         createdAt: new Date()
//                     };

//                     nearbyDrivers.forEach(driver => {
//                         req.io.to(`rider:${driver._id}`).emit("new-ride-request", ridePayload);
//                     });
//                 }

//                 res.status(201).json({ success: true, booking });
//             } catch (error) {
//                 res.status(500).json({ success: false, message: error.message });
//             }
//         },

//         // GET /api/bookings/:id
//         getBookingById: async (req, res) => {
//             try {
//                 const booking = await bookingModel.findById(req.params.id);
//                 if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
//                 res.status(200).json({ success: true, booking });
//             } catch (error) {
//                 res.status(500).json({ success: false, message: error.message });
//             }
//         },

//         // POST /api/bookings/verify-otp
//         verifyOTP: async (req, res) => {
//             try {
//                 const { bookingId, otp } = req.body;
//                 if (!bookingId || !otp) return res.status(400).json({ success: false, message: "Missing bookingId or otp" });

//                 const isValid = await bookingModel.verifyOTP(bookingId, otp);
//                 if (isValid) {
//                     // Notify passenger via socket
//                     if (req.io) {
//                         const booking = await bookingModel.findById(bookingId);
//                         req.io.to(`user:${booking.passengerId}`).emit("ride:started", { bookingId });
//                     }
//                     res.status(200).json({ success: true, message: "OTP Verified. Ride started." });
//                 } else {
//                     res.status(400).json({ success: false, message: "Invalid OTP code" });
//                 }
//             } catch (error) {
//                 res.status(500).json({ success: false, message: error.message });
//             }
//         },

//         // PATCH /api/bookings/:id/status
//         updateStatus: async (req, res) => {
//             try {
//                 const { id } = req.params;
//                 const { status } = req.body;
//                 await bookingModel.updateStatus(id, status);

//                 if (["completed", "cancelled"].includes(status)) {
//                     const booking = await bookingModel.findById(id);
//                     if (booking && booking.riderId) {
//                         await riderModel.updateStatus(booking.riderId, "online");
//                         // Stop simulation when ride ends
//                         rideSimulation.stopSimulation(id);
//                     }
//                 }

//                 res.status(200).json({ success: true, message: "Status updated" });
//             } catch (error) {
//                 res.status(500).json({ success: false, message: error.message });
//             }
//         },

//         // POST /api/bookings/:id/accept - Rider accepts ride
//         acceptRide: async (req, res) => {
//             try {
//                 const { id } = req.params;
//                 const { riderId } = req.body;

//                 if (!riderId) {
//                     return res.status(400).json({ success: false, message: "Rider ID required" });
//                 }

//                 const booking = await bookingModel.findById(id);
//                 if (!booking) {
//                     return res.status(404).json({ success: false, message: "Booking not found" });
//                 }

//                 if (booking.bookingStatus !== "searching") {
//                     return res.status(400).json({ success: false, message: "Ride already assigned" });
//                 }

//                 // Update booking with rider
//                 await collections.bookingsCollection.updateOne(
//                     { _id: new ObjectId(id) },
//                     {
//                         $set: {
//                             riderId: new ObjectId(riderId),
//                             bookingStatus: "accepted",
//                             acceptedAt: new Date(),
//                             updatedAt: new Date()
//                         }
//                     }
//                 );

//                 // Get rider details including service areas
//                 const rider = await riderModel.findById(riderId);
//                 if (!rider) {
//                     return res.status(404).json({ success: false, message: "Rider not found" });
//                 }

//                 // Update rider status to busy
//                 await riderModel.updateStatus(riderId, "busy");

//                 // Notify passenger via socket
//                 if (req.io) {
//                     req.io.to(`passenger:${booking.passengerId}`).emit("ride:accepted", {
//                         bookingId: id,
//                         riderId: riderId,
//                         driver: {
//                             name: rider.name,
//                             phone: rider.phone,
//                             vehicle: rider.vehicle,
//                             rating: rider.rating || 5.0
//                         }
//                     });

//                     // Start simulated movement
//                     const serviceAreas = rider.serviceAreas || [];
//                     const pickupLat = booking.pickupLocation.lat;
//                     const pickupLng = booking.pickupLocation.lng;

//                     rideSimulation.startSimulation(
//                         id,
//                         riderId,
//                         serviceAreas,
//                         pickupLat,
//                         pickupLng,
//                         req.io,
//                         async (rideId, driverId) => {
//                             // Callback when rider arrives
//                             await bookingModel.updateStatus(rideId, "arrived");
//                         }
//                     );
//                 }

//                 res.status(200).json({
//                     success: true,
//                     message: "Ride accepted successfully",
//                     booking: await bookingModel.findById(id)
//                 });
//             } catch (error) {
//                 console.error("Accept ride error:", error);
//                 res.status(500).json({ success: false, message: error.message });
//             }
//         }
//     };
// };

// module.exports = bookingController;
