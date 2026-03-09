/**
 * Test Script for Global Search System
 * Tests search functionality across multiple collections
 */

const axios = require("axios");

const API_URL = "http://localhost:4000/api";

// Test 1: Search for users
async function testUserSearch() {
  console.log("\n🧪 Test 1: Search for Users");
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        q: "admin",
        limit: 5,
      },
    });

    console.log("✅ Search successful");
    console.log(`📊 Total results: ${response.data.totalResults}`);
    console.log(`👥 Users found: ${response.data.results.users.length}`);
    
    if (response.data.results.users.length > 0) {
      console.log("\n📋 Sample user result:");
      console.log(JSON.stringify(response.data.results.users[0], null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 2: Search for riders
async function testRiderSearch() {
  console.log("\n🧪 Test 2: Search for Riders");
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        q: "rider",
        limit: 5,
      },
    });

    console.log("✅ Search successful");
    console.log(`📊 Total results: ${response.data.totalResults}`);
    console.log(`🚗 Riders found: ${response.data.results.riders.length}`);
    
    if (response.data.results.riders.length > 0) {
      console.log("\n📋 Sample rider result:");
      console.log(JSON.stringify(response.data.results.riders[0], null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 3: Search for bookings
async function testBookingSearch() {
  console.log("\n🧪 Test 3: Search for Bookings");
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        q: "pending",
        limit: 5,
      },
    });

    console.log("✅ Search successful");
    console.log(`📊 Total results: ${response.data.totalResults}`);
    console.log(`📍 Bookings found: ${response.data.results.bookings.length}`);
    
    if (response.data.results.bookings.length > 0) {
      console.log("\n📋 Sample booking result:");
      console.log(JSON.stringify(response.data.results.bookings[0], null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 4: Search with no results
async function testNoResults() {
  console.log("\n🧪 Test 4: Search with No Results");
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        q: "xyzabc123nonexistent",
        limit: 5,
      },
    });

    console.log("✅ Search successful");
    console.log(`📊 Total results: ${response.data.totalResults}`);
    
    if (response.data.totalResults === 0) {
      console.log("✅ Correctly returned no results");
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 5: Search with empty query (should fail)
async function testEmptyQuery() {
  console.log("\n🧪 Test 5: Search with Empty Query");
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        q: "",
        limit: 5,
      },
    });

    console.log("❌ Should have failed but didn't");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Correctly rejected empty query");
      console.log(`📝 Error message: ${error.response.data.message}`);
    } else {
      console.error("❌ Unexpected error:", error.response?.data || error.message);
    }
  }
}

// Test 6: Search across all collections
async function testMultiCollectionSearch() {
  console.log("\n🧪 Test 6: Multi-Collection Search");
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        q: "test",
        limit: 5,
      },
    });

    console.log("✅ Search successful");
    console.log(`📊 Total results: ${response.data.totalResults}`);
    console.log(`👥 Users: ${response.data.results.users.length}`);
    console.log(`🚗 Riders: ${response.data.results.riders.length}`);
    console.log(`📍 Bookings: ${response.data.results.bookings.length}`);
    console.log(`⭐ Reviews: ${response.data.results.reviews.length}`);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 7: Search by ID
async function testSearchById() {
  console.log("\n🧪 Test 7: Search by ID");
  
  // First, get a user ID from search
  try {
    const searchResponse = await axios.get(`${API_URL}/search`, {
      params: { q: "admin", limit: 1 },
    });

    if (searchResponse.data.results.users.length > 0) {
      const userId = searchResponse.data.results.users[0].id;
      console.log(`🔍 Testing with user ID: ${userId}`);

      const idResponse = await axios.get(`${API_URL}/search/by-id`, {
        params: {
          id: userId,
          type: "user",
        },
      });

      console.log("✅ Search by ID successful");
      console.log(`👤 Found user: ${idResponse.data.data.name}`);
    } else {
      console.log("⚠️ No users found to test with");
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 8: Performance test (multiple rapid searches)
async function testPerformance() {
  console.log("\n🧪 Test 8: Performance Test (5 rapid searches)");
  const startTime = Date.now();
  
  try {
    const searches = [
      axios.get(`${API_URL}/search`, { params: { q: "admin" } }),
      axios.get(`${API_URL}/search`, { params: { q: "rider" } }),
      axios.get(`${API_URL}/search`, { params: { q: "pending" } }),
      axios.get(`${API_URL}/search`, { params: { q: "test" } }),
      axios.get(`${API_URL}/search`, { params: { q: "user" } }),
    ];

    await Promise.all(searches);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ All searches completed`);
    console.log(`⏱️ Total time: ${duration}ms`);
    console.log(`📊 Average time per search: ${(duration / 5).toFixed(2)}ms`);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting Global Search Tests...");
  console.log("📌 Make sure:");
  console.log("   1. Backend server is running on port 4000");
  console.log("   2. MongoDB is connected");
  console.log("   3. Collections have data");

  await testUserSearch();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testRiderSearch();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testBookingSearch();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testNoResults();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testEmptyQuery();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testMultiCollectionSearch();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testSearchById();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await testPerformance();

  console.log("\n✅ All tests completed!");
  console.log("📊 Check results above for any failures");
}

runAllTests();
