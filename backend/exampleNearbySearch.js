// 1. Example Query Logic
const { findNearbyDrivers } = require("./utils/riderMatching");

const pickupLocation = { lat: 23.8103, lng: 90.4125 }; // Dhaka, Bangladesh
const nearbyDrivers = await findNearbyDrivers(ridersCollection, pickupLocation.lat, pickupLocation.lng);

console.log("Found Nearby Drivers:", nearbyDrivers);

// 2. Example Returned Driver List (Array of 5 Nearest Drivers)
[
    {
        "_id": "60d5ecdecb1234567890abcd",
        "name": "Arif Ahmed",
        "email": "arif@example.com",
        "phone": "+8801711223344",
        "location": {
            "type": "Point",
            "coordinates": [90.4130, 23.8105]
        },
        "isOnline": true,
        "isAvailable": true,
        "isApproved": true,
        "rating": 4.8,
        "totalTrips": 150,
        "distance": 85.5 // (Implicitly sorted by distance by MongoDB $near)
    },
    {
        "_id": "60d5ecdecb1234567890abce",
        "name": "Zakir Hossain",
        "email": "zakir@example.com",
        "phone": "+8801811223344",
        "location": {
            "type": "Point",
            "coordinates": [90.4150, 23.8115]
        },
        "isOnline": true,
        "isAvailable": true,
        "isApproved": true,
        "rating": 4.9,
        "totalTrips": 320
    }
    // ... up to 5 drivers
]
