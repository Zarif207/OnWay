const { ObjectId } = require("mongodb");

/**
 * Finds nearby available drivers within a specified radius using MongoDB geospatial queries.
 * 
 * @param {Collection} ridersCollection - The MongoDB riders collection instance.
 * @param {Number} lat - Pickup latitude.
 * @param {Number} lng - Pickup longitude.
 * @param {Number} maxDistanceMeters - Maximum search radius in meters (default 5000 / 5km).
 * @param {Number} limit - Maximum number of drivers to return (default 5).
 * @returns {Promise<Array>} - Array of nearby driver documents.
 */
async function findNearbyDrivers(ridersCollection, lat, lng, maxDistanceMeters = 5000, limit = 5, city = null) {
    try {
        const query = {
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)], // [lng, lat]
                    },
                    $maxDistance: maxDistanceMeters,
                },
            },
            status: "online", // Must be online
            isApproved: true, // Must be approved
            vacationMode: { $ne: true } // Ensure they are NOT on vacation
        };

        // If city is provided, ensure rider operates in that city
        if (city) {
            query.operationCities = { $in: [city] };
        }

        const nearbyDrivers = await ridersCollection
            .find(query)
            .limit(limit)
            .toArray();

        return nearbyDrivers;
    } catch (error) {
        console.error("❌ Error finding nearby drivers:", error);
        throw error;
    }
}

module.exports = { findNearbyDrivers };
