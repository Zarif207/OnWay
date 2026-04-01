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

// Primary Green marker for pickup
const pickupIconSvg = `
<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#259461"/>
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
      <circle cx="12" cy="12" r="8" fill="#259461" stroke="white" stroke-width="3"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#259461" stroke-width="1" opacity="0.3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// ---------------------------------------------------------
// Vehicle Asset Mapping - High Fidelity PNGs
// ---------------------------------------------------------
const VEHICLE_ASSETS = {
  car_white: "/vehicles/F-car.png",
  car_yellow: "/vehicles/F-car.png",
  suv_black: "/vehicles/F-suv.png",
  bike_silver: "/vehicles/F-bike.png",
  ambulance_white: "/vehicles/F-ambulance.png"
};

const getVehicleImage = (type = "car", variant = "default") => {
  if (type === "ambulance") return VEHICLE_ASSETS.ambulance_white;
  if (type === "bike") return VEHICLE_ASSETS.bike_silver;
  if (type === "suv") return VEHICLE_ASSETS.suv_black;

  // Randomize car colors for traffic
  if (variant === "yellow" || (variant === "default" && Math.random() > 0.7)) {
    return VEHICLE_ASSETS.car_yellow;
  }
  return VEHICLE_ASSETS.car_white;
};

// ---------------------------------------------------------
// Vehicle Icon Factory - Premium Uber Aesthetics
// ---------------------------------------------------------
const createVehicleIcon = (type = "car", rotation = 0, variant = "default", isAssigned = false, isFaded = false) => {
  const imageUrl = getVehicleImage(type, variant);

  // Uber-style sizing
  const size = type === "bike" ? 28 : type === "ambulance" ? 48 : 40;

  // Assigned car gets a slight glow and scale boost
  const highlightStyle = isAssigned ? "scale(1.2) drop-shadow(0 0 8px #2563eb)" : "scale(1)";
  const opacityStyle = isAssigned ? 1 : isFaded ? 0.35 : 0.85;

  return L.divIcon({
    html: `
      <div class="vehicle-marker-wrapper" style="
        width: ${size}px; 
        height: ${size}px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        transform: rotate(${rotation}deg) ${highlightStyle};
        transform-origin: center center;
        transition: transform 0.16s linear, opacity 0.3s ease;
        opacity: ${opacityStyle};
      ">
        <img 
          src="${imageUrl}" 
          class="vehicle-img-animate"
          style="
            width: 100%;
            height: auto;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            image-rendering: -webkit-optimize-contrast;
          "
          alt="${type}"
        />
        <style>
          @keyframes subtle-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-1px) scale(0.99); }
          }
          .vehicle-img-animate {
            animation: subtle-float 2.5s ease-in-out infinite;
          }
        </style>
      </div>
    `,
    className: "bg-transparent border-none",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// ---------------------------------------------------------
// Road Movement Helpers
// ---------------------------------------------------------

// Smoothly interpolate between two points
const interpolate = (p1, p2, t) => [
  p1[0] + (p2[0] - p1[0]) * t,
  p1[1] + (p2[1] - p1[1]) * t
];

// Offset for icon orientation (Default: 0 if icon points UP/North)
const ROTATION_OFFSET = 0;

// Calculate bearing between two points for CSS rotation (0-360, 0=North/Up)
const getBearing = (p1, p2) => {
  if (!p1 || !p2) return 0;
  const dy = p2[0] - p1[0]; // Lat (Y)
  const dx = p2[1] - p1[1]; // Lng (X)

  // Math.atan2(dx, dy) returns 0 for North, 90 for East, etc.
  // This matches CSS rotation perfectly.
  const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
  return (angle + 360) % 360 + ROTATION_OFFSET;
};

// Generate a road-like polyline (random jitter to follow street grid roughly)
const generateRoadPath = (start, end, segments = 3) => {
  const path = [start];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const base = interpolate(start, end, t);
    // Add "road jitter" (0.002 is ~200m)
    const jitter = [
      (Math.random() - 0.5) * 0.003,
      (Math.random() - 0.5) * 0.003
    ];
    path.push([base[0] + jitter[0], base[1] + jitter[1]]);
  }
  path.push(end);
  return path;
};

// Generic car icon for static markers (like nearby riders)
const carIcon = createVehicleIcon("car", "#259461", 0);

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
        bottom: "24px",
        right: "24px",
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
      bottom: "84px",
      right: "24px",
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
        bottom: "84px",
        right: "24px",
        zIndex: 1000,
        background: "rgba(255,255,255,0.95)",
        borderRadius: "16px",
        padding: "12px 16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        fontSize: "11px",
        fontWeight: "500",
        border: "1px solid rgba(0,0,0,0.05)"
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
    <div className="route-progress" style={{
      position: "absolute",
      top: "120px",
      right: "24px",
      zIndex: 1000,
      background: "white",
      padding: "16px",
      borderRadius: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      width: "200px"
    }}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}
        ></div>
        <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">
          {isPlaying ? "En Route" : progress === 1 ? "Arrived" : "Ready"}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold">
        <span className="text-blue-600">{progressPercentage}%</span>
        <span className="text-gray-400">{remainingTime} min left</span>
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
  routeColor = "#259461",
  routeWeight = 6,
  routeOpacity = 0.8,
  showRouteAlternatives = false,
  onRouteAlternativeSelect = null,
  onlineRiders = {},
  trafficInfo = null,
  rideStatus = "idle",
  assignedDriver = null,
}) {
  const defaultCenter = [23.8103, 90.4125]; // Dhaka, Bangladesh

  // -------------------------------------------------------
  // Traffic Simulation Manager (High Performance)
  // -------------------------------------------------------
  const [trafficVehicles, setTrafficVehicles] = useState([]);
  const trafficAnimationFrameRef = useRef(null);

  useEffect(() => {
    const center = pickup ? [pickup.lat, pickup.lon] : defaultCenter;

    // Initialize 6 vehicles with diverse types and speeds
    const initialVehicles = Array.from({ length: 6 }).map((_, i) => {
      const type = ["car", "suv", "car", "bike", "car", "ambulance"][i % 6];
      const variant = type === "car" && Math.random() > 0.5 ? "yellow" : "default";
      const startPos = [
        center[0] + (Math.random() - 0.5) * 0.04,
        center[1] + (Math.random() - 0.5) * 0.04
      ];

      // Speed factors for realism
      const speedFactor = type === "bike" ? 1.4 : type === "ambulance" ? 1.8 : type === "suv" ? 0.9 : 1.0;

      return {
        id: `traffic-${i}`,
        type,
        variant,
        position: startPos,
        rotation: Math.random() * 360,
        targetRotation: Math.random() * 360,
        path: [],
        pathIndex: 0,
        segmentProgress: 0,
        speed: 0.0015 * speedFactor
      };
    });
    setTrafficVehicles(initialVehicles);

    let lastTime = performance.now();

    const animateTraffic = (time) => {
      const deltaTime = (time - lastTime) / 16.67; // Normalize to 60fps
      lastTime = time;

      setTrafficVehicles(prev => prev.map(v => {
        // 1. Path Management: If reached end or no path, generate new road-like polyline
        if (v.path.length === 0 || v.pathIndex >= v.path.length - 1) {
          const dest = [
            v.position[0] + (Math.random() - 0.5) * 0.05,
            v.position[1] + (Math.random() - 0.5) * 0.05
          ];
          const newPath = generateRoadPath(v.position, dest, Math.floor(Math.random() * 3) + 3);
          return { ...v, path: newPath, pathIndex: 0, segmentProgress: 0 };
        }

        // 2. Segment Locomotion
        const p1 = v.path[v.pathIndex];
        const p2 = v.path[v.pathIndex + 1];

        const dist = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
        const step = (v.speed * deltaTime) / (dist * 1000 + 0.1);

        let newProgress = v.segmentProgress + step;
        let newIndex = v.pathIndex;

        if (newProgress >= 1) {
          newProgress = 0;
          newIndex += 1;
        }

        const newPos = interpolate(p1, p2, Math.min(newProgress, 1));
        const targetRot = getBearing(p1, p2);

        // 3. Smooth Rotation Easing (Uber-style)
        // currentAngle += (targetAngle - currentAngle) * 0.2
        const rotationDiff = ((targetRot - v.rotation + 540) % 360) - 180;
        const newRot = v.rotation + rotationDiff * 0.15 * deltaTime;

        return {
          ...v,
          position: newPos,
          rotation: newRot,
          pathIndex: newIndex,
          segmentProgress: newProgress
        };
      }));

      trafficAnimationFrameRef.current = requestAnimationFrame(animateTraffic);
    };

    trafficAnimationFrameRef.current = requestAnimationFrame(animateTraffic);
    return () => cancelAnimationFrame(trafficAnimationFrameRef.current);
  }, [pickup]);

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
  const [approachRoute, setApproachRoute] = useState(null);

  // Generate a mock approach route when driver is matched and "arriving"
  useEffect(() => {
    if ((rideStatus === "arriving" || rideStatus === "accepted") && pickup && !approachRoute) {
      // Create a fixed mock route from about 500m away to the pickup
      // We use a fixed seed based on pickup lat/lon so it doesn't change on re-render
      const seed = (pickup.lat + pickup.lon) * 1000;
      const startLat = pickup.lat + (Math.sin(seed) * 0.008);
      const startLng = pickup.lon + (Math.cos(seed) * 0.008);

      const segments = 25;
      const mockRoute = [];
      for (let i = 0; i <= segments; i++) {
        const ratio = i / segments;
        mockRoute.push([
          startLat + (pickup.lat - startLat) * ratio,
          startLng + (pickup.lon - startLng) * ratio
        ]);
      }
      setApproachRoute(mockRoute);
    } else if (rideStatus === "idle") {
      setApproachRoute(null);
    }
  }, [rideStatus, pickup, approachRoute]);

  const isOngoing = rideStatus === "ongoing";
  const activeRoute = isOngoing ? routeGeometry : approachRoute;
  const isApproaching = (rideStatus === "arriving" || rideStatus === "otp_pending") && !!approachRoute;

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
    if (!activeRoute || activeRoute.length < 2 || !showCarAnimation) {
      setCarPosition(null);
      setAnimationProgress(0);
      setIsAnimationPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    // If we're searching, don't play the main animation yet
    if (rideStatus === "searching" || rideStatus === "accepted" || rideStatus === "idle") {
      setCarPosition(null);
      return;
    }

    // If completed, just park at the final destination
    if (rideStatus === "completed") {
      setCarPosition(routeGeometry[routeGeometry.length - 1]);
      setIsAnimationPlaying(false);
      return;
    }

    // Set initial position
    setCarPosition(activeRoute[0]);
    setAnimationProgress(0);
    setIsAnimationPlaying(true);

    let startTime = null;

    // Animation duration logic
    // Arriving: fast (5s); Ongoing: medium (15s)
    const animDuration = rideStatus === "ongoing" ? 15000 : 8000;
    const clampedAnimationDuration = animDuration;

    const animateCar = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / clampedAnimationDuration, 1);

      // Smooth ease-in-out easing
      const easedPercentage = percentage < 0.5
        ? 2 * percentage * percentage
        : 1 - Math.pow(-2 * percentage + 2, 2) / 2;

      // Calculate position along the route
      const totalSegments = activeRoute.length - 1;
      const currentFloatIndex = easedPercentage * totalSegments;
      const lowerIndex = Math.floor(currentFloatIndex);
      const upperIndex = Math.min(lowerIndex + 1, totalSegments);
      const segmentProgress = currentFloatIndex - lowerIndex;

      const p1 = activeRoute[lowerIndex];
      const p2 = activeRoute[upperIndex];

      if (p1 && p2) {
        const newPosition = interpolate(p1, p2, segmentProgress);
        setCarPosition(newPosition);
        setAnimationProgress(percentage);

        // Rotation: Look ahead slightly for smoother steering
        const bearing = getBearing(p1, p2);
        setCarRotation(bearing);
      }

      if (percentage < 1) {
        animationRef.current = requestAnimationFrame(animateCar);
      } else {
        // Animation finished
        setCarPosition(activeRoute[activeRoute.length - 1]);
        setAnimationProgress(1);
        setIsAnimationPlaying(false);
      }
    };

    // Start animation
    const delay = 500;
    const timeoutId = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animateCar);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeRoute, durationMin, showCarAnimation, rideStatus]);

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
          icon={createVehicleIcon(rider.vehicleType || "car", 0, "default", false)}
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

      {/* Background Traffic Simulation */}
      {trafficVehicles.map((v) => (
        <Marker
          key={v.id}
          position={v.position}
          icon={createVehicleIcon(v.type, v.rotation, v.variant, false, !!carPosition)}
          zIndexOffset={400}
        />
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

      {/* Enhanced Animated Car Marker with Proper Rotation and Dynamic Visuals */}
      {carPosition && showCarAnimation && (
        <Marker
          position={carPosition}
          icon={createVehicleIcon(
            assignedDriver?.vehicleType || "car",
            carRotation,
            "default",
            true
          )}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="text-center font-bold">
              <strong className="text-blue-600 block mb-1">
                {rideStatus === "arriving" ? "🚕 Driver arriving" :
                  rideStatus === "otp_pending" ? "📍 Driver has arrived" :
                    rideStatus === "ongoing" ? "🚀 Trip in progress" :
                      rideStatus === "completed" ? "✅ Arrived" : "🚗 Vehicle"}
              </strong>
              <p className="text-xs text-gray-500 font-medium">
                {rideStatus === "ongoing" ? `Heading to destination` :
                  rideStatus === "arriving" ? "Heading to pickup" : ""}
              </p>
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
