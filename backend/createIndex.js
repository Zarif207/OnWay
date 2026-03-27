/**
 * Run once to create required MongoDB indexes.
 * Usage: node createIndex.js
 */
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

async function createIndexes() {
    const client = new MongoClient(process.env.MONGODB_URI, {
        serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: true },
    });

    try {
        await client.connect();
        const db = client.db("onWayDB");

        // 2dsphere index for geospatial $near queries on riders
        await db.collection("riders").createIndex({ location: "2dsphere" });
        console.log("✅ riders.location 2dsphere index created");

        // Booking expiry index (TTL not used here, but useful for queries)
        await db.collection("bookings").createIndex({ createdAt: -1 });
        await db.collection("bookings").createIndex({ bookingStatus: 1, createdAt: 1 });
        await db.collection("bookings").createIndex({ passengerId: 1 });
        await db.collection("bookings").createIndex({ riderId: 1 });
        console.log("✅ bookings indexes created");

        await db.collection("notifications").createIndex({ userId: 1, createdAt: -1 });
        console.log("✅ notifications index created");

        console.log("\n✅ All indexes created successfully");
    } catch (err) {
        console.error("❌ Index creation failed:", err);
    } finally {
        await client.close();
    }
}

createIndexes();
