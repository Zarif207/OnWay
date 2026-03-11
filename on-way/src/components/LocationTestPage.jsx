"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LocationInput from '@/components/LocationInput';
import { getDrivingRoute } from '@/utils/routingService';
import { geocodeAddress, reverseGeocode } from '@/utils/geocodingService';
import { useLocationSocket } from '@/hooks/useLocationSocket';
import { MapPin, Route, Clock, Navigation, Wifi, WifiOff } from 'lucide-react';

// Dynamically import map to avoid SSR issues
const RideMap = dynamic(() => import('@/components/Map/RideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl">
      <span className="text-gray-500">Loading Map...</span>
    </div>
  ),
});

const LocationTestPage = () => {
  // Location states
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  
  // Route states
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // UI states
  const [activeInput, setActiveInput] = useState("pickup");
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState("");
  const [testResults, setTestResults] = useState([]);

  // WebSocket integration
  const {
    isConnected: socketConnected,
    connectionError: socketError,
    sendLocationUpdate
  } = useLocationSocket({
    onLocationUpdate: (data) => {
      console.log('Real-time location update:', data);
      addTestResult('WebSocket', 'Location update received', 'success');
    }
  });

  // Test geocoding accuracy
  const testGeocodingAccuracy = async () => {
    const testAddresses = [
      "Dhanmondi 27, Dhaka",
      "Gulshan 2, Dhaka",
      "Uttara Sector 7, Dhaka",
      "Banani, Dhaka",
      "Mirpur 10, Dhaka"
    ];

    addTestResult('Geocoding Test', 'Starting accuracy test...', 'info');

    for (const address of testAddresses) {
      try {
        const result = await geocodeAddress(address);
        if (result && result.lat && result.lon) {
          addTestResult('Geocoding', `✅ ${address} → ${result.lat.toFixed(6)}, ${result.lon.toFixed(6)}`, 'success');
        } else {
          addTestResult('Geocoding', `❌ Failed to geocode: ${address}`, 'error');
        }
      } catch (err) {
        addTestResult('Geocoding', `❌ Error for ${address}: ${err.message}`, 'error');
      }
    }
  };

  // Test reverse geocoding
  const testReverseGeocoding = async () => {
    const testCoordinates = [
      { lat: 23.8103, lon: 90.4125, name: "Dhaka Center" },
      { lat: 23.7808, lon: 90.4142, name: "Dhanmondi" },
      { lat: 23.7925, lon: 90.4078, name: "Gulshan" }
    ];

    addTestResult('Reverse Geocoding', 'Starting reverse geocoding test...', 'info');

    for (const coord of testCoordinates) {
      try {
        const result = await reverseGeocode(coord.lat, coord.lon);
        if (result && result.name) {
          addTestResult('Reverse Geocoding', `✅ ${coord.name}: ${result.name}`, 'success');
        } else {
          addTestResult('Reverse Geocoding', `❌ Failed for ${coord.name}`, 'error');
        }
      } catch (err) {
        addTestResult('Reverse Geocoding', `❌ Error for ${coord.name}: ${err.message}`, 'error');
      }
    }
  };

  // Test routing accuracy
  const testRoutingAccuracy = async () => {
    if (!pickupLocation || !dropoffLocation) {
      addTestResult('Routing', '❌ Please set both pickup and dropoff locations first', 'error');
      return;
    }

    addTestResult('Routing', 'Testing route calculation...', 'info');

    try {
      const routeData = await getDrivingRoute(pickupLocation, dropoffLocation);
      if (routeData && routeData.geometry && routeData.geometry.length > 0) {
        addTestResult('Routing', `✅ Route found: ${routeData.distanceKm}km, ${routeData.durationMin}min`, 'success');
        addTestResult('Routing', `✅ Geometry points: ${routeData.geometry.length}`, 'success');
      } else {
        addTestResult('Routing', '❌ No route geometry returned', 'error');
      }
    } catch (err) {
      addTestResult('Routing', `❌ Routing error: ${err.message}`, 'error');
    }
  };

  // Test WebSocket functionality
  const testWebSocket = () => {
    if (!socketConnected) {
      addTestResult('WebSocket', '❌ Socket not connected', 'error');
      return;
    }

    const testData = {
      userId: 'test-user-123',
      lat: 23.8103,
      lon: 90.4125,
      type: 'passenger'
    };

    const success = sendLocationUpdate(testData);
    if (success) {
      addTestResult('WebSocket', '✅ Test location update sent', 'success');
    } else {
      addTestResult('WebSocket', '❌ Failed to send location update', 'error');
    }
  };

  // Add test result
  const addTestResult = (category, message, type) => {
    const result = {
      id: Date.now() + Math.random(),
      category,
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev].slice(0, 50)); // Keep last 50 results
  };

  // Handle location selection
  const handlePickupLocationSelect = (location) => {
    setPickupLocation(location);
    setActiveInput("dropoff");
    addTestResult('Location Selection', `✅ Pickup set: ${location.name}`, 'success');
  };

  const handleDropoffLocationSelect = (location) => {
    setDropoffLocation(location);
    addTestResult('Location Selection', `✅ Dropoff set: ${location.name}`, 'success');
  };

  // Handle map click
  const handleMapClick = async (coords) => {
    try {
      const addressData = await reverseGeocode(coords.lat, coords.lon);
      const newLocationObj = {
        lat: coords.lat,
        lon: coords.lon,
        name: addressData.name,
        address: addressData.address || {}
      };

      if (activeInput === "pickup") {
        setPickupLocation(newLocationObj);
        setPickupQuery(addressData.name);
        setActiveInput("dropoff");
        addTestResult('Map Click', `✅ Pickup set via map: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`, 'success');
      } else {
        setDropoffLocation(newLocationObj);
        setDropoffQuery(addressData.name);
        addTestResult('Map Click', `✅ Dropoff set via map: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`, 'success');
      }
    } catch (err) {
      addTestResult('Map Click', `❌ Failed to process map click: ${err.message}`, 'error');
    }
  };

  // Auto-calculate route when both locations are set
  useEffect(() => {
    const calculateRoute = async () => {
      if (pickupLocation && dropoffLocation) {
        setIsRouting(true);
        setError("");
        try {
          const routeData = await getDrivingRoute(pickupLocation, dropoffLocation);
          if (routeData) {
            setDistance(routeData.distanceKm);
            setDuration(routeData.durationMin);
            setRouteGeometry(routeData.geometry);
            addTestResult('Auto Route', `✅ Route calculated: ${routeData.distanceKm}km`, 'success');
          }
        } catch (err) {
          setError(err.message);
          addTestResult('Auto Route', `❌ Route calculation failed: ${err.message}`, 'error');
        } finally {
          setIsRouting(false);
        }
      }
    };

    calculateRoute();
  }, [pickupLocation, dropoffLocation]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OnWay Location System Test</h1>
          <p className="text-gray-600">Test geocoding accuracy, map functionality, and real-time updates</p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              socketConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {socketConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              WebSocket: {socketConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Location Inputs */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Testing
            </h2>

            <div className="space-y-6">
              {/* Pickup Input */}
              <LocationInput
                label="Pickup Location"
                placeholder="Enter pickup location..."
                value={pickupQuery}
                onChange={setPickupQuery}
                onLocationSelect={handlePickupLocationSelect}
                type="pickup"
                isActive={activeInput === "pickup"}
                onFocus={() => setActiveInput("pickup")}
              />

              {/* Dropoff Input */}
              <LocationInput
                label="Drop-off Location"
                placeholder="Enter dropoff location..."
                value={dropoffQuery}
                onChange={setDropoffQuery}
                onLocationSelect={handleDropoffLocationSelect}
                type="dropoff"
                isActive={activeInput === "dropoff"}
                onFocus={() => setActiveInput("dropoff")}
              />

              {/* Route Info */}
              {routeGeometry.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Route className="w-4 h-4" />
                    Route Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Distance:</span>
                      <span className="font-semibold ml-2">{distance} km</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-semibold ml-2">{duration} min</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Buttons */}
              <div className="space-y-3">
                <button
                  onClick={testGeocodingAccuracy}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Geocoding Accuracy
                </button>
                <button
                  onClick={testReverseGeocoding}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Test Reverse Geocoding
                </button>
                <button
                  onClick={testRoutingAccuracy}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Test Route Calculation
                </button>
                <button
                  onClick={testWebSocket}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                  disabled={!socketConnected}
                >
                  Test WebSocket
                </button>
              </div>
            </div>
          </div>

          {/* Center Panel - Map */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Interactive Map
            </h2>
            
            <div className="h-96 rounded-xl overflow-hidden border border-gray-200">
              <RideMap
                pickup={pickupLocation}
                dropoff={dropoffLocation}
                routeGeometry={routeGeometry}
                durationMin={duration}
                onMapClick={handleMapClick}
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Panel - Test Results */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Test Results
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No test results yet. Run some tests!</p>
              ) : (
                testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg text-sm ${
                      result.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                      result.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold">{result.category}</span>
                      <span className="text-xs opacity-75">{result.timestamp}</span>
                    </div>
                    <p>{result.message}</p>
                  </div>
                ))
              )}
            </div>

            {testResults.length > 0 && (
              <button
                onClick={() => setTestResults([])}
                className="w-full mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Clear Results
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LocationTestPage;