const express = require('express');
const axios = require('axios');
const router = express.Router();

const OSRM_ENDPOINTS = [
  'https://router.project-osrm.org',
  'https://routing.openstreetmap.de/routed-car',
];

// GET /api/routing/drive?pickLat=&pickLon=&dropLat=&dropLon=
router.get('/drive', async (req, res) => {
  const { pickLat, pickLon, dropLat, dropLon } = req.query;

  if (!pickLat || !pickLon || !dropLat || !dropLon) {
    return res.status(400).json({ success: false, message: 'Missing coordinates' });
  }

  const coordinates = `${pickLon},${pickLat};${dropLon},${dropLat}`;

  for (const baseUrl of OSRM_ENDPOINTS) {
    try {
      const response = await axios.get(
        `${baseUrl}/route/v1/driving/${coordinates}`,
        {
          params: { overview: 'full', geometries: 'geojson', steps: false, annotations: false },
          timeout: 10000,
          headers: { 'User-Agent': 'OnWay-RideSharing-App/1.0' },
        }
      );

      const route = response.data?.routes?.[0];
      if (!route?.geometry?.coordinates?.length) continue;

      const distanceKm = Math.round((route.distance / 1000) * 100) / 100;
      const durationMin = Math.ceil(route.duration / 60);
      const geometry = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

      return res.json({ success: true, data: { distanceKm, durationMin, geometry } });
    } catch (err) {
      console.warn(`OSRM endpoint ${baseUrl} failed:`, err.message);
    }
  }

  // All endpoints failed — return fallback straight line
  const R = 6371;
  const dLat = ((dropLat - pickLat) * Math.PI) / 180;
  const dLon = ((dropLon - pickLon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((pickLat * Math.PI) / 180) *
      Math.cos((dropLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const straightKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(straightKm * 1.3 * 100) / 100;
  const durationMin = Math.ceil((distanceKm / 25) * 60);

  return res.json({
    success: true,
    isFallback: true,
    data: {
      distanceKm,
      durationMin,
      geometry: [[parseFloat(pickLat), parseFloat(pickLon)], [parseFloat(dropLat), parseFloat(dropLon)]],
    },
  });
});

module.exports = router;
