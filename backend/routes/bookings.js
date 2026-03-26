const express = require("express");
const { ObjectId } = require("mongodb");
const notificationHelper = require("../utils/notificationHelper");

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:4001";
const IS_DEV = process.env.NODE_ENV === "development";

// ── Socket HTTP helpers ───────────────────────────────────────
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

// ── Nearby riders with $near + Haversine fallback ─────────────
async function findNearbyRiders(ridersCollection, lat, lng, radiusKm = 5) {
    // Try geospatial $near first (requires 2dsphere index)
    try {
        return await ridersCollection.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radiusKm * 1000,
                },
            },
            status: "online",
        }).toArray();
    } catch (geoErr) {
        // Fallback: fetch all online riders and filter by Haversine distance
        console.warn("⚠️  $near failed (index missing?), using Haversine fallback:", geoErr.message);
        const allOnline = await ridersCollection.find({ status: "online" }).toArray();
        return allOnline.filter((r) => {
            const coords = r.location?.coordinates;
            if (!coords) return false;
            const [rLng, rLat] = coords;
            const R = 6371;
            const dLat = ((rLat - lat) * Math.PI) / 180;
            const dLng = ((rLng - lng) * Math.PI) / 180;
            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((lat * Math.PI) / 180) *
                Math.cos((rLat * Math.PI) / 180) *
                Math.sin(dLng / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) <= radiusKm;
        });
    }
}

// ─────────────────────────────────────────────────────────────
// server.js passes the full collections object:
//   app.use("/api/bookings", (req, res, next) => bookingsRoutes(req.collections)(req, res, next));
// So the parameter here IS the collections object.
// ─────────────────────────────────────────────────────────────
module.exports = (collections) => {
    // Destructure all needed collections up front
    const {
        bookingsCollection,
        ridersCollection,
        passengerCollection,
        notificationsCollection,
    } = collections;

    if (!bookingsCollection) {
        throw new Error("bookingsCollection is required");
    }

    const router = express.Router();

    // ── GET /api/bookings ─────────────────────────────────────
    router.get("/", async (req, res) => {
        try {
            const { passengerId, riderId, status, recent, page = 1, limit = 50 } = req.query;
            const query = {};

            if (passengerId) {
                // Support both string and ObjectId stored passengerId
                query.$or = [
                    { passengerId: passengerId },
                    ...(ObjectId.isValid(passengerId)
                        ? [{ passengerId: new ObjectId(passengerId) }]
                        : []),
                ];
            }
            if (riderId) {
                query.$or = [
                    { riderId: riderId },
                    ...(ObjectId.isValid(riderId)
                        ? [{ riderId: new ObjectId(riderId) }]
                        : []),
                ];
            }
            if (status) query.bookingStatus = status;

            // recent=true → only last 60 seconds (for live polling)
            if (recent === "true") {
                query.createdAt = { $gte: new Date(Date.now() - 60000) };
            }

            // Also expire stale "searching" bookings at query time
            // (replaces the unreliable setTimeout on serverless)
            const expiredCutoff = new Date(Date.now() - 60000);
            await bookingsCollection.updateMany(
                { bookingStatus: "searching", createdAt: { $lt: expiredCutoff } },
                { $set: { bookingStatus: "expired", updatedAt: new Date() } }
            ).catch(() => {}); // non-fatal

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const bookings = await bookingsCollection
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray();

            const total = await bookingsCollection.countDocuments(query);

            res.status(200).json({
                success: true,
                data: bookings,
                count: bookings.length,
                total,
                page: parseInt(page),
            });
        } catch (error) {
            console.error("GET /bookings error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch bookings",
                error: IS_DEV ? error.message : undefined,
            });
        }
    });

    // ── POST /api/bookings ────────────────────────────────────
    router.post("/", async (req, res) => {
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
                surgeApplied,
            } = req.body;

            if (!pickupLocation || !dropoffLocation || !routeGeometry ||
                distance === undefined || duration === undefined || price === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields: pickupLocation, dropoffLocation, routeGeometry, distance, duration, price",
                });
            }

            if (!pickupLocation.lat || !pickupLocation.lng) {
                return res.status(400).json({
                    success: false,
                    message: "pickupLocation must include lat and lng",
                });
            }

            const bookingData = {
                passengerId: passengerId && ObjectId.isValid(passengerId)
                    ? new ObjectId(passengerId)
                    : passengerId || null,
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
                otp: Math.floor(1000 + Math.random() * 9000).toString(),
                paymentMethod: "cash",
                paymentStatus: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + 60000), // used for query-time expiry
            };

            const result = await bookingsCollection.insertOne(bookingData);
            const bookingId = result.insertedId;
            console.log(`✅ Booking created: ${bookingId}`);

            // ── Dispatch to nearby riders ─────────────────────
            try {
                const nearbyDrivers = await findNearbyRiders(
                    ridersCollection,
                    pickupLocation.lat,
                    pickupLocation.lng,
                    5
                );
                console.log(`📡 Found ${nearbyDrivers.length} nearby riders`);

                if (nearbyDrivers.length > 0) {
                    let passengerName = "Passenger";
                    if (passengerId && passengerCollection) {
                        try {
                            const query = ObjectId.isValid(passengerId)
                                ? { _id: new ObjectId(passengerId) }
                                : { _id: passengerId };
                            const passenger = await passengerCollection.findOne(query);
                            if (passenger?.name) passengerName = passenger.name;
                        } catch (_) {}
                    }

                    const ridePayload = {
                        bookingId: bookingId.toString(),
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
                    console.log(`🚀 Dispatched to ${riderIds.length} riders`);
                }
            } catch (dispatchErr) {
                console.error("Dispatch error (non-fatal):", dispatchErr.message);
            }

            // ── Admin notification ────────────────────────────
            if (notificationsCollection && passengerCollection) {
                notificationHelper.notifyBookingCreated(
                    { notificationsCollection, passengerCollection },
                    { _id: bookingId, ...bookingData }
                ).catch((e) => console.error("Notification error:", e.message));
            }

            // NOTE: Expiry is handled at query time (GET /) via expiresAt field.
            // setTimeout is NOT used here — it does not work reliably on Vercel serverless.

            res.status(201).json({
                success: true,
                booking: { _id: bookingId, ...bookingData },
            });
        } catch (error) {
            console.error("POST /bookings error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create booking",
                error: IS_DEV ? error.message : undefined,
            });
        }
    });

    // ── POST /api/bookings/fare-estimate ──────────────────────
    router.post("/fare-estimate", async (req, res) => {
        try {
            const { distance, duration } = req.body;
            if (distance === undefined || duration === undefined) {
                return res.status(400).json({ success: false, message: "distance and duration are required" });
            }

            const rates = {
                bike:    { base: 30,  perKm: 12, perMin: 2 },
                car:     { base: 50,  perKm: 25, perMin: 3 },
                premium: { base: 100, perKm: 45, perMin: 5 },
            };

            const estimates = Object.entries(rates).map(([type, rate]) => ({
                type,
                estimatedPrice: Math.round(rate.base + distance * rate.perKm + duration * rate.perMin),
                currency: "BDT",
            }));

            res.status(200).json({ success: true, estimates });
        } catch (error) {
            res.status(500).json({ success: false, error: IS_DEV ? error.message : "Server error" });
        }
    });

    // ── GET /api/bookings/:id ─────────────────────────────────
    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid Booking ID" });
            }

            const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });
            if (!booking) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            res.json({ success: true, booking });
        } catch (error) {
            console.error("GET /bookings/:id error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch booking",
                error: IS_DEV ? error.message : undefined,
            });
        }
    });

    // ── PATCH /api/bookings/:id ───────────────────────────────
    router.patch("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { bookingStatus } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid Booking ID" });
            }

            const result = await bookingsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { bookingStatus, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            if (["completed", "cancelled"].includes(bookingStatus) && ridersCollection) {
                const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });
                if (booking?.riderId && ObjectId.isValid(booking.riderId.toString())) {
                    await ridersCollection.updateOne(
                        { _id: new ObjectId(booking.riderId.toString()) },
                        { $set: { status: "online", currentRideId: null, updatedAt: new Date() } }
                    ).catch((e) => console.error("Rider reset error:", e.message));

                    // Notify passenger
                    if (booking.passengerId) {
                        const pid = booking.passengerId.toString();
                        await socketEmit(`ride:${bookingStatus}`, `passenger:${pid}`, { bookingId: id });
                    }
                }
            }

            res.json({ success: true, message: "Booking updated", bookingStatus });
        } catch (error) {
            console.error("PATCH /bookings/:id error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update booking",
                error: IS_DEV ? error.message : undefined,
            });
        }
    });

    // ── PATCH /api/bookings/:id/status ────────────────────────
    router.patch("/:id/status", async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid ID" });
            }

            const result = await bookingsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { bookingStatus: status, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            if (["completed", "cancelled"].includes(status) && ridersCollection) {
                const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });
                if (booking?.riderId && ObjectId.isValid(booking.riderId.toString())) {
                    await ridersCollection.updateOne(
                        { _id: new ObjectId(booking.riderId.toString()) },
                        { $set: { status: "online", currentRideId: null, updatedAt: new Date() } }
                    ).catch((e) => console.error("Rider reset error:", e.message));
                }
            }

            res.json({ success: true, bookingStatus: status });
        } catch (error) {
            console.error("PATCH /bookings/:id/status error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    });

    // ── DELETE /api/bookings/:id ──────────────────────────────
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid Booking ID" });
            }

            const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            res.json({ success: true, message: "Booking deleted" });
        } catch (error) {
            console.error("DELETE /bookings/:id error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete booking",
                error: IS_DEV ? error.message : undefined,
            });
        }
    });

    // ── POST /api/bookings/bulk-delete ────────────────────────
    router.post("/bulk-delete", async (req, res) => {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ success: false, message: "ids array is required" });
            }

            const validIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
            if (validIds.length === 0) {
                return res.status(400).json({ success: false, message: "No valid IDs provided" });
            }

            const result = await bookingsCollection.deleteMany({ _id: { $in: validIds } });
            res.json({
                success: true,
                message: `${result.deletedCount} bookings deleted`,
                deletedCount: result.deletedCount,
            });
        } catch (error) {
            console.error("Bulk delete error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to bulk delete",
                error: IS_DEV ? error.message : undefined,
            });
        }
    });

    return router;
};
