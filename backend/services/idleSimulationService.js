/**
 * Idle Simulation Service
 * Handles spawning and random movement of idle riders to make the map feel alive.
 */

const { ObjectId } = require("mongodb");

const RIDER_NAMES = ["Rahat", "Zarif", "Hasan", "Nafis", "Sifat", "Tanvir", "Fahim", "Nabil", "Sakib", "Tamim"];
const VEHICLES = [
    { type: "Car", brand: "Toyota", plate: "DHK-METRO-KA-1234", color: "White" },
    { type: "Car", brand: "Honda", plate: "DHK-METRO-GA-5678", color: "Silver" },
    { type: "Car", brand: "Nissan", plate: "DHK-METRO-LA-9012", color: "Black" },
    { type: "Bike", brand: "Yamaha", plate: "DHK-METRO-HA-3456", color: "Blue" },
    { type: "Bike", brand: "Suzuki", plate: "DHK-METRO-ZA-7890", color: "Red" }
];

const DHAKA_BOUNDS = {
    minLat: 23.70,
    maxLat: 23.90,
    minLng: 90.35,
    maxLng: 90.45
};

let idleInterval = null;

/**
 * Initialize idle simulation
 */
async function initIdleSimulation(collections, io) {
    console.log("🚕 [IDLE SIMULATION] Initializing...");

    try {
        const ridersCollection = collections.ridersCollection;

        // 1. Ensure we have 10-20 riders
        const existingRidersCount = await ridersCollection.countDocuments();
        if (existingRidersCount < 10) {
            const ridersToSpawn = 15 - existingRidersCount;
            console.log(`🚕 [IDLE SIMULATION] Spawning ${ridersToSpawn} new riders...`);

            for (let i = 0; i < ridersToSpawn; i++) {
                const name = RIDER_NAMES[Math.floor(Math.random() * RIDER_NAMES.length)] + " " + (i + 1);
                const vehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
                const lat = DHAKA_BOUNDS.minLat + Math.random() * (DHAKA_BOUNDS.maxLat - DHAKA_BOUNDS.minLat);
                const lng = DHAKA_BOUNDS.minLng + Math.random() * (DHAKA_BOUNDS.maxLng - DHAKA_BOUNDS.minLng);

                await ridersCollection.insertOne({
                    name,
                    email: `rider${Date.now()}${i}@onway.com`,
                    phone: `+88017${Math.floor(10000000 + Math.random() * 9999999)}`,
                    status: "online",
                    isApproved: true,
                    vehicleDetails: vehicle,
                    vehicleType: vehicle.type.toLowerCase(),
                    rating: (4.5 + Math.random() * 0.5).toFixed(1),
                    location: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    serviceAreas: [
                        { lat, lng },
                        { lat: lat + 0.01, lng: lng + 0.01 },
                        { lat: lat - 0.01, lng: lng - 0.01 }
                    ],
                    updatedAt: new Date(),
                    createdAt: new Date()
                });
            }
        }

        // 2. Start movement interval (every 2 seconds)
        if (idleInterval) clearInterval(idleInterval);

        idleInterval = setInterval(async () => {
            try {
                // Find all online riders who are NOT busy
                const onlineRiders = await ridersCollection.find({ status: "online" }).toArray();

                const riderUpdates = [];

                for (const rider of onlineRiders) {
                    // Slight random movement (approx 10-20 meters)
                    const latOffset = (Math.random() - 0.5) * 0.0002;
                    const lngOffset = (Math.random() - 0.5) * 0.0002;

                    const newLat = rider.location.coordinates[1] + latOffset;
                    const newLng = rider.location.coordinates[0] + lngOffset;

                    // Keep within Dhaka bounds roughly
                    const safeLat = Math.max(DHAKA_BOUNDS.minLat, Math.min(DHAKA_BOUNDS.maxLat, newLat));
                    const safeLng = Math.max(DHAKA_BOUNDS.minLng, Math.min(DHAKA_BOUNDS.maxLng, newLng));

                    await ridersCollection.updateOne(
                        { _id: rider._id },
                        {
                            $set: {
                                "location.coordinates": [safeLng, safeLat],
                                updatedAt: new Date()
                            }
                        }
                    );

                    riderUpdates.push({
                        id: rider._id.toString(),
                        lat: safeLat,
                        lng: safeLng,
                        name: rider.name,
                        vehicle: rider.vehicleDetails,
                        rating: rider.rating
                    });
                }

                // Broadcast to all passengers
                if (io) {
                    io.emit("ridersNearby", riderUpdates);
                    // Also for backward compatibility
                    io.emit("riders:update", riderUpdates);
                }

            } catch (err) {
                console.error("❌ [IDLE SIMULATION] Interval Error:", err);
            }
        }, 2000);

        console.log("✅ [IDLE SIMULATION] Service started.");

    } catch (error) {
        console.error("❌ [IDLE SIMULATION] Init Error:", error);
    }
}

module.exports = { initIdleSimulation };
