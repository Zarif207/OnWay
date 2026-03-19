require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const { findNearbyDrivers } = require("../utils/riderMatching");

async function verifyDispatchLogic() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("onWayDB");
        const ridersCollection = db.collection("riders");

        console.log("🚀 Starting Dispatch Logic Verification...");

        // 1. Setup Test Riders
        const testRiders = [
            {
                email: "online_dhaka@test.com",
                status: "online",
                isApproved: true,
                operationCities: ["Dhaka"],
                location: { type: "Point", coordinates: [90.4125, 23.8103] }, // Dhaka Center
                role: "rider",
                updatedAt: new Date()
            },
            {
                email: "offline_dhaka@test.com",
                status: "offline",
                isApproved: true,
                operationCities: ["Dhaka"],
                location: { type: "Point", coordinates: [90.4125, 23.8103] },
                role: "rider",
                updatedAt: new Date()
            },
            {
                email: "online_chittagong@test.com",
                status: "online",
                isApproved: true,
                operationCities: ["Chittagong"],
                location: { type: "Point", coordinates: [90.4125, 23.8103] }, // Same loc, different city
                role: "rider",
                updatedAt: new Date()
            },
            {
                email: "busy_dhaka@test.com",
                status: "busy",
                isApproved: true,
                operationCities: ["Dhaka"],
                location: { type: "Point", coordinates: [90.4125, 23.8103] },
                role: "rider",
                updatedAt: new Date()
            },
            {
                email: "not_approved_dhaka@test.com",
                status: "online",
                isApproved: false,
                operationCities: ["Dhaka"],
                location: { type: "Point", coordinates: [90.4125, 23.8103] },
                role: "rider",
                updatedAt: new Date()
            }
        ];

        console.log("📝 Inserting test riders...");
        await ridersCollection.deleteMany({ email: { $regex: "@test.com$" } });
        await ridersCollection.insertMany(testRiders);

        // 2. Test Case: Dhaka Pickup (Should only find online_dhaka)
        console.log("\n🧪 Test Case 1: Search in Dhaka (expecting only 'online_dhaka@test.com')");
        const dhakaDrivers = await findNearbyDrivers(ridersCollection, 23.8103, 90.4125, 5000, 5, "Dhaka");
        console.log(`   Found ${dhakaDrivers.length} drivers:`, dhakaDrivers.map(d => d.email));

        const dhakaOk = dhakaDrivers.length === 1 && dhakaDrivers[0].email === "online_dhaka@test.com";
        console.log(`   Status: ${dhakaOk ? "✅ PASSED" : "❌ FAILED"}`);

        // 3. Test Case: No City Provided (Should find online_dhaka and online_chittagong if radii match)
        console.log("\n🧪 Test Case 2: Search without city (expecting online_dhaka and online_chittagong)");
        const mixedDrivers = await findNearbyDrivers(ridersCollection, 23.8103, 90.4125, 5000, 5, null);
        console.log(`   Found ${mixedDrivers.length} drivers:`, mixedDrivers.map(d => d.email));

        const mixedOk = mixedDrivers.length === 2 && mixedDrivers.some(d => d.email === "online_dhaka@test.com") && mixedDrivers.some(d => d.email === "online_chittagong@test.com");
        console.log(`   Status: ${mixedOk ? "✅ PASSED" : "❌ FAILED"}`);

        // 4. Test Case: Unapproved/Busy/Offline
        console.log("\n🧪 Test Case 3: Verify busy/offline/unapproved are excluded");
        const excludedExisted = dhakaDrivers.some(d => ["offline_dhaka@test.com", "busy_dhaka@test.com", "not_approved_dhaka@test.com"].includes(d.email));
        console.log(`   Exclusion working: ${!excludedExisted ? "✅ PASSED" : "❌ FAILED"}`);

        // Cleanup
        await ridersCollection.deleteMany({ email: { $regex: "@test.com$" } });
        console.log("\n🧹 Cleanup complete.");

    } catch (error) {
        console.error("❌ Verification failed:", error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

verifyDispatchLogic();
