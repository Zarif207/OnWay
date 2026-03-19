require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const { findNearbyDrivers } = require("../utils/riderMatching");

async function testStatusLogic() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("onWayDB");
        const ridersCollection = db.collection("riders");
        const bookingsCollection = db.collection("bookings");

        // Use the existing rider from migration
        const rider = await ridersCollection.findOne({ email: "zarifhasan696@gmail.com" });
        if (!rider) {
            console.error("❌ Test rider not found. Run migration first.");
            return;
        }

        const riderId = rider._id;
        console.log(`🧪 Testing with Rider: ${rider.email} (${riderId})`);

        // 1. Test Status Toggle (via direct DB update simulating PATCH /status)
        console.log("\n1️⃣ Testing status toggle to 'offline'...");
        await ridersCollection.updateOne({ _id: riderId }, { $set: { status: "offline" } });
        let updatedRider = await ridersCollection.findOne({ _id: riderId });
        console.log(`   Result: status = ${updatedRider.status} (Expected: offline)`);

        // 2. Test Rider Matching (Should NOT find offline rider)
        console.log("\n2️⃣ Testing rider matching (expecting 0 results for offline rider)...");
        let nearby = await findNearbyDrivers(ridersCollection, 23.8103, 90.4125, 5000);
        console.log(`   Result: Found ${nearby.length} drivers (Expected: 0)`);

        // 3. Test Rider Matching (Should find online rider)
        console.log("\n3️⃣ Testing rider matching (expecting 1 result for online rider)...");
        await ridersCollection.updateOne({ _id: riderId }, { $set: { status: "online", isApproved: true } });
        nearby = await findNearbyDrivers(ridersCollection, 23.8103, 90.4125, 10000); // Larger radius just in case
        console.log(`   Result: Found ${nearby.length} drivers (Expected: 1)`);
        if (nearby.length > 0) console.log(`   Driver ID: ${nearby[0]._id}, Status: ${nearby[0].status}`);

        // 4. Test Ride Acceptance (Simulating ride acceptance)
        console.log("\n4️⃣ Testing ride acceptance (simulating socket ride:accept)...");
        // Mock a booking
        const bookingResult = await bookingsCollection.insertOne({
            passengerId: new ObjectId(),
            bookingStatus: "searching",
            createdAt: new Date()
        });
        const bookingId = bookingResult.insertedId;

        // Simulate server.js ride:accept logic
        await ridersCollection.updateOne(
            { _id: riderId },
            { $set: { status: "busy", currentRideId: bookingId } }
        );
        updatedRider = await ridersCollection.findOne({ _id: riderId });
        console.log(`   Result: status = ${updatedRider.status} (Expected: busy)`);

        // 5. Test Ride Completion (Simulating PATCH /api/bookings/:id)
        console.log("\n5️⃣ Testing ride completion (simulating PATCH /api/bookings/:id)...");
        // Update booking status
        await bookingsCollection.updateOne({ _id: bookingId }, { $set: { bookingStatus: "completed" } });

        // Simulate bookings.js logic for resetting rider
        await ridersCollection.updateOne(
            { _id: riderId },
            { $set: { status: "online", currentRideId: null } }
        );
        updatedRider = await ridersCollection.findOne({ _id: riderId });
        console.log(`   Result: status = ${updatedRider.status}, currentRideId = ${updatedRider.currentRideId} (Expected: online, null)`);

        // Cleanup
        await bookingsCollection.deleteOne({ _id: bookingId });
        console.log("\n🧹 Cleanup complete.");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

testStatusLogic();
