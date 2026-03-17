const { ObjectId } = require("mongodb");
const Rider = require("../models/Rider");

const riderController = (collections) => {
    const riderModel = new Rider(collections.ridersCollection);

    return {
        // GET /api/riders/:id
        getRiderById: async (req, res) => {
            try {
                const rider = await riderModel.findById(req.params.id);
                if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });
                res.status(200).json({ success: true, data: rider });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // PATCH /api/riders/:id/status
        updateStatus: async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;

                const allowed = ["online", "offline", "busy"];
                if (!allowed.includes(status)) {
                    return res.status(400).json({ success: false, message: "Invalid status" });
                }

                await riderModel.updateStatus(id, status);
                res.status(200).json({ success: true, status });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        // GET /api/riders/dashboard/:id
        getDashboardStats: async (req, res) => {
            try {
                const { id } = req.params;
                const riderId = id;
                const rider = await riderModel.findById(riderId);
                if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

                const bookingsCollection = collections.bookingsCollection;
                // Fetch rides associated with this rider
                const rides = await bookingsCollection.find({
                    riderId: new ObjectId(riderId)
                }).toArray();

                const todayStr = new Date().toISOString().split("T")[0];
                let todayEarnings = 0;
                let totalEarnings = 0;
                let completedRides = 0;
                let ongoingRide = null;

                rides.forEach(ride => {
                    const fare = parseFloat(ride.fare || ride.price) || 0;
                    if (ride.bookingStatus === "completed") {
                        completedRides++;
                        totalEarnings += fare;
                        if (ride.createdAt && new Date(ride.createdAt).toISOString().split("T")[0] === todayStr) {
                            todayEarnings += fare;
                        }
                    }
                    if (["accepted", "arrived", "started"].includes(ride.bookingStatus)) {
                        ongoingRide = ride;
                    }
                });

                // Rating logic (placeholder until reviews collection is fully integrated in model)
                const avgRating = rider.rating || 5.0;
                const ratingCount = rider.ratingCount || 0;

                res.json({
                    success: true,
                    data: {
                        status: rider.status || "offline",
                        isApproved: rider.isApproved || false,
                        todayEarnings: todayEarnings.toFixed(2),
                        totalEarnings: totalEarnings.toFixed(2),
                        totalRides: completedRides,
                        avgRating: parseFloat(avgRating).toFixed(1),
                        ratingCount: ratingCount,
                        recentRides: rides.slice(-5).reverse(),
                        ongoingRide: ongoingRide
                    }
                });
            } catch (error) {
                console.error("Dashboard Stats Error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        // GET /api/riders/nearby
        getNearbyRiders: async (req, res) => {
            try {
                const { lat, lng, radius = 5, excludeId } = req.query; // radius in KM
                console.log("🚕 [API] getNearbyRiders called with:", { lat, lng, radius, excludeId });

                let query = {
                    status: "online",
                    isApproved: true
                };

                // Exclude specific rider if needed (e.g. current user)
                if (excludeId && ObjectId.isValid(excludeId)) {
                    query._id = { $ne: new ObjectId(excludeId) };
                }

                // If coordinates provided, use geo-spatial filtering
                if (lat && lng) {
                    query["location.coordinates"] = {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [parseFloat(lng), parseFloat(lat)]
                            },
                            $maxDistance: parseInt(radius) * 1000 // Convert km to meters
                        }
                    };
                }

                const riders = await collections.ridersCollection.find(query).limit(15).toArray();

                // Format for frontend
                const formattedRiders = riders.map(r => ({
                    id: r._id,
                    lat: r.location?.coordinates ? r.location.coordinates[1] : (r.location?.lat || 23.8103),
                    lng: r.location?.coordinates ? r.location.coordinates[0] : (r.location?.lng || 90.4125),
                    name: r.name,
                    vehicle: r.vehicleDetails || r.vehicle || { type: 'car' }
                }));

                res.status(200).json({ success: true, data: formattedRiders });
            } catch (error) {
                console.error("Nearby Riders Error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        }
    };
};

module.exports = riderController;
