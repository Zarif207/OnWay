/**
 * Geocoding Routes
 * Proxy for OpenStreetMap Nominatim API to avoid CORS issues
 */

const express = require('express');
const axios = require('axios');

const router = express.Router();

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

// Improved rate limiting with per-user tracking
const requestTimestamps = new Map();
const MIN_REQUEST_INTERVAL = 1200; // 1.2 seconds between requests
const CLEANUP_INTERVAL = 60000; // Clean up old timestamps every minute

// Cleanup old timestamps periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of requestTimestamps.entries()) {
    if (now - timestamp > 60000) { // Remove entries older than 1 minute
      requestTimestamps.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Check rate limit for a given identifier
 */
function checkRateLimit(identifier) {
  const now = Date.now();
  const lastRequest = requestTimestamps.get(identifier) || 0;
  const timeSinceLastRequest = now - lastRequest;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    return {
      allowed: false,
      waitTime: MIN_REQUEST_INTERVAL - timeSinceLastRequest
    };
  }
  
  requestTimestamps.set(identifier, now);
  return { allowed: true, waitTime: 0 };
}

/**
 * @route   GET /api/geocoding/search
 * @desc    Search for locations using Nominatim
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { q, countryCode, limit = 8 } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 3 characters'
      });
    }

    // Rate limiting per IP address
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(`search_${clientId}`);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment.',
        retryAfter: Math.ceil(rateLimit.waitTime / 1000)
      });
    }

    // Build params
    const params = {
      q: q.trim(),
      format: 'json',
      limit: parseInt(limit),
      addressdetails: 1,
      'accept-language': 'en',
    };

    if (countryCode) {
      params.countrycodes = countryCode.toLowerCase();
    }

    // Make request to Nominatim
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params,
      timeout: 8000,
      headers: {
        'User-Agent': 'OnWay-RideSharing-App/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.data) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Format results
    const results = response.data.map(result => ({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name: result.display_name,
      address: result.address || {},
      type: result.type || 'unknown',
      importance: result.importance || 0
    })).filter(item => !isNaN(item.lat) && !isNaN(item.lon));

    res.json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error) {
    console.error('❌ Geocoding search error:', error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'External API rate limit reached. Please try again in a moment.',
        retryAfter: 2
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to search locations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * @route   GET /api/geocoding/reverse
 * @desc    Reverse geocode coordinates to address
 * @access  Public
 */
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude) || 
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Rate limiting per IP address
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(`reverse_${clientId}`);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment.',
        retryAfter: Math.ceil(rateLimit.waitTime / 1000)
      });
    }

    // Make request to Nominatim
    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
        'accept-language': 'en'
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'OnWay-RideSharing-App/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.data) {
      return res.status(404).json({
        success: false,
        message: 'No address found for these coordinates'
      });
    }

    res.json({
      success: true,
      data: {
        lat: parseFloat(response.data.lat),
        lon: parseFloat(response.data.lon),
        name: response.data.display_name,
        address: response.data.address || {},
        type: response.data.type || 'unknown'
      }
    });

  } catch (error) {
    console.error('❌ Reverse geocoding error:', error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'External API rate limit reached. Please try again in a moment.',
        retryAfter: 2
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;