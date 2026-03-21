import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Get driving route via backend proxy (avoids CORS/timeout issues with OSRM)
 * @param {Object} pickup  - { lat, lon }
 * @param {Object} dropoff - { lat, lon }
 */
export const getDrivingRoute = async (pickup, dropoff) => {
  if (!pickup?.lat || !pickup?.lon || !dropoff?.lat || !dropoff?.lon) {
    throw new Error("Invalid pickup or dropoff coordinates");
  }

  try {
    const res = await axios.get(`${API_BASE_URL}/routing/drive`, {
      params: {
        pickLat: pickup.lat,
        pickLon: pickup.lon,
        dropLat: dropoff.lat,
        dropLon: dropoff.lon,
      },
      timeout: 15000,
    });

    if (!res.data?.success) throw new Error("Routing failed");

    const { distanceKm, durationMin, geometry } = res.data.data;

    return {
      distanceKm,
      durationMin,
      geometry,
      waypoints: [],
      routeInfo: {
        isFallback: res.data.isFallback || false,
        endpoint: "backend-proxy",
      },
    };
  } catch (err) {
    console.error("Routing error:", err.message);
    return createFallbackRoute(pickup, dropoff);
  }
};

/**
 * Straight-line fallback when all routing fails
 */
export const createFallbackRoute = (pickup, dropoff) => {
  const R = 6371;
  const dLat = ((dropoff.lat - pickup.lat) * Math.PI) / 180;
  const dLon = ((dropoff.lon - pickup.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((pickup.lat * Math.PI) / 180) *
      Math.cos((dropoff.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const straightKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(straightKm * 1.3 * 100) / 100;
  const durationMin = Math.ceil((distanceKm / 25) * 60);

  return {
    distanceKm,
    durationMin,
    geometry: [
      [pickup.lat, pickup.lon],
      [dropoff.lat, dropoff.lon],
    ],
    waypoints: [],
    routeInfo: { isFallback: true, endpoint: "fallback" },
  };
};

/**
 * Get route alternatives
 */
export const getRouteAlternatives = async (pickup, dropoff) => {
  // Single route for now via proxy
  try {
    const primary = await getDrivingRoute(pickup, dropoff);
    return [{ ...primary, id: 0, isPrimary: true }];
  } catch {
    return [];
  }
};
