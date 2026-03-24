const express = require('express');
const axios = require('axios');
const router = express.Router();

const TOMTOM_KEY = process.env.TOMTOM_API_KEY;

// GET /api/traffic/flow?lat=23.8&lon=90.4
router.get('/flow', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: 'lat and lon required' });
  }

  if (!TOMTOM_KEY) {
    return res.status(503).json({ success: false, message: 'Traffic API key not configured' });
  }

  try {
    const response = await axios.get(
      'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json',
      {
        params: { point: `${lat},${lon}`, unit: 'KMPH', key: TOMTOM_KEY },
        timeout: 5000,
      }
    );

    const data = response.data?.flowSegmentData;
    if (!data) {
      return res.status(404).json({ success: false, message: 'No traffic data for this location' });
    }

    const { currentSpeed, freeFlowSpeed } = data;
    const ratio = freeFlowSpeed > 0 ? currentSpeed / freeFlowSpeed : 1;

    return res.json({
      success: true,
      data: { currentSpeed, freeFlowSpeed, ratio },
    });
  } catch (err) {
    console.warn('TomTom traffic error:', err.message);
    return res.status(502).json({ success: false, message: 'Traffic data unavailable' });
  }
});

module.exports = router;
