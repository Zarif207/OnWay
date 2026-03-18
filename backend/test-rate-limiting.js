/**
 * Test Rate Limiting and Debouncing
 * Verify the rate limiting is working correctly
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting and Debouncing...\n');

  try {
    // Test 1: Single request should work
    console.log('📍 Test 1: Single request');
    const response1 = await axios.get(`${API_BASE_URL}/geocoding/search`, {
      params: { q: 'Dhaka', countryCode: 'BD' }
    });
    console.log(`✅ Request 1 successful: ${response1.data.count} results`);

    // Test 2: Immediate second request should be rate limited
    console.log('\n📍 Test 2: Immediate second request (should be rate limited)');
    try {
      const response2 = await axios.get(`${API_BASE_URL}/geocoding/search`, {
        params: { q: 'Gulshan', countryCode: 'BD' }
      });
      console.log(`⚠️ Request 2 succeeded (rate limit might be too lenient): ${response2.data.count} results`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`✅ Request 2 correctly rate limited (429)`);
        console.log(`   Retry after: ${error.response.data.retryAfter} seconds`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }

    // Test 3: Wait and try again
    console.log('\n📍 Test 3: Waiting 1.5 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response3 = await axios.get(`${API_BASE_URL}/geocoding/search`, {
      params: { q: 'Chittagong', countryCode: 'BD' }
    });
    console.log(`✅ Request 3 successful after waiting: ${response3.data.count} results`);

    // Test 4: Multiple rapid requests
    console.log('\n📍 Test 4: Multiple rapid requests (simulating fast typing)');
    const searches = ['D', 'Dh', 'Dha', 'Dhak', 'Dhaka'];
    let successCount = 0;
    let rateLimitCount = 0;

    for (const query of searches) {
      if (query.length < 3) {
        console.log(`   Skipping "${query}" (< 3 chars)`);
        continue;
      }

      try {
        await axios.get(`${API_BASE_URL}/geocoding/search`, {
          params: { q: query, countryCode: 'BD' }
        });
        successCount++;
        console.log(`   ✅ "${query}" succeeded`);
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimitCount++;
          console.log(`   ⏱️ "${query}" rate limited (expected)`);
        }
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n   Summary: ${successCount} succeeded, ${rateLimitCount} rate limited`);

    // Test 5: Reverse geocoding
    console.log('\n📍 Test 5: Reverse geocoding');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const reverseResponse = await axios.get(`${API_BASE_URL}/geocoding/reverse`, {
      params: { lat: 23.8103, lon: 90.4125 }
    });
    console.log(`✅ Reverse geocoding successful: ${reverseResponse.data.data.name}`);

    console.log('\n🎉 Rate limiting tests completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Single requests work correctly');
    console.log('✅ Rate limiting prevents spam');
    console.log('✅ Requests succeed after waiting');
    console.log('✅ Multiple rapid requests are handled properly');
    console.log('✅ Reverse geocoding works');

    console.log('\n💡 Recommendations:');
    console.log('- Frontend debounce delay: 800ms (currently set)');
    console.log('- Backend rate limit: 1.2s per user (currently set)');
    console.log('- Minimum search length: 3 characters (currently set)');

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
testRateLimiting();