/**
 * Socket Store - In-memory tracker for connected riders
 * Optimized for real-time dispatching and location broadcasting.
 */

const onlineRiders = new Map(); // riderId -> { lat, lng, socketId, lastUpdate, status, isApproved, operationCities }

/**
 * Calculate Haversine distance between two coordinates in kilometers
 */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

module.exports = {
    setRider: (riderId, data) => {
        const existing = onlineRiders.get(riderId) || {};
        onlineRiders.set(riderId, { ...existing, ...data, lastUpdate: new Date() });
    },

    removeRider: (riderId) => {
        onlineRiders.delete(riderId);
    },

    getRider: (riderId) => {
        return onlineRiders.get(riderId);
    },

    getAllRiders: () => {
        return Object.fromEntries(onlineRiders);
    },

    /**
     * Find nearby riders using in-memory Haversine distance
     * @param {number} lat - Pickup latitude
     * @param {number} lng - Pickup longitude
     * @param {number} radiusKm - Search radius in km
     * @param {string} city - Optional city filter
     */
    findNearbyRiders: (lat, lng, radiusKm = 5, city = null) => {
        const nearby = [];
        for (const [riderId, rider] of onlineRiders.entries()) {
            if (rider.lat === undefined || rider.lng === undefined) continue;

            // Basic Status Filters
            if (rider.status !== "online") continue;
            if (rider.isApproved === false) continue;
            if (rider.vacationMode === true) continue;

            // City Filter
            if (city && rider.operationCities) {
                if (!rider.operationCities.includes(city)) continue;
            }

            const distance = getDistance(lat, lng, rider.lat, rider.lng);
            if (distance <= radiusKm) {
                nearby.push({ ...rider, distance, _id: riderId });
            }
        }
        // Sort by closest
        return nearby.sort((a, b) => a.distance - b.distance);
    }
};
