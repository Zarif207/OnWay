"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet markers in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

export default function DynamicMap({ pickup, dropoff }) {
    // Default position: Dhaka City center
    const [position] = useState([23.8103, 90.4125]);

    return (
        <div className="w-full h-[300px] md:h-full min-h-[300px] z-0 relative rounded-3xl overflow-hidden shadow-lg border border-white/40">
            <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="w-full h-full" zoomControl={false}>
                {/* Using a clean, modern tile layer suitable for light mode ride apps */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {pickup && (
                    <Marker position={pickup}>
                        <Popup>
                            <div className="font-semibold text-gray-800">Pickup Location</div>
                        </Popup>
                    </Marker>
                )}

                {dropoff && (
                    <Marker position={dropoff}>
                        <Popup>
                            <div className="font-semibold text-gray-800">Drop-off Location</div>
                        </Popup>
                    </Marker>
                )}

                {pickup && dropoff && (
                    <Polyline positions={[pickup, dropoff]} color="#2FCA71" weight={4} dashArray="10, 10" className="animate-pulse" />
                )}

                <MapBounds pickup={pickup} dropoff={dropoff} />
            </MapContainer>
        </div>
    );
}
