"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet markers in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pickupIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673188.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/5693/5693831.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const driverIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
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
            <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="w-full h-full" zoomControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
