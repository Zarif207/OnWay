"use client";
import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { Navigation, Loader2, MapPin, AlertCircle } from 'lucide-react';
import L from 'leaflet';

// Custom current location marker icon
const currentLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const CurrentLocationButton = ({ 
  onLocationFound = null, 
  className = "",
  style = {},
  showAccuracyCircle = true,
  zoomLevel = 16
}) => {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [accuracyCircle, setAccuracyCircle] = useState(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setError('');

    // Clear previous markers and circles
    if (currentLocationMarker) {
      map.removeLayer(currentLocationMarker);
      setCurrentLocationMarker(null);
    }
    if (accuracyCircle) {
      map.removeLayer(accuracyCircle);
      setAccuracyCircle(null);
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Create marker at user's location
          const marker = L.marker([latitude, longitude], {
            icon: currentLocationIcon,
            zIndexOffset: 1000 // Ensure it appears on top
          }).addTo(map);

          // Add popup
          marker.bindPopup(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <strong style="color: #1F2937;">You are here</strong>
              </div>
              <div style="font-size: 12px; color: #6B7280;">
                Lat: ${latitude.toFixed(6)}<br/>
                Lng: ${longitude.toFixed(6)}
                ${accuracy ? `<br/>Accuracy: ±${Math.round(accuracy)}m` : ''}
              </div>
            </div>
          `);

          setCurrentLocationMarker(marker);

          // Add accuracy circle if enabled and accuracy is available
          if (showAccuracyCircle && accuracy) {
            const circle = L.circle([latitude, longitude], {
              radius: accuracy,
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              weight: 2,
              opacity: 0.5
            }).addTo(map);
            
            setAccuracyCircle(circle);
          }

          // Center map on user's location with smooth animation
          map.flyTo([latitude, longitude], zoomLevel, {
            animate: true,
            duration: 1.5
          });

          // Call callback if provided
          if (onLocationFound) {
            onLocationFound({
              lat: latitude,
              lng: longitude,
              accuracy,
              marker,
              circle: showAccuracyCircle && accuracy ? accuracyCircle : null
            });
          }

          console.log('✅ Current location found:', { latitude, longitude, accuracy });
          
        } catch (err) {
          console.error('Error creating location marker:', err);
          setError('Failed to display location on map');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsLocating(false);
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access denied. Please enable location permissions.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information unavailable. Please try again.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("Failed to get current location. Please try again.");
            break;
        }
      },
      options
    );
  };

  // Clear error after 5 seconds
  if (error) {
    setTimeout(() => setError(''), 5000);
  }

  return (
    <>
      {/* Current Location Button */}
      <button
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
        className={`bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg rounded-xl p-3 group ${className}`}
        style={{
          position: 'absolute',
          top: '90px',
          left: '10px',
          zIndex: 1000,
          ...style
        }}
        title={isLocating ? "Getting your location..." : "Get current location"}
      >
        {isLocating ? (
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        ) : (
          <Navigation className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
        )}
      </button>

      {/* Error Toast */}
      {error && (
        <div 
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm"
          style={{
            position: 'absolute',
            top: '150px',
            left: '10px',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default CurrentLocationButton;