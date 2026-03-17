"use client";

import axios from "axios";

/**
 * Enhanced geocoding service using OpenStreetMap Nominatim API
 * Provides accurate location search with better error handling
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

// Rate limiting to respect Nominatim usage policy
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Geocode an address to coordinates with enhanced accuracy
 * @param {string} query - The address or location name to search
 * @param {string} countryCode - Optional country code (e.g., 'BD' for Bangladesh)
 * @returns {Promise<Object|null>} Location object with lat, lon, name, and additional details
 */
export const geocodeAddress = async (query, countryCode = 'BD') => {
  if (!query || query.trim().length < 3) {
    throw new Error("Please enter at least 3 characters");
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  try {
    const params = {
      q: query.trim(),
      format: 'json',
      limit: 5,
      addressdetails: 1,
      extratags: 1,
      namedetails: 1,
      'accept-language': 'en',
    };

    // Add country bias if provided
    if (countryCode) {
      params.countrycodes = countryCode.toLowerCase();
    }

    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params,
      timeout: 10000,
      headers: {
        'User-Agent': 'OnWay-RideSharing-App/1.0'
      }
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("Location not found. Try a more specific address.");
    }

    // Get the best result (first one is usually most relevant)
    const result = response.data[0];

    // Validate coordinates
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error("Invalid coordinates received");
    }

    return {
      lat,
      lon,
      name: result.display_name,
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

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: 1,
        'accept-language': 'en'
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'OnWay-RideSharing-App/1.0'
      }
    });

    if (!response.data || !response.data.display_name) {
      return {
        lat,
        lon,
        name: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        address: {}
      };
    }

    return {
      lat,
      lon,
      name: response.data.display_name,
      address: response.data.address || {}
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
export const getLocationSuggestions = async (query, countryCode = 'BD') => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const params = {
      q: query.trim(),
      format: 'json',
      limit: 8,
      addressdetails: 1,
      'accept-language': 'en',
    };

    if (countryCode) {
      params.countrycodes = countryCode.toLowerCase();
    }

    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params,
      timeout: 8000,
      headers: {
        'User-Agent': 'OnWay-RideSharing-App/1.0'
      }
    });

    if (!response.data) return [];

    return response.data.map(result => ({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name: result.display_name,
      address: result.address || {},
      type: result.type || 'unknown'
    })).filter(item => !isNaN(item.lat) && !isNaN(item.lon));

  } catch (error) {
    console.error("Failed to get location suggestions:", error);
    return [];
  }
};