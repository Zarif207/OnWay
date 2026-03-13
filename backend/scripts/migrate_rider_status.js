require("dotenv").config();
const { MongoClient } = require("mongodb");

async function migrate() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("❌ MONGODB_URI not found in environment variables");
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db("onWayDB");
        const ridersCollection = db.collection("riders");

        console.log("🔄 Starting migration for riders status...");

        // 1. Update all riders:
        // - Set status to "offline" if not already set or if it's currently inconsistent
        // - Unset isOnline and isAvailable
        const result = await ridersCollection.updateMany(
            {},
            [
                {
                    $set: {
                        status: {
                            $cond: {
                                if: { $eq: ["$isOnline", true] },
                                then: {
                                    $cond: {
                                        if: { $eq: ["$isAvailable", false] },
                                        then: "busy",
                                        else: "online"
                                    }
                                },
                                else: "offline"
                            }
                        }
                    }
                },
                {
                    $unset: ["isOnline", "isAvailable"]
                }
            ]
        );

        console.log(`✅ Migration complete!`);
        console.log(`📊 Matched documents: ${result.matchedCount}`);
        console.log(`📊 Modified documents: ${result.modifiedCount}`);

        // Verify some results
        const sample = await ridersCollection.find({}).limit(5).toArray();
        console.log("\n🧪 Verification (Sample Results):");
        sample.forEach(rider => {
            console.log(`Rider: ${rider.email || rider._id}, Status: ${rider.status}, isOnline: ${rider.isOnline}, isAvailable: ${rider.isAvailable}`);
        });

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

migrate();
