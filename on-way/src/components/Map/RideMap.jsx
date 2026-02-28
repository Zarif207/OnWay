"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ---------------------------------------------------------
// Icons Setup
// ---------------------------------------------------------

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const pickupIcon = new L.Icon({ ...defaultIcon.options });
const dropoffIcon = new L.Icon({ ...defaultIcon.options });

// Custom Car Icon for Animation
const carIconUrl = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg fill="#000000" viewBox="0 0 24 24" id="car" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color">
  <path id="primary" d="M21.71,11A1,1,0,0,0,21,10.63H3a1,1,0,0,0-.71.29A1,1,0,0,0,2,11.63L3,18.63a1,1,0,0,0,.15.39,1,1,0,0,0,.85.61H20a1,1,0,0,0,.84-.6,1,1,0,0,0,.16-1ZM6,17.63a1,1,0,1,1,1-1A1,1,0,0,1,6,17.63Zm12,0a1,1,0,1,1,1-1A1,1,0,0,1,18,17.63Z" style="fill: rgb(37, 99, 235);"></path>
  <path id="secondary" d="M19,10.63l-.7-3.56A1,1,0,0,0,17.32,6.2H6.68a1,1,0,0,0-1,.84l-.7,3.59Z" style="fill: rgb(147, 197, 253);"></path>
</svg>
`);

const carIcon = new L.Icon({
  iconUrl: carIconUrl,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// ---------------------------------------------------------
// Helper: Map Bounds Control
// ---------------------------------------------------------
const MapEffect = ({ pickup, dropoff, routeGeometry }) => {
  const map = useMap();

  useEffect(() => {
    // If we have a full route, fit bounds to the route geometry
    if (routeGeometry && routeGeometry.length > 0) {
      const bounds = L.latLngBounds(routeGeometry);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
    } 
    // Otherwise fallback to point-based fitting
    else if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup.lat, pickup.lon], [dropoff.lat, dropoff.lon]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true, duration: 1 });
    } else if (pickup) {
      map.flyTo([pickup.lat, pickup.lon], 14, { animate: true, duration: 1 });
    } else if (dropoff) {
      map.flyTo([dropoff.lat, dropoff.lon], 14, { animate: true, duration: 1 });
    }
  }, [pickup, dropoff, routeGeometry, map]);

  return null;
};

// ---------------------------------------------------------
// Helper: Map Click Handler
// ---------------------------------------------------------
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    },
  });
  return null;
};

// ---------------------------------------------------------
// Main Component
// ---------------------------------------------------------
export default function RideMap({ pickup, dropoff, routeGeometry, durationMin, onMapClick }) {
  const defaultCenter = [23.8103, 90.4125]; // Dhaka, Bangladesh
  
  const [carPosition, setCarPosition] = useState(null);
  const animationRef = useRef(null);
  
  // -------------------------------------------------------
  // Animation Logic
  // -------------------------------------------------------
  useEffect(() => {
    if (!routeGeometry || routeGeometry.length < 2) {
      setCarPosition(null);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    // Set initial position
    setCarPosition(routeGeometry[0]);

    let startTime = null;
    
    // Determine animation duration. 
    // We scale it down so it's viewable (e.g., 1 min real-time = 2 seconds animation time)
    // Minimum 3 seconds long, max 15 seconds.
    const animDurationBase = (durationMin || 5) * 1000; 
    const clampedAnimationDuration = Math.max(3000, Math.min(animDurationBase, 15000));

    const animateCar = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / clampedAnimationDuration, 1);

      // Interpolate position along the route geometry array
      const totalSegments = routeGeometry.length - 1;
      const currentFloatIndex = percentage * totalSegments;
      const lowerIndex = Math.floor(currentFloatIndex);
      const upperIndex = Math.min(lowerIndex + 1, totalSegments);

      const weight = currentFloatIndex - lowerIndex;

      const p1 = routeGeometry[lowerIndex];
      const p2 = routeGeometry[upperIndex];

      if (p1 && p2) {
        const lat = p1[0] + (p2[0] - p1[0]) * weight;
        const lng = p1[1] + (p2[1] - p1[1]) * weight;
        setCarPosition([lat, lng]);
      }

      if (percentage < 1) {
        animationRef.current = requestAnimationFrame(animateCar);
      } else {
        // Animation finished, optionally loop or keep at destination
        setCarPosition(routeGeometry[routeGeometry.length - 1]);
      }
    };

    animationRef.current = requestAnimationFrame(animateCar);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [routeGeometry, durationMin]);

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  
  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      className="w-full h-full z-0"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en"
        attribution="Map data © Google"
      />
      
      {/* Pickup Marker */}
      {pickup && (
        <Marker position={[pickup.lat, pickup.lon]} icon={pickupIcon}>
          <Popup>
            <strong className="text-blue-600 block mb-1">Pickup Location</strong>
            {pickup.name}
          </Popup>
        </Marker>
      )}

      {/* Drop-off Marker */}
      {dropoff && (
        <Marker position={[dropoff.lat, dropoff.lon]} icon={dropoffIcon}>
          <Popup>
            <strong className="text-red-600 block mb-1">Drop-off Location</strong>
            {dropoff.name}
          </Popup>
        </Marker>
      )}

      {/* Real Driving Route Polyline */}
      {routeGeometry && routeGeometry.length > 0 && (
        <Polyline 
          positions={routeGeometry} 
          color="#2FCA71" // Tailwind blue-600
          weight={5} 
          opacity={0.8} 
        />
      )}

      {/* Animated Car Marker */}
      {carPosition && (
        <Marker position={carPosition} icon={carIcon} zIndexOffset={1000}>
          <Popup>Vehicle en route</Popup>
        </Marker>
      )}

      <MapEffect pickup={pickup} dropoff={dropoff} routeGeometry={routeGeometry} />
      <MapClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
}
