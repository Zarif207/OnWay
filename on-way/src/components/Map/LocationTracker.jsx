"use client";

import { useEffect, useState, useRef } from "react";
import { initSocket, disconnectSocket } from "@/utils/socket";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components since they require window (not SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
// A component to handle map centering dynamically
const RecenterMap = dynamic(
  () => import("./MapUpdater").then((mod) => mod.default),
  { ssr: false }
);


export default function LocationTracker({ role, rideId, initialLocation }) {
  const [position, setPosition] = useState(
    initialLocation || [23.8103, 90.4125] // Default to Dhaka
  );
  const [socket, setSocket] = useState(null);
  const [driverId] = useState(`driver_${Math.floor(Math.random() * 1000)}`); // Mock auth ID
  const watchIdRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Socket
    const s = initSocket();
    setSocket(s);

    // 2. Join the specific ride room
    if (rideId) {
      s.emit("joinRide", rideId);
    }

    // 3. Setup based on Role
    if (role === "driver") {
        startTrackingAsDriver(s);
    } else if (role === "passenger") {
        startListeningAsPassenger(s);
    }

    // 4. Cleanup
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      disconnectSocket();
    };
  }, [role, rideId]);


  const startTrackingAsDriver = (s) => {
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (loc) => {
          const newPos = [loc.coords.latitude, loc.coords.longitude];
          setPosition(newPos);
          
          // Emit via Socket
          s.emit("gpsUpdate", {
            rideId,
            driverId,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });

          // Save to DB via API
          updateLocationInDb(loc.coords.latitude, loc.coords.longitude);
        },
        (error) => console.error("Error watching position:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const startListeningAsPassenger = (s) => {
    s.on("receiveGpsUpdate", (data) => {
      console.log("Passenger received GPS Update:", data);
      
      const newPos = [data.latitude, data.longitude];
      
      // OPTIMIZATION: Instead of setting state immediately which might re-render 
      // the whole map badly, we could just update the marker reference if we had direct access.
      // For React-Leaflet, updating state is usually okay if MapContainer is stable,
      // but if performance drops, we update the leafet marker instance directly.
      setPosition(newPos);
    });
  };

  const updateLocationInDb = async (lat, lng) => {
    try {
      // In a real app, use the actual backend API URL. Next.js can proxy it or use absolute URL.
      // Assuming Next.js app is proxying or pointing to localhost:5000
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/location/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId,
          rideId,
          latitude: lat,
          longitude: lng,
        }),
      });
    } catch (err) {
      console.error("Failed to update location to backend API", err);
    }
  };

  // Fix for default Leaflet icon not loading in Next.js
  const getIcon = () => {
      if (typeof window === 'undefined') return null;
      const L = require('leaflet');
      return new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
  };

  return (
    <div className="h-[400px] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative">
      {!position && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-[1000]">
              <span className="text-gray-600 font-medium">Getting location...</span>
          </div>
      )}
      
      {position && (
         <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
         >
           <TileLayer
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
           />
           <Marker position={position} icon={getIcon() || undefined} ref={markerRef}>
             <Popup>
               {role === "driver" ? "You are here" : "Driver is here"}
             </Popup>
           </Marker>
           
           {/* Component to recenter map smoothly when position changes */}
           {role === "passenger" && <RecenterMap position={position} /> }
           
         </MapContainer>
      )}
    </div>
  );
}
