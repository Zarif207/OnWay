/**
 * Ride Simulation Service
 * Handles simulated rider movement from service areas to passenger pickup locations
 */

const activeSimulations = new Map(); // rideId -> { interval, currentLat, currentLng, targetLat, targetLng }

/**
 * Calculate distance between two coordinates in meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find nearest service area to pickup location
 */
function findNearestServiceArea(serviceAreas, pickupLat, pickupLng) {
    if (!serviceAreas || serviceAreas.length === 0) {
        // Default service area (Dhaka center)
        return { lat: 23.8103, lng: 90.4125 };
    }

    let nearest = serviceAreas[0];
    let minDistance = calculateDistance(
        serviceAreas[0].lat,
        serviceAreas[0].lng,
        pickupLat,
        pickupLng
    );

    for (let i = 1; i < serviceAreas.length; i++) {
        const distance = calculateDistance(
            serviceAreas[i].lat,
            serviceAreas[i].lng,
            pickupLat,
            pickupLng
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = serviceAreas[i];
        }
    }

    return nearest;
}

/**
 * Start simulated rider movement
 * @param {string} rideId - Booking ID
 * @param {string} riderId - Rider ID
 * @param {Array} serviceAreas - Rider's service areas
 * @param {number} pickupLat - Passenger pickup latitude
 * @param {number} pickupLng - Passenger pickup longitude
 * @param {Object} io - Socket.io instance
 * @param {Function} onArrival - Callback when rider arrives
 */
function startSimulation(rideId, riderId, serviceAreas, pickupLat, pickupLng, io, onArrival) {
    // Stop existing simulation if any
    stopSimulation(rideId);

    // Find nearest service area as starting point
    const startPoint = findNearestServiceArea(serviceAreas, pickupLat, pickupLng);

    console.log(`🚗 [SIMULATION] Starting for ride ${rideId}`);
    console.log(`📍 Start: ${startPoint.lat}, ${startPoint.lng}`);
    console.log(`🎯 Target: ${pickupLat}, ${pickupLng}`);

    const simulation = {
        rideId,
        riderId,
        currentLat: startPoint.lat,
        currentLng: startPoint.lng,
        targetLat: pickupLat,
        targetLng: pickupLng,
        startTime: Date.now(),
        interval: null
    };

    // Emit initial position
    io.to(`ride:${rideId}`).emit("riderLocationUpdate", {
        rideId,
        riderId,
        lat: simulation.currentLat,
        lng: simulation.currentLng,
        isSimulated: true
    });

    // Broadcast to all passengers
    io.emit("driver:location:updated", {
        rideId,
        riderId,
        lat: simulation.currentLat,
        lng: simulation.currentLng
    });

    // Update every 2 seconds
    simulation.interval = setInterval(() => {
        const distance = calculateDistance(
            simulation.currentLat,
            simulation.currentLng,
            simulation.targetLat,
            simulation.targetLng
        );

        console.log(`📡 [SIMULATION] Ride ${rideId} - Distance: ${distance.toFixed(2)}m`);

        // Check if arrived (within 50 meters)
        if (distance < 50) {
            console.log(`✅ [SIMULATION] Rider arrived at pickup for ride ${rideId}`);

            // Emit arrival event
            io.to(`ride:${rideId}`).emit("riderArrived", {
                rideId,
                riderId,
                message: "Driver arriving soon"
            });

            io.emit("driver:arrived", {
                rideId,
                riderId
            });

            // Stop simulation
            stopSimulation(rideId);

            // Call arrival callback
            if (onArrival) onArrival(rideId, riderId);
            return;
        }

        // Move rider closer to target (5% of remaining distance per update)
        const moveSpeed = 0.05;
        simulation.currentLat += (simulation.targetLat - simulation.currentLat) * moveSpeed;
        simulation.currentLng += (simulation.targetLng - simulation.currentLng) * moveSpeed;

        const updatePayload = {
            rideId,
            riderId,
            latitude: simulation.currentLat,
            longitude: simulation.currentLng,
            distance: distance.toFixed(0),
            eta: Math.ceil(distance / 500), // ~30 km/h average speed (500m/min)
            isSimulated: true
        };

        // Emit location update - Requested event name
        io.to(`ride:${rideId}`).emit("driver-location-update", updatePayload);

        // Also emit riderLocationUpdate for backward compatibility if needed, 
        // but the requirement specifically asked for driver-location-update
        io.to(`ride:${rideId}`).emit("riderLocationUpdate", {
            ...updatePayload,
            lat: simulation.currentLat,
            lng: simulation.currentLng
        });

    }, 2000); // Update every 2 seconds

    activeSimulations.set(rideId, simulation);
    console.log(`✅ [SIMULATION] Started for ride ${rideId}`);
}

/**
 * Stop simulation for a ride
 */
function stopSimulation(rideId) {
    const simulation = activeSimulations.get(rideId);
    if (simulation) {
        clearInterval(simulation.interval);
        activeSimulations.delete(rideId);
        console.log(`🛑 [SIMULATION] Stopped for ride ${rideId}`);
    }
}

/**
 * Get current simulated location for a ride
 */
function getSimulatedLocation(rideId) {
    const simulation = activeSimulations.get(rideId);
    if (simulation) {
        return {
            lat: simulation.currentLat,
            lng: simulation.currentLng
        };
    }
    return null;
}

/**
 * Get all active simulations
 */
function getActiveSimulations() {
    return Array.from(activeSimulations.keys());
}

module.exports = {
    startSimulation,
    stopSimulation,
    getSimulatedLocation,
    getActiveSimulations,
    findNearestServiceArea
};
