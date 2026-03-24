"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CurrentLocationButton from "./CurrentLocationButton";

const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

// ---------------------------------------------------------
// Icons Setup - Custom colored markers for pickup and dropoff
// ---------------------------------------------------------

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Green marker for pickup
const pickupIconSvg = `
<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#10B981"/>
  <circle cx="12.5" cy="12.5" r="6" fill="white"/>
</svg>
`;

const pickupIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(pickupIconSvg),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Red marker for dropoff
const dropoffIconSvg = `
<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#EF4444"/>
  <circle cx="12.5" cy="12.5" r="6" fill="white"/>
</svg>
`;

const dropoffIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(dropoffIconSvg),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Custom current location marker icon (blue dot)
const currentLocationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#3B82F6" stroke-width="1" opacity="0.3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Enhanced Car Icon for smoother animation
const carIconUrl =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#filter0_d)">
    <rect x="4" y="8" width="24" height="16" rx="3" fill="#2563EB"/>
    <rect x="6" y="10" width="20" height="12" rx="2" fill="#3B82F6"/>
    <circle cx="10" cy="22" r="3" fill="#1F2937"/>
    <circle cx="22" cy="22" r="3" fill="#1F2937"/>
    <circle cx="10" cy="22" r="1.5" fill="#F3F4F6"/>
    <circle cx="22" cy="22" r="1.5" fill="#F3F4F6"/>
    <rect x="8" y="12" width="4" height="3" rx="1" fill="#60A5FA"/>
    <rect x="20" y="12" width="4" height="3" rx="1" fill="#60A5FA"/>
    <path d="M14 16h4v2h-4z" fill="#1E40AF"/>
  </g>
  <defs>
    <filter id="filter0_d" x="0" y="4" width="32" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
    </filter>
  </defs>
</svg>
`);

// carIcon definition for marker rendering
const carIcon = new L.Icon({
  iconUrl: carIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Enhanced Car Icon with proper rotation support
const createRotatedCarIcon = (rotation = 0) => {
  const carIconUrl =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg);">
    <g filter="url(#filter0_d)">
      <rect x="4" y="8" width="24" height="16" rx="3" fill="#2563EB"/>
      <rect x="6" y="10" width="20" height="12" rx="2" fill="#3B82F6"/>
      <circle cx="10" cy="22" r="3" fill="#1F2937"/>
      <circle cx="22" cy="22" r="3" fill="#1F2937"/>
      <circle cx="10" cy="22" r="1.5" fill="#F3F4F6"/>
      <circle cx="22" cy="22" r="1.5" fill="#F3F4F6"/>
      <rect x="8" y="12" width="4" height="3" rx="1" fill="#60A5FA"/>
      <rect x="20" y="12" width="4" height="3" rx="1" fill="#60A5FA"/>
      <path d="M14 16h4v2h-4z" fill="#1E40AF"/>
    </g>
    <defs>
      <filter id="filter0_d" x="0" y="4" width="32" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
    </defs>
  </svg>
  `);

  return new L.Icon({
    iconUrl: carIconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: "car-marker-animated",
  });
};

// ---------------------------------------------------------
// Traffic Toggle Button (inside map)
// ---------------------------------------------------------
const TrafficToggleButton = ({ showTraffic, onToggle }) => {
  const divRef = useRef(null);

  useEffect(() => {
    if (divRef.current) {
      L.DomEvent.disableClickPropagation(divRef.current);
      L.DomEvent.disableScrollPropagation(divRef.current);
    }
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        position: "absolute",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <button
        onClick={onToggle}
        title={showTraffic ? "Hide Traffic" : "Show Traffic"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 16px",
          borderRadius: "20px",
          border: "none",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "600",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          background: "rgba(15, 20, 30, 0.25)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#fff",
          transition: "background 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "14px" }}>🚦</span>
        {showTraffic ? "Hide Traffic" : "Live Traffic"}
      </button>
    </div>
  );
};

// Traffic Status Card (shows on map when route is set)
const TrafficStatusCard = ({ trafficInfo, durationMin }) => {
  if (!trafficInfo) return null;

  const { currentSpeed, freeFlowSpeed, ratio, fromSurge } = trafficInfo;

  let status, color, bg, emoji;
  if (ratio >= 0.8) {
    status = "Clear Traffic"; color = "#16a34a"; bg = "#f0fdf4"; emoji = "🟢";
  } else if (ratio >= 0.5) {
    status = "Moderate Traffic"; color = "#d97706"; bg = "#fffbeb"; emoji = "🟡";
  } else if (ratio >= 0.25) {
    status = "Heavy Traffic"; color = "#ea580c"; bg = "#fff7ed"; emoji = "🟠";
  } else {
    status = "Standstill / Jam"; color = "#dc2626"; bg = "#fef2f2"; emoji = "🔴";
  }

  const delayMin = ratio < 0.9 ? Math.round(durationMin * (1 - ratio) * 0.5) : 0;

  return (
    <div style={{
      position: "absolute",
      bottom: "12px",
      right: "12px",
      zIndex: 1000,
      background: bg,
      border: `1.5px solid ${color}40`,
      borderRadius: "10px",
      padding: "10px 14px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
      minWidth: "175px",
    }}>
      <div style={{ fontWeight: "700", fontSize: "13px", color, marginBottom: "4px" }}>
        {emoji} {status}
      </div>
      {!fromSurge ? (
        <div style={{ fontSize: "11px", color: "#6b7280" }}>
          Current: <b style={{ color: "#111" }}>{Math.round(currentSpeed)} km/h</b>
          {" · "}Normal: <b style={{ color: "#111" }}>{Math.round(freeFlowSpeed)} km/h</b>
        </div>
      ) : (
        <div style={{ fontSize: "11px", color: "#6b7280" }}>
          Based on area demand & conditions
        </div>
      )}
      {delayMin > 0 && (
        <div style={{ fontSize: "11px", color, marginTop: "3px", fontWeight: "600" }}>
          ⏱ ~{delayMin} min extra delay
        </div>
      )}
    </div>
  );
};

// Traffic Legend
const TrafficLegend = () => (
  <div
    style={{
      position: "absolute",
      bottom: "40px",
      left: "12px",
      zIndex: 1000,
      background: "rgba(255,255,255,0.95)",
      borderRadius: "8px",
      padding: "8px 12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      fontSize: "11px",
      fontWeight: "500",
    }}
  >
    <div style={{ fontWeight: "700", marginBottom: "5px", color: "#1F2937" }}>
      🚦 Traffic Flow
    </div>
    {[
      { color: "#00AA00", label: "Free flow" },
      { color: "#FFAA00", label: "Slow" },
      { color: "#FF5500", label: "Heavy" },
      { color: "#CC0000", label: "Standstill" },
    ].map(({ color, label }) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
        <div style={{ width: "20px", height: "4px", background: color, borderRadius: "2px" }} />
        <span style={{ color: "#374151" }}>{label}</span>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------
// Route Progress Indicator Component
// ---------------------------------------------------------
const RouteProgressIndicator = ({ progress, isPlaying, durationMin }) => {
  const progressPercentage = Math.round(progress * 100);
  const remainingTime = Math.max(0, Math.round(durationMin * (1 - progress)));

  return (
    <div className="route-progress">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
        ></div>
        <span className="text-xs font-semibold text-gray-700">
          {isPlaying ? "En Route" : progress === 1 ? "Arrived" : "Ready"}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>{progressPercentage}%</span>
        <span>{remainingTime}min left</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Helper: Enhanced Map Bounds Control with smooth animations
// ---------------------------------------------------------
const MapEffect = ({ pickup, dropoff, routeGeometry }) => {
  const map = useMap();
  const prevPickupRef = useRef(null);
  const prevDropoffRef = useRef(null);

  useEffect(() => {
    // Check if locations actually changed to avoid unnecessary updates
    const pickupChanged =
      pickup &&
      (!prevPickupRef.current ||
        prevPickupRef.current.lat !== pickup.lat ||
        prevPickupRef.current.lon !== pickup.lon);

    const dropoffChanged =
      dropoff &&
      (!prevDropoffRef.current ||
        prevDropoffRef.current.lat !== dropoff.lat ||
        prevDropoffRef.current.lon !== dropoff.lon);

    // Update refs
    prevPickupRef.current = pickup;
    prevDropoffRef.current = dropoff;

    // Priority 1: If we have a complete route, fit bounds to show entire route
    if (routeGeometry && routeGeometry.length > 0) {
      const bounds = L.latLngBounds(routeGeometry);

      // Add padding based on route complexity
      const padding = routeGeometry.length > 10 ? [60, 60] : [40, 40];

      map.fitBounds(bounds, {
        padding,
        animate: true,
        duration: 1.5,
        maxZoom: 16,
        easeLinearity: 0.25, // Smooth easing
      });
    }
    // Priority 2: If both locations exist, show both markers with optimal zoom
    else if (pickup && dropoff) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lon],
        [dropoff.lat, dropoff.lon],
      );

      // Calculate distance to determine appropriate zoom
      const distance = map.distance(
        [pickup.lat, pickup.lon],
        [dropoff.lat, dropoff.lon],
      );
      const maxZoom = distance < 1000 ? 17 : distance < 5000 ? 15 : 13;

      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom,
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
    // Priority 3: Single location - center with appropriate zoom
    else if (pickup && pickupChanged) {
      map.flyTo([pickup.lat, pickup.lon], 15, {
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25,
      });
    } else if (dropoff && dropoffChanged) {
      map.flyTo([dropoff.lat, dropoff.lon], 15, {
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25,
      });
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
// Main Component with Enhanced Professional Styling
// ---------------------------------------------------------
export default function RideMap({
  pickup,
  dropoff,
  routeGeometry,
  durationMin,
  onMapClick,
  showCurrentLocationButton = true,
  onCurrentLocationFound = null,
  showCarAnimation = true,
  routeColor = "#2563EB",
  routeWeight = 6,
  routeOpacity = 0.8,
  showRouteAlternatives = false,
  onRouteAlternativeSelect = null,
  onlineRiders = {},
  trafficInfo = null,
}) {
  const defaultCenter = [23.8103, 90.4125]; // Dhaka, Bangladesh

  const [carPosition, setCarPosition] = useState(null);
  const [carRotation, setCarRotation] = useState(0);
  const animationRef = useRef(null);
  const [showTraffic, setShowTraffic] = useState(false);

  // Dynamic route color based on traffic
  const dynamicRouteColor = trafficInfo
    ? trafficInfo.ratio >= 0.8 ? "#16a34a"
    : trafficInfo.ratio >= 0.5 ? "#d97706"
    : trafficInfo.ratio >= 0.25 ? "#ea580c"
    : "#dc2626"
    : routeColor;

  // Convert object of riders to array
  const nearbyRidersList = useMemo(
    () => Object.values(onlineRiders),
    [onlineRiders],
  );

  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [routeAlternatives, setRouteAlternatives] = useState([]);

  // -------------------------------------------------------
  // Fetch Route Alternatives (Optional Enhancement)
  // -------------------------------------------------------
  useEffect(() => {
    if (!showRouteAlternatives || !pickup || !dropoff) {
      setRouteAlternatives([]);
      return;
    }

    const fetchAlternatives = async () => {
      try {
        const { getRouteAlternatives } = await import("@/utils/routingService");
        const alternatives = await getRouteAlternatives(pickup, dropoff, 2);
        setRouteAlternatives(alternatives.slice(1)); // Exclude primary route
      } catch (error) {
        console.warn("Failed to fetch route alternatives:", error);
        setRouteAlternatives([]);
      }
    };

    fetchAlternatives();
  }, [pickup, dropoff, showRouteAlternatives]);

  // -------------------------------------------------------
  // Enhanced Animation Logic with Rotation and Smooth Movement
  // -------------------------------------------------------
  useEffect(() => {
    if (!routeGeometry || routeGeometry.length < 2 || !showCarAnimation) {
      setCarPosition(null);
      setAnimationProgress(0);
      setIsAnimationPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    // Set initial position at pickup
    setCarPosition(routeGeometry[0]);
    setAnimationProgress(0);
    setIsAnimationPlaying(true);

    let startTime = null;

    // Calculate animation duration based on actual route duration
    // Scale it down for demo purposes (1 real minute = 3 seconds animation)
    const animDurationBase = (durationMin || 5) * 3000;
    const clampedAnimationDuration = Math.max(
      4000,
      Math.min(animDurationBase, 20000),
    );

    // Function to calculate bearing between two points
    const calculateBearing = (start, end) => {
      const startLat = (start[0] * Math.PI) / 180;
      const startLng = (start[1] * Math.PI) / 180;
      const endLat = (end[0] * Math.PI) / 180;
      const endLng = (end[1] * Math.PI) / 180;

      const dLng = endLng - startLng;
      const y = Math.sin(dLng) * Math.cos(endLat);
      const x =
        Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

      const bearing = (Math.atan2(y, x) * 180) / Math.PI;
      return (bearing + 360) % 360; // Normalize to 0-360
    };

    const animateCar = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / clampedAnimationDuration, 1);

      // Smooth easing function for more natural movement
      const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedPercentage = easeInOutCubic(percentage);

      // Calculate position along the route
      const totalSegments = routeGeometry.length - 1;
      const currentFloatIndex = easedPercentage * totalSegments;
      const lowerIndex = Math.floor(currentFloatIndex);
      const upperIndex = Math.min(lowerIndex + 1, totalSegments);
      const segmentProgress = currentFloatIndex - lowerIndex;

      const p1 = routeGeometry[lowerIndex];
      const p2 = routeGeometry[upperIndex];

      if (p1 && p2) {
        // Interpolate position
        const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
        const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
        const newPosition = [lat, lng];

        setCarPosition(newPosition);
        setAnimationProgress(percentage);

        // Calculate and set car rotation based on direction
        if (lowerIndex < totalSegments) {
          const bearing = calculateBearing(p1, p2);
          setCarRotation(bearing);
        }
      }

      if (percentage < 1) {
        animationRef.current = requestAnimationFrame(animateCar);
      } else {
        // Animation finished
        setCarPosition(routeGeometry[routeGeometry.length - 1]);
        setAnimationProgress(1);
        setIsAnimationPlaying(false);
      }
    };

    // Start animation after a short delay
    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animateCar);
    }, 1000);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [routeGeometry, durationMin, showCarAnimation]);

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

      {/* Google Real-Time Traffic Layer */}
      {showTraffic && (
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}"
          attribution="Traffic data © Google"
          opacity={0.9}
          zIndex={10}
        />
      )}

      {/* Traffic Toggle Button */}
      <TrafficToggleButton
        showTraffic={showTraffic}
        onToggle={() => setShowTraffic((v) => !v)}
      />

      {/* Traffic Legend */}
      {showTraffic && <TrafficLegend />}

      {/* Traffic Status Card on route */}
      {routeGeometry && routeGeometry.length > 0 && (
        <TrafficStatusCard trafficInfo={trafficInfo} durationMin={durationMin} />
      )}

      {/* Nearby Online Riders Markers */}
      {nearbyRidersList.map((rider) => (
        <Marker
          key={rider.id || Math.random()}
          position={[rider.lat, rider.lng]}
          icon={carIcon}
          zIndexOffset={500}
        >
          <Popup>
            <div className="text-center p-1">
              <p className="font-black text-xs text-primary uppercase tracking-tighter">
                Available Now
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-[10px] font-bold">4.8</span>
                <span className="text-yellow-500 text-[10px]">★</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Pickup Marker - Green or Current Location Blue */}
      {pickup && pickup.lat && pickup.lon && (
        <Marker
          position={[pickup.lat, pickup.lon]}
          icon={pickup.isCurrentLocation ? currentLocationIcon : pickupIcon}
          key={`pickup-${pickup.lat}-${pickup.lon}`}
        >
          <Popup>
            <div className="text-sm">
              <strong
                className={`block mb-1 font-semibold ${pickup.isCurrentLocation ? "text-blue-600" : "text-green-600"}`}
              >
                {pickup.isCurrentLocation
                  ? "📍 You are here"
                  : "📍 Pickup Location"}
              </strong>
              <p className="text-gray-700">
                {pickup.name || "Selected Location"}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {pickup.lat.toFixed(6)}, {pickup.lon.toFixed(6)}
              </p>
              {pickup.accuracy && (
                <p className="text-gray-500 text-xs">
                  Accuracy: ±{Math.round(pickup.accuracy)}m
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Drop-off Marker - Red or Current Location Blue */}
      {dropoff && dropoff.lat && dropoff.lon && (
        <Marker
          position={[dropoff.lat, dropoff.lon]}
          icon={dropoff.isCurrentLocation ? currentLocationIcon : dropoffIcon}
          key={`dropoff-${dropoff.lat}-${dropoff.lon}`}
        >
          <Popup>
            <div className="text-sm">
              <strong
                className={`block mb-1 font-semibold ${dropoff.isCurrentLocation ? "text-blue-600" : "text-red-600"}`}
              >
                {dropoff.isCurrentLocation
                  ? "📍 You are here"
                  : "🎯 Drop-off Location"}
              </strong>
              <p className="text-gray-700">
                {dropoff.name || "Selected Location"}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {dropoff.lat.toFixed(6)}, {dropoff.lon.toFixed(6)}
              </p>
              {dropoff.accuracy && (
                <p className="text-gray-500 text-xs">
                  Accuracy: ±{Math.round(dropoff.accuracy)}m
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Enhanced Professional Route Polyline */}
      {routeGeometry && routeGeometry.length > 0 && (
        <>
          {/* Route shadow for depth */}
          <Polyline
            positions={routeGeometry}
            color="#000000"
            weight={routeWeight + 2}
            opacity={0.1}
            lineCap="round"
            lineJoin="round"
          />
          {/* Main route line */}
          <Polyline
            positions={routeGeometry}
            color={routeGeometry.length === 2 ? "#F59E0B" : dynamicRouteColor}
            weight={routeWeight}
            opacity={routeOpacity}
            dashArray={routeGeometry.length === 2 ? "10, 10" : null}
            lineCap="round"
            lineJoin="round"
            className="route-line"
          />
        </>
      )}

      {/* Route Alternatives (Optional) */}
      {showRouteAlternatives &&
        routeAlternatives.map((alternative, index) => (
          <Polyline
            key={`alternative-${index}`}
            positions={alternative.geometry}
            color="#9CA3AF"
            weight={4}
            opacity={0.6}
            dashArray="8, 4"
            lineCap="round"
            lineJoin="round"
            className="route-alternative"
            eventHandlers={{
              click: () =>
                onRouteAlternativeSelect &&
                onRouteAlternativeSelect(alternative),
            }}
          />
        ))}

      {/* Enhanced Animated Car Marker with Proper Rotation */}
      {carPosition && showCarAnimation && (
        <Marker
          position={carPosition}
          icon={createRotatedCarIcon(carRotation)}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="text-center">
              <strong className="text-blue-600">🚗 Vehicle en route</strong>
              <br />
              <small className="text-gray-500">
                Progress: {Math.round(animationProgress * 100)}%
              </small>
              <br />
              <small className="text-gray-400">
                Heading: {Math.round(carRotation)}°
              </small>
            </div>
          </Popup>
        </Marker>
      )}

      <MapEffect
        pickup={pickup}
        dropoff={dropoff}
        routeGeometry={routeGeometry}
      />
      <MapClickHandler onMapClick={onMapClick} />

      {/* Route Progress Indicator */}
      {showCarAnimation && routeGeometry && routeGeometry.length > 0 && (
        <RouteProgressIndicator
          progress={animationProgress}
          isPlaying={isAnimationPlaying}
          durationMin={durationMin}
        />
      )}

      {/* Current Location Button */}
      {showCurrentLocationButton && (
        <CurrentLocationButton
          onLocationFound={onCurrentLocationFound}
          showAccuracyCircle={true}
          zoomLevel={16}
        />
      )}
    </MapContainer>
  );
}
