// backend/scripts/fixRiderCoordinates.js
require("dotenv").config({ path: __dirname + '/../.env' });
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not set in the .env file.");
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
    console.log("Connected correctly to server");
    const db = client.db("onWayDB");
    const ridersCollection = db.collection("riders");

    const cursor = ridersCollection.find({});
    let fixedCount = 0;

    for await (const doc of cursor) {
      let needsFix = false;
      let newLocation = doc.location;

      if (doc.location && doc.location.type === "Point" && Array.isArray(doc.location.coordinates)) {
        // usually if someone makes a mistake they put [lat, lng] and lat in BD is ~23, lng is ~90
        // standard is [lng, lat]
        const [coord1, coord2] = doc.location.coordinates;
        
        // If first coordinate is latitude (e.g. 23.x), swap them (Dhaka is ~23 lat, ~90 lng)
        // Lng should be around 88-92, Lat should be 20-26 in Bangladesh.
        if (coord1 > 20 && coord1 < 27 && coord2 > 88 && coord2 < 93) {
          console.log(`Fixing coordinates for rider ${doc._id}. Swapping [${coord1}, ${coord2}] to [${coord2}, ${coord1}]`);
          newLocation.coordinates = [coord2, coord1];
          needsFix = true;
        }
      }

      if (needsFix) {
        await ridersCollection.updateOne(
          { _id: doc._id },
          { $set: { location: newLocation } }
        );
        fixedCount++;
      }
    }

    console.log(`✅ Fixed coordinates for ${fixedCount} riders.`);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

run();
