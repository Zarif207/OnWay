"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const pickupIcon = L.divIcon({
    html: '<div class="w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center"><div class="w-1 h-1 bg-white rounded-full"></div></div>',
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const dropIcon = L.divIcon({
    html: '<div class="w-6 h-6 bg-[#011421] rounded-full border-4 border-white shadow-xl flex items-center justify-center"><div class="w-2 h-2 bg-green-500 rounded-sm"></div></div>',
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

export default function RideRequestMap({ pickup, drop }) {
    const center = [
        (pickup[0] + drop[0]) / 2,
        (pickup[1] + drop[1]) / 2,
    ];

    return (
        <div className="h-full w-full relative z-[100]">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                zoomControl={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    // Adding filter for dark/premium look if needed
                    className="map-tiles"
                />
                <Marker position={pickup} icon={pickupIcon}>
                    <Popup>Pickup Point</Popup>
                </Marker>
                <Marker position={drop} icon={dropIcon}>
                    <Popup>Destination</Popup>
                </Marker>
                <Polyline
                    positions={[pickup, drop]}
                    color="#259461"
                    weight={5}
                    dashArray="8, 12"
                    className="animate-pulse"
                />
                <ZoomControl position="bottomright" />
            </MapContainer>
        </div>
    );
}
