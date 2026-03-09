/**
 * Test Script for Real-Time Notifications
 * This script tests the notification system by creating test events
 */

const axios = require("axios");

const API_URL = "http://localhost:4000/api";

// Test 1: Create a new user (should trigger notification)
async function testUserRegistration() {
  console.log("\n🧪 Test 1: User Registration");
  try {
    const response = await axios.post(`${API_URL}/passenger`, {
      name: "Test User " + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: "password123",
      phone: "1234567890",
    });
    console.log("✅ User created:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 2: Create a new rider (should trigger notification)
async function testRiderRegistration() {
  console.log("\n🧪 Test 2: Rider Registration");
  try {
    const response = await axios.post(`${API_URL}/riders`, {
      firstName: "Test",
      lastName: "Rider " + Date.now(),
      email: `testrider${Date.now()}@example.com`,
      phone: "9876543210",
      address: {
        street: "123 Test St",
        city: "Dhaka",
        country: "Bangladesh",
      },
    });
    console.log("✅ Rider created:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Test 3: Create a new booking (should trigger notification)
async function testBookingCreation() {
  console.log("\n🧪 Test 3: Booking Creation");
  try {
    const response = await axios.post(`${API_URL}/bookings`, {
      pickupLocation: {
        address: "Dhaka Airport",
        lat: 23.8103,
        lng: 90.4125,
      },
      dropoffLocation: {
        address: "Gulshan Circle 1",
        lat: 23.7808,
        lng: 90.4168,
      },
      routeGeometry: "encoded_polyline_data",
      distance: 12.5,
      duration: 25,
      price: 350,
      passengerId: null,
      bookingStatus: "pending",
    });
    console.log("✅ Booking created:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting Notification System Tests...");
  console.log("📌 Make sure:");
  console.log("   1. Backend server is running on port 4000");
  console.log("   2. Socket server is running on port 4001");
  console.log("   3. Admin dashboard is open and logged in");
  console.log("   4. Check the notification bell icon in admin navbar");

  await testUserRegistration();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await testRiderRegistration();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await testBookingCreation();

  console.log("\n✅ All tests completed!");
  console.log("📊 Check admin dashboard for notifications");
}

runTests();
