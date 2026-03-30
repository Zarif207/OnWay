"use client";

import axios from "axios";

/**
 * Enhanced geocoding service using backend proxy
 * Provides accurate location search with better error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const GEOCODING_API = `${API_BASE_URL}/geocoding`;

// Global suggestions cache to prevent redundant API calls
const suggestionCache = new Map();
// Global Promise queue to strictly serialize all geocoding requests (ratelimit protection)
let globalRequestQueue = Promise.resolve();
const SERIAL_DELAY = 1200; // 1.2s gap between API hits

/**
 * Geocode an address to coordinates with enhanced accuracy
 * @param {string} query - The address or location name to search
 * @param {string} countryCode - Optional country code (e.g., 'BD' for Bangladesh)
 * @returns {Promise<Object|null>} Location object with lat, lon, name, and additional details
 */
export const geocodeAddress = async (query, countryCode = 'BD', signal = null) => {
  if (!query || query.trim().length < 3) {
    throw new Error("Please enter at least 3 characters");
  }

  try {
    const response = await axios.get(`${GEOCODING_API}/search`, {
      params: {
        q: query.trim(),
        countryCode: countryCode,
        limit: 5
      },
      timeout: 10000,
      signal: signal
    });

    if (!response.data || !response.data.success || response.data.data.length === 0) {
      throw new Error("Location not found. Try a more specific address.");
    }

    // Get the best result (first one is usually most relevant)
    const result = response.data.data[0];

    // Validate coordinates
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error("Invalid coordinates received");
    }

    return {
      lat,
      lon,
      name: result.name,
      address: result.address || {},
      type: result.type || 'unknown',
      importance: result.importance || 0,
      boundingBox: result.boundingbox ? {
        south: parseFloat(result.boundingbox[0]),
        north: parseFloat(result.boundingbox[1]),
        west: parseFloat(result.boundingbox[2]),
        east: parseFloat(result.boundingbox[3])
      } : null
    };

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error("Request timeout. Please check your internet connection.");
    }

    if (error.response) {
      if (error.response.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      throw new Error(`Geocoding service error: ${error.response.status}`);
    }

    if (error.message.includes('Location not found')) {
      throw error;
    }

    throw new Error("Failed to find location. Please try again.");
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object|null>} Address information
 */
export const reverseGeocode = async (lat, lon) => {
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    throw new Error("Invalid coordinates provided");
  }

  try {
    const response = await axios.get(`${GEOCODING_API}/reverse`, {
      params: {
        lat: lat.toString(),
        lon: lon.toString()
      },
      timeout: 10000
    });

    if (!response.data || !response.data.success || !response.data.data) {
      return {
        lat,
        lon,
        name: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        address: {}
      };
    }

    const result = response.data.data;
    return {
      lat,
      lon,
      name: result.name,
      address: result.address || {}
    };

  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return {
      lat,
      lon,
      name: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      address: {}
    };
  }
};

/**
 * Get multiple location suggestions for autocomplete
 * @param {string} query - Search query
 * @param {string} countryCode - Country code
 * @returns {Promise<Array>} Array of location suggestions
 */
export const getLocationSuggestions = async (query, countryCode = 'BD', signal = null) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cacheKey = `${query.trim()}_${countryCode}`;
  if (suggestionCache.has(cacheKey)) {
    return suggestionCache.get(cacheKey);
  }

  // Chain this request to the global queue
  globalRequestQueue = globalRequestQueue.then(async () => {
    // 1. Check if already aborted before starting
    if (signal?.aborted) return;

    // 2. Wait for the mandatory gap
    await new Promise(resolve => setTimeout(resolve, SERIAL_DELAY));

    // 3. Check again after waiting
    if (signal?.aborted) return;

    try {
      const response = await axios.get(`${GEOCODING_API}/search`, {
        params: {
          q: query.trim(),
          countryCode: countryCode, 
          limit: 8
        },
        timeout: 8000,
        signal: signal
      });

      if (!response.data || !response.data.success) return [];

      const results = response.data.data.map(result => ({
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        name: result.name,
        address: result.address || {},
        type: result.type || 'unknown'
      })).filter(item => !isNaN(item.lat) && !isNaN(item.lon));

      // Cache the results
      suggestionCache.set(cacheKey, results);
      if (suggestionCache.size > 100) {
        const firstKey = suggestionCache.keys().next().value;
        suggestionCache.delete(firstKey);
      }

      return results;
    } catch (error) {
      if (axios.isCancel(error) || error.name === 'AbortError') return [];
      console.error("Geocoding queue error:", error);
      // Return empty array instead of throwing to keep the chain "healthy" for the next request
      return [];
    }
  }).catch(err => {
    // Top-level catch for the chain link to ensure globalRequestQueue persists as a resolved promise
    console.error("Critical queue failure:", err);
    return [];
  });

  return globalRequestQueue;
};