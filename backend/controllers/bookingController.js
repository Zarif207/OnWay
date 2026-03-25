// controllers/bookingController.js
const { ObjectId } = require("mongodb");
const generateOTP = require("../utils/generateOTP");
const Booking = require("../models/Booking");
const Rider = require("../models/Rider");
const Passenger = require("../models/Passenger");

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:4001";

// ── HTTP helpers to socket server ─────────────────────────────
async function socketEmit(event, room, payload) {
  try {
    await fetch(`${SOCKET_URL}/api/emit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, room, payload }),
    });
  } catch (err) {
    console.warn(`⚠️  socketEmit failed [${event} → ${room}]:`, err.message);
  }
}

async function socketDispatch(riderIds, ridePayload) {
  try {
    await fetch(`${SOCKET_URL}/api/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderIds, ridePayload }),
    });
  } catch (err) {
    console.warn("⚠️  socketDispatch failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
const bookingController = (collections) => {
  const bookingModel = new Booking(collections.bookingsCollection);
  const riderModel = new Rider(collections.ridersCollection);
  const passengerModel = new Passenger(collections.passengerCollection);

  return {
    // GET /api/bookings
    getBookings: async (req, res) => {
      try {
        const { passengerId, status, recent } = req.query;
        const query = {};
        if (passengerId) query.passengerId = new ObjectId(passengerId);
        if (status) query.bookingStatus = status;
        if (recent === "true") query.createdAt = { $gte: new Date(Date.now() - 60000) };

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
          pickupLocation, dropoffLocation, routeGeometry,
          distance, duration, price, passengerId, rideType, surgeApplied,
        } = req.body;

        if (!pickupLocation || !dropoffLocation || !routeGeometry ||
          distance === undefined || duration === undefined || price === undefined) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const ALLOWED_ZONES = [
          { name: "Dhaka",      minLat: 23.70, maxLat: 23.90, minLng: 90.35, maxLng: 90.50 },
          { name: "Chittagong", minLat: 22.28, maxLat: 22.45, minLng: 91.75, maxLng: 91.90 },
          { name: "Sylhet",     minLat: 24.85, maxLat: 24.95, minLng: 91.82, maxLng: 91.92 },
          { name: "Rajshahi",   minLat: 24.35, maxLat: 24.42, minLng: 88.55, maxLng: 88.65 },
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
          pickupLocation, dropoffLocation, routeGeometry,
          distance, duration, price,
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

        // Dispatch to nearby drivers via socket server
        try {
          const nearbyDrivers = await collections.ridersCollection.find({
            location: {
              $near: {
                $geometry: { type: "Point", coordinates: [pickupLocation.lng, pickupLocation.lat] },
                $maxDistance: 5000,
              },
            },
            status: "online",
          }).toArray();

          console.log(`📡 Found ${nearbyDrivers.length} nearby drivers`);

          if (nearbyDrivers.length > 0) {
            let passengerName = "Passenger";
            try {
              const passenger = await passengerModel.findById(passengerId);
              if (passenger?.name) passengerName = passenger.name;
            } catch (_) {}

            const ridePayload = {
              bookingId,
              pickupLocation: pickupLocation.address || "Pickup Point",
              dropLocation: dropoffLocation.address || "Drop-off Point",
              pickupCoords: [pickupLocation.lat, pickupLocation.lng],
              dropCoords: [dropoffLocation.lat, dropoffLocation.lng],
              distance, duration, price, fare: price,
              passengerName,
              createdAt: new Date(),
            };

            const riderIds = nearbyDrivers.map((d) => d._id.toString());
            await socketDispatch(riderIds, ridePayload);
            console.log(`🚀 Dispatched to ${riderIds.length} riders via socket server`);
          }
        } catch (dispatchError) {
          console.error("Dispatch error (non-fatal):", dispatchError.message);
        }

        // Auto-expire after 60 seconds
        setTimeout(async () => {
          try {
            const current = await bookingModel.findById(bookingId);
            if (current?.bookingStatus === "searching") {
              await bookingModel.updateStatus(bookingId, "expired");
              if (passengerId) {
                await socketEmit("ride-expired", `passenger:${passengerId}`, {
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
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
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

        const booking = await bookingModel.findById(bookingId);
        if (booking?.passengerId) {
          const pid = booking.passengerId.toString();
          await socketEmit("trip_started", `passenger:${pid}`, { bookingId });
          await socketEmit("ride:started", `user:${pid}`, { bookingId });
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

        if (["completed", "cancelled"].includes(status)) {
          const booking = await bookingModel.findById(id);
          if (booking?.riderId) {
            await riderModel.updateStatus(booking.riderId, "online");
            if (booking.passengerId) {
              await socketEmit(`ride:${status}`, `passenger:${booking.passengerId}`, { bookingId: id });
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
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
        if (booking.bookingStatus !== "searching") {
          return res.status(400).json({ success: false, message: "Ride is no longer available" });
        }

        await collections.bookingsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { riderId: new ObjectId(riderId), bookingStatus: "accepted", acceptedAt: new Date(), updatedAt: new Date() } }
        );

        const rider = await riderModel.findById(riderId);
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

        await riderModel.updateStatus(riderId, "busy");

        const pid = booking.passengerId?.toString();
        const acceptancePayload = {
          bookingId: id, riderId,
          otp: booking.otp,
          driver: {
            name: rider.name || "Driver",
            phone: rider.phone || "",
            image: rider.image || "",
            rating: rider.rating || 5.0,
            vehicle: rider.vehicle || {},
          },
        };

        await socketEmit("ride:accepted",  `passenger:${pid}`, acceptancePayload);
        await socketEmit("rideAccepted",   `passenger:${pid}`, acceptancePayload);
        await socketEmit("ride:accepted",  `user:${pid}`,      acceptancePayload);

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
  };
};

module.exports = bookingController;
