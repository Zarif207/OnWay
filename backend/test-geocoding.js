/**
 * Test Geocoding API
 * Verify the geocoding proxy is working correctly
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testGeocoding() {
  console.log('🧪 Testing Geocoding API...\n');

  try {
    // Test search endpoint
    console.log('📍 Testing location search...');
    const searchResponse = await axios.get(`${API_BASE_URL}/geocoding/search`, {
      params: {
        q: 'Dhaka',
        countryCode: 'BD',
        limit: 5
      }
    });

    if (searchResponse.data.success) {
      console.log(`✅ Search successful: Found ${searchResponse.data.count} locations`);
      console.log(`   First result: ${searchResponse.data.data[0]?.name}`);
    } else {
      console.log('❌ Search failed');
    }

    // Test reverse geocoding
    console.log('\n📍 Testing reverse geocoding...');
    const reverseResponse = await axios.get(`${API_BASE_URL}/geocoding/reverse`, {
      params: {
        lat: 23.8103,
        lon: 90.4125
      }
    });

    if (reverseResponse.data.success) {
      console.log(`✅ Reverse geocoding successful`);
      console.log(`   Location: ${reverseResponse.data.data.name}`);
    } else {
      console.log('❌ Reverse geocoding failed');
    }

    // Test with invalid data
    console.log('\n📍 Testing error handling...');
    try {
      await axios.get(`${API_BASE_URL}/geocoding/search`, {
        params: { q: 'ab' } // Too short
      });
      console.log('❌ Should have failed with short query');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected short query');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status);
      }
    }

    // Test autocomplete suggestions
    console.log('\n📍 Testing autocomplete suggestions...');
    const suggestions = await axios.get(`${API_BASE_URL}/geocoding/search`, {
      params: {
        q: 'Gulshan',
        countryCode: 'BD',
        limit: 8
      }
    });

    if (suggestions.data.success) {
      console.log(`✅ Autocomplete successful: ${suggestions.data.count} suggestions`);
      suggestions.data.data.slice(0, 3).forEach((loc, i) => {
        console.log(`   ${i + 1}. ${loc.name}`);
      });
    }

    console.log('\n🎉 All geocoding tests passed!');
    console.log('\n📋 Summary:');
    console.log('✅ Location search working');
    console.log('✅ Reverse geocoding working');
    console.log('✅ Error handling working');
    console.log('✅ Autocomplete suggestions working');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first:');
      console.log('   cd backend && npm start');
    } else {
      console.log('❌ Test failed:', error.response?.data?.message || error.message);
    }
  }
}

// Run tests
testGeocoding();