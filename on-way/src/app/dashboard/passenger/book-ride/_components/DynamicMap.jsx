"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { configureLeafletIcons, darkThemeTileLayer } from "@/lib/leafletConfig";

// Initialize Leaflet global configurations
if (typeof window !== 'undefined') {
    configureLeafletIcons();
}

const carMarkerTransition = `
  .car-marker-transition {
    transition: all 0.5s ease-in-out;
  }
`;

const pickupIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Using similar pin for consistency
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    className: 'dropoff-marker' // Can style differently in CSS
});

const driverIcon = L.divIcon({
    className: 'car-marker-container',
    html: `
        <div class="car-marker-transition" style="width: 40px; height: 40px; background: #2fca71; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(47, 202, 113, 0.5); border: 2px solid white;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42.99L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

// Component to dynamically fit bounds when markers change
function MapBounds({ pickup, dropoff }) {
    const map = useMap();
    useEffect(() => {
        if (pickup && dropoff) {
            const bounds = L.latLngBounds([pickup, dropoff]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (pickup) {
            map.setView(pickup, 15);
        } else if (dropoff) {
            map.setView(dropoff, 15);
        }
    }, [pickup, dropoff, map]);
    return null;
}

function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function DynamicMap({ pickup, dropoff, driver, nearbyRiders = [], onMapClick }) {
    // Default position: Dhaka City center
    const [position] = useState([23.8103, 90.4125]);

    return (
        <div className="w-full h-full z-0 relative">
            <style>{carMarkerTransition}</style>
            <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="w-full h-full" zoomControl={false}>
                <TileLayer
                    attribution={darkThemeTileLayer.attribution}
                    url={darkThemeTileLayer.url}
                />

                {pickup && (
                    <Marker position={pickup} icon={pickupIcon}>
                        <Popup>
                            <div className="font-semibold text-gray-800 text-xs text-center border-b pb-1 mb-1 border-gray-100 uppercase tracking-widest">Pickup</div>
                        </Popup>
                    </Marker>
                )}

                {dropoff && (
                    <Marker position={dropoff} icon={dropoffIcon}>
                        <Popup>
                            <div className="font-semibold text-gray-800 text-xs text-center border-b pb-1 mb-1 border-gray-100 uppercase tracking-widest">Drop-off</div>
                        </Popup>
                    </Marker>
                )}

                {driver && (
                    <Marker position={driver} icon={driverIcon}>
                        <Popup>
                            <div className="font-semibold text-gray-800 text-xs text-center uppercase tracking-widest">Your Driver</div>
                        </Popup>
                    </Marker>
                )}

                {/* Nearby Riders (Car Icons) */}
                {nearbyRiders.map((rider) => (
                    <Marker
                        key={rider.id || rider._id}
                        position={[rider.lat, rider.lng]}
                        icon={driverIcon}
                    >
                        <Popup>
                            <div className="text-[10px] font-black uppercase tracking-tighter text-secondary">Nearby Rider</div>
                        </Popup>
                    </Marker>
                ))}

                {pickup && dropoff && (
                    <Polyline positions={[pickup, dropoff]} color="#2FCA71" weight={4} dashArray="10, 10" className="animate-pulse" />
                )}

                <MapBounds pickup={pickup || driver} dropoff={dropoff} />
                <MapClickHandler onMapClick={onMapClick} />
            </MapContainer>
        </div>
    );
}
