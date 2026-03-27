// backend/createIndex.js
require("dotenv").config({ path: __dirname + '/.env' });
const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: false }
});

async function run() {
    try {
        await client.connect();
        const db = client.db("onWayDB");

        console.log("Creating riders location 2dsphere index...");
        const result1 = await db.collection("riders").createIndex(
            { location: "2dsphere" }
        );
        console.log("✅ riders index created:", result1);

        console.log("Creating bookings history index...");
        const result2 = await db.collection("bookings").createIndex(
            { bookingStatus: 1, createdAt: -1 }
        );
        console.log("✅ bookings index created:", result2);

        await client.close();
    } catch (err) {
        console.error("❌ Error:", err.message);
        await client.close();
    }
}

run();
