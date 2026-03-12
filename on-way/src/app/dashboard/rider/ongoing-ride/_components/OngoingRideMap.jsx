"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapResizer({ pickup, drop }) {
    const map = useMap();
    useEffect(() => {
        if (pickup && drop) {
            const bounds = L.latLngBounds([pickup, drop]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, pickup, drop]);
    return null;
}

const OngoingRideMap = ({ pickup, drop }) => {
    const pickupPos = pickup || [23.8103, 90.4125];
    const dropPos = drop || [23.8213, 90.4195];

    return (
        <div className="h-full w-full relative z-10">
            <MapContainer
                center={pickupPos}
                zoom={13}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <Marker position={pickupPos}>
                    <Popup>Pickup Location</Popup>
                </Marker>

                <Marker position={dropPos}>
                    <Popup>Destination</Popup>
                </Marker>

                <Polyline
                    positions={[pickupPos, dropPos]}
                    color="#2563eb"
                    weight={4}
                    dashArray="10, 10"
                />

                <MapResizer pickup={pickupPos} drop={dropPos} />
            </MapContainer>
        </div>
    );
};

export default OngoingRideMap;
