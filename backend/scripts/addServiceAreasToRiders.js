/**
 * Migration Script: Add Service Areas to Riders
 * 
 * This script adds predefined service areas to existing riders in the database.
 * Service areas represent the zones where riders operate and will be used as
 * starting points for simulated ride movements.
 * 
 * Usage: node scripts/addServiceAreasToRiders.js
 */

require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

// Dhaka service areas (different zones)
const SERVICE_AREA_ZONES = {
  gulshan: [
    { lat: 23.7808, lng: 90.4156 },
    { lat: 23.7925, lng: 90.4078 },
    { lat: 23.7856, lng: 90.4234 },
    { lat: 23.7745, lng: 90.4189 }
  ],
  dhanmondi: [
    { lat: 23.7461, lng: 90.3742 },
    { lat: 23.7556, lng: 90.3689 },
    { lat: 23.7512, lng: 90.3812 },
    { lat: 23.7423, lng: 90.3798 }
  ],
  banani: [
    { lat: 23.7937, lng: 90.4066 },
    { lat: 23.7989, lng: 90.4012 },
    { lat: 23.7856, lng: 90.4123 },
    { lat: 23.7912, lng: 90.4145 }
  ],
  mirpur: [
    { lat: 23.8223, lng: 90.3654 },
    { lat: 23.8156, lng: 90.3712 },
    { lat: 23.8289, lng: 90.3589 },
    { lat: 23.8178, lng: 90.3623 }
  ],
  uttara: [
    { lat: 23.8759, lng: 90.3795 },
    { lat: 23.8689, lng: 90.3856 },
    { lat: 23.8823, lng: 90.3912 },
    { lat: 23.8712, lng: 90.3734 }
  ],
  motijheel: [
    { lat: 23.7334, lng: 90.4178 },
    { lat: 23.7289, lng: 90.4234 },
    { lat: 23.7412, lng: 90.4156 },
    { lat: 23.7367, lng: 90.4089 }
  ]
};

// Get random zone for a rider
function getRandomServiceArea() {
  const zones = Object.keys(SERVICE_AREA_ZONES);
  const randomZone = zones[Math.floor(Math.random() * zones.length)];
  return SERVICE_AREA_ZONES[randomZone];
}

async function migrateRiders() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const database = client.db("onWayDB");
    const ridersCollection = database.collection("riders");

    // Find all riders without service areas
    const riders = await ridersCollection.find({
      $or: [
        { serviceAreas: { $exists: false } },
        { serviceAreas: { $size: 0 } }
      ]
    }).toArray();

    console.log(`📊 Found ${riders.length} riders without service areas`);

    if (riders.length === 0) {
      console.log("✅ All riders already have service areas");
      return;
    }

    let updated = 0;
    for (const rider of riders) {
      const serviceAreas = getRandomServiceArea();
      
      await ridersCollection.updateOne(
        { _id: rider._id },
        {
          $set: {
            serviceAreas: serviceAreas,
            simulatedLocation: null, // Reset any existing simulated location
            updatedAt: new Date()
          }
        }
      );

      updated++;
      console.log(`✅ Updated rider ${rider.name || rider.email} with service areas`);
    }

    console.log(`\n🎉 Migration complete! Updated ${updated} riders`);
    console.log("\nService areas assigned:");
    console.log("- Gulshan zone");
    console.log("- Dhanmondi zone");
    console.log("- Banani zone");
    console.log("- Mirpur zone");
    console.log("- Uttara zone");
    console.log("- Motijheel zone");

  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await client.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run migration
migrateRiders();
