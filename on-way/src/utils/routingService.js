import axios from "axios";

/**
 * Fetches routing data from the OSRM public API.
 * @param {Object} pickup - { lat, lon }
 * @param {Object} dropoff - { lat, lon }
 * @returns {Promise<Object>} { distance (km), duration (mins), geometry (array of [lat, lon]) }
 */
export const getDrivingRoute = async (pickup, dropoff) => {
  if (!pickup || !dropoff) return null;

  try {
    // Use the OpenStreetMap Germany endpoint which is often more stable than the project-osrm demo server
    const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson`;

    const response = await axios.get(url);

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];

      const distanceKm = +(route.distance / 1000).toFixed(2);
      const durationMin = Math.ceil(route.duration / 60);
      const geometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

      return {
        distanceKm,
        durationMin,
        geometry
      };
    }
    return null;
  } catch (error) {
    console.error("OSRM Routing Error (Falling back to straight line):", error);

    // Fallback logic: Calculate straight-line distance if API fails
    // This allows the user to still book a ride even if the routing server is down
    const lat1 = pickup.lat;
    const lon1 = pickup.lon;
    const lat2 = dropoff.lat;
    const lon2 = dropoff.lon;

    // Haversine formula for distance
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = +(R * c * 1.2).toFixed(2); // 1.2 factor for road winding approximation

    const durationMin = Math.ceil(distanceKm * 3); // Approx 3 min per KM

    return {
      distanceKm,
      durationMin,
      geometry: [[lat1, lon1], [lat2, lon2]] // Straight line geometry
    };
  }
};
