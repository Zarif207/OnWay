import axios from "axios";

/**
 * Enhanced routing service with better network error handling and CORS support
 */

// Multiple OSRM endpoints with CORS-friendly alternatives
const OSRM_ENDPOINTS = [
  "https://router.project-osrm.org",
  "https://routing.openstreetmap.de/routed-car",
  // Add a local fallback or proxy if needed
];

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test network connectivity before making requests
 */
const testNetworkConnectivity = async () => {
  try {
    // Simple connectivity test
    const response = await fetch('https://httpbin.org/get', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.warn('Network connectivity test failed:', error.message);
    return false;
  }
};

/**
 * Fetches optimized routing data with enhanced error handling
 * @param {Object} pickup - { lat, lon }
 * @param {Object} dropoff - { lat, lon }
 * @returns {Promise<Object>} { distanceKm, durationMin, geometry, waypoints }
 */
export const getDrivingRoute = async (pickup, dropoff) => {
  if (!pickup || !dropoff || !pickup.lat || !pickup.lon || !dropoff.lat || !dropoff.lon) {
    throw new Error("Invalid pickup or dropoff coordinates");
  }

  // Validate coordinates
  if (Math.abs(pickup.lat) > 90 || Math.abs(pickup.lon) > 180 ||
      Math.abs(dropoff.lat) > 90 || Math.abs(dropoff.lon) > 180) {
    throw new Error("Invalid coordinate values");
  }

  // Check network connectivity first
  const hasNetwork = await testNetworkConnectivity();
  if (!hasNetwork) {
    console.warn('⚠️ Network connectivity issues detected, using fallback route');
    return createFallbackRoute(pickup, dropoff);
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  // Try each endpoint with progressively shorter timeouts
  const timeouts = [3000, 2000, 1500]; // Reduced timeouts for faster fallback
  
  for (let i = 0; i < OSRM_ENDPOINTS.length; i++) {
    const baseUrl = OSRM_ENDPOINTS[i];
    const timeout = timeouts[i] || 1500;
    
    try {
      console.log(`🔄 Trying OSRM endpoint ${i + 1}/${OSRM_ENDPOINTS.length}: ${baseUrl}`);
      
      // OSRM requires coordinates in [longitude, latitude] format
      const coordinates = `${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}`;
      const url = `${baseUrl}/route/v1/driving/${coordinates}`;
      
      const params = {
        overview: 'full',
        geometries: 'geojson',
        steps: 'false', // Reduce response size
        annotations: 'false' // Reduce response size
      };
      
      const response = await axios.get(url, {
        params,
        timeout,
        headers: {
          'User-Agent': 'OnWay-RideSharing-App/1.0',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        // Add CORS and network error handling
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        },
        maxRedirects: 3,
        // Handle network errors gracefully
        transformResponse: [function (data) {
          try {
            return JSON.parse(data);
          } catch (error) {
            throw new Error('Invalid response format from routing service');
          }
        }]
      });

      if (!response.data || !response.data.routes || response.data.routes.length === 0) {
        console.warn(`⚠️ No routes found from endpoint: ${baseUrl}`);
        continue; // Try next endpoint
      }

      const route = response.data.routes[0];
      
      // Validate route data
      if (!route.geometry || !route.geometry.coordinates || route.geometry.coordinates.length === 0) {
        console.warn(`⚠️ Invalid route geometry from endpoint: ${baseUrl}`);
        continue; // Try next endpoint
      }

      // Convert distance from meters to kilometers (rounded to 2 decimal places)
      const distanceKm = Math.round((route.distance / 1000) * 100) / 100;
      
      // Convert duration from seconds to minutes (rounded up)
      const durationMin = Math.ceil(route.duration / 60);

      // Convert GeoJSON coordinates [longitude, latitude] to Leaflet format [latitude, longitude]
      const geometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

      // Extract waypoints for better route visualization
      const waypoints = response.data.waypoints ? response.data.waypoints.map(wp => ({
        lat: wp.location[1],
        lon: wp.location[0],
        name: wp.name || 'Waypoint'
      })) : [];

      console.log(`✅ Route calculated successfully using endpoint: ${baseUrl}`);
      
      return {
        distanceKm,
        durationMin,
        geometry,
        waypoints,
        // Additional route information
        routeInfo: {
          confidence: route.confidence || 0,
          weight: route.weight || 0,
          weightName: route.weight_name || 'routability',
          legs: route.legs ? route.legs.length : 1,
          endpoint: baseUrl,
          isFallback: false
        }
      };

    } catch (error) {
      console.warn(`❌ Endpoint ${baseUrl} failed:`, error.message);
      
      // Log specific error types for debugging
      if (error.code === 'ECONNABORTED') {
        console.warn(`⏱️ Timeout on ${baseUrl} after ${timeout}ms`);
      } else if (error.code === 'ERR_NETWORK') {
        console.warn(`🌐 Network error on ${baseUrl}`);
      } else if (error.code === 'ERR_CORS') {
        console.warn(`🔒 CORS error on ${baseUrl}`);
      }
      
      // If this is the last endpoint, handle the error
      if (i === OSRM_ENDPOINTS.length - 1) {
        console.warn('🔄 All OSRM endpoints failed, creating fallback route');
        return createFallbackRoute(pickup, dropoff);
      }
      
      // Otherwise, continue to next endpoint
      continue;
    }
  }

  // If all endpoints fail, return fallback route
  return createFallbackRoute(pickup, dropoff);
};

/**
 * Create a fallback straight-line route when OSRM fails
 */
const createFallbackRoute = (pickup, dropoff) => {
  console.log("🔄 Creating fallback straight-line route");
  
  // Calculate straight-line distance using Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
  const dLon = (dropoff.lon - pickup.lon) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pickup.lat * Math.PI / 180) * Math.cos(dropoff.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const straightLineDistance = R * c;
  
  // Estimate driving distance (usually 1.3x straight line distance in urban areas)
  const distanceKm = Math.round(straightLineDistance * 1.3 * 100) / 100;
  
  // Estimate duration (assuming 25 km/h average speed in city with traffic)
  const durationMin = Math.ceil((distanceKm / 25) * 60);
  
  // Create simple straight line geometry
  const geometry = [
    [pickup.lat, pickup.lon],
    [dropoff.lat, dropoff.lon]
  ];
  
  return {
    distanceKm,
    durationMin,
    geometry,
    waypoints: [
      { lat: pickup.lat, lon: pickup.lon, name: 'Start' },
      { lat: dropoff.lat, lon: dropoff.lon, name: 'End' }
    ],
    routeInfo: {
      confidence: 0.5,
      weight: distanceKm,
      weightName: 'fallback',
      legs: 1,
      endpoint: 'fallback',
      isFallback: true
    }
  };
};

/**
 * Get multiple route alternatives with enhanced error handling
 */
export const getRouteAlternatives = async (pickup, dropoff, alternatives = 2) => {
  if (!pickup || !dropoff) {
    throw new Error("Invalid pickup or dropoff coordinates");
  }

  try {
    const coordinates = `${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}`;
    const url = `${OSRM_ENDPOINTS[0]}/route/v1/driving/${coordinates}`;
    
    const params = {
      overview: 'full',
      geometries: 'geojson',
      alternatives: Math.min(alternatives, 3),
      steps: 'false'
    };
    
    const response = await axios.get(url, {
      params,
      timeout: 2000, // Shorter timeout for alternatives
      headers: {
        'User-Agent': 'OnWay-RideSharing-App/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.data || !response.data.routes) {
      return [];
    }

    return response.data.routes.map((route, index) => ({
      id: index,
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMin: Math.ceil(route.duration / 60),
      geometry: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
      isPrimary: index === 0
    }));

  } catch (error) {
    console.warn("Failed to get route alternatives:", error.message);
    return [];
  }
};