// backend/fixLocations.js
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: false }
});

async function fix() {
    await client.connect();
    const db = client.db("onWayDB");

    // Dhaka এর সঠিক coordinates দিয়ে সব rider update করো
    const result = await db.collection("riders").updateMany(
        {},
        {
            $set: {
                location: {
                    type: "Point",
                    coordinates: [90.4125, 23.8103], // Dhaka [lng, lat]
                }
            }
        }
    );

    console.log(`✅ Updated ${result.modifiedCount} riders`);
    await client.close();
}

fix();