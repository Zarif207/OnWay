require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("❌ MONGODB_URI is not defined");
    process.exit(1);
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        const db = client.db("onWayDB");
        const passengers = db.collection("passenger");
        const riders = db.collection("riders");
        const bookings = db.collection("bookings");

        console.log("🛠️ Starting MongoDB Standardization...");

        // --- RIDERS ---
        console.log("📍 Standardizing Riders...");
        await riders.createIndex({ location: "2dsphere" });
        await riders.createIndex({ email: 1 }, { unique: true });
        await riders.createIndex({ isAvailable: 1 });
        await riders.createIndex({ isOnline: 1 });

        // Update existing riders with default values
        await riders.updateMany(
            { isAvailable: { $exists: false } },
            { $set: { isAvailable: true } }
        );
        await riders.updateMany(
            { rating: { $exists: false } },
            { $set: { rating: 5.0 } }
        );
        await riders.updateMany(
            { totalTrips: { $exists: false } },
            { $set: { totalTrips: 0 } }
        );
        // Ensure location field exists for 2dsphere index (defaulting to a known point if missing)
        await riders.updateMany(
            { location: { $exists: false } },
            { $set: { location: { type: "Point", coordinates: [90.4125, 23.8103] } } } // Default to Dhaka
        );

        // --- PASSENGERS ---
        console.log("👤 Standardizing Passengers...");
        await passengers.createIndex({ email: 1 }, { unique: true });
        await passengers.updateMany(
            { rating: { $exists: false } },
            { $set: { rating: 5.0 } }
        );
        await passengers.updateMany(
            { savedLocations: { $exists: false } },
            { $set: { savedLocations: [] } }
        );

        // --- BOOKINGS ---
        console.log("🎫 Standardizing Bookings...");
        await bookings.createIndex({ passengerId: 1 });
        await bookings.createIndex({ riderId: 1 });
        await bookings.createIndex({ bookingStatus: 1 });

        console.log("✅ MongoDB Standardization Complete!");
    } catch (err) {
        console.error("❌ Error during standardization:", err);
    } finally {
        await client.close();
    }
}

run();
