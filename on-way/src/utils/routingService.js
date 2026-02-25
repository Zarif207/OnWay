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
    // OSRM requires coordinates in [longitude, latitude] format
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson`;
    
    const response = await axios.get(url);

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      
      // Convert distance from meters to kilometers
      const distanceKm = +(route.distance / 1000).toFixed(2);
      
      // Convert duration from seconds to minutes
      const durationMin = Math.ceil(route.duration / 60);

      // GeoJSON returns coordinates as [longitude, latitude]
      // Leaflet Polyline expects [latitude, longitude], so we map it
      const geometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

      return {
        distanceKm,
        durationMin,
        geometry
      };
    }
    return null;
  } catch (error) {
    console.error("OSRM Routing Error:", error);
    throw new Error("Failed to calculate route. Please try again.");
  }
};
