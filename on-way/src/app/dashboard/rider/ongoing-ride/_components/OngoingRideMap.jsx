"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { configureLeafletIcons, darkThemeTileLayer } from "@/lib/leafletConfig";

if (typeof window !== 'undefined') {
    configureLeafletIcons();
}

const driverIcon = L.divIcon({
    className: 'car-marker-container',
    html: `
        <div style="width: 40px; height: 40px; background: #2fca71; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(47, 202, 113, 0.5); border: 2px solid white; transition: all 0.5s ease-in-out;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42.99L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

function MapResizer({ pickup, drop, driverPos }) {
    const map = useMap();
    useEffect(() => {
        const points = [pickup, drop].filter(Boolean);
        if (driverPos) points.push(driverPos);

        if (points.length >= 2) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [80, 80] });
        }
    }, [map, pickup, drop, driverPos]);
    return null;
}

const OngoingRideMap = ({ pickup, drop, driverPos }) => {
    const pickupPos = pickup || [23.8103, 90.4125];
    const dropPos = drop || [23.8213, 90.4195];

    return (
        <div className="h-full w-full relative z-10">
            <MapContainer
                center={pickupPos}
                zoom={14}
                className="h-full w-full bg-[#011421]"
                zoomControl={false}
            >
                <TileLayer
                    url={darkThemeTileLayer.url}
                    attribution={darkThemeTileLayer.attribution}
                />

                <Marker position={pickupPos}>
                    <Popup>Pickup Location</Popup>
                </Marker>

                <Marker position={dropPos}>
                    <Popup>Destination</Popup>
                </Marker>

                <Polyline
                    positions={[pickupPos, dropPos]}
                    color="#2fca71"
                    weight={5}
                    dashArray="10, 15"
                    className="animate-pulse"
                />

                {driverPos && (
                    <Marker position={driverPos} icon={driverIcon}>
                        <Popup>Your Current Position</Popup>
                    </Marker>
                )}

                <MapResizer pickup={pickupPos} drop={dropPos} driverPos={driverPos} />
            </MapContainer>
        </div>
    );
};

export default OngoingRideMap;
