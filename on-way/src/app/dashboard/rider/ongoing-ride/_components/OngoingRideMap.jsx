"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { configureLeafletIcons, voyagerTileLayer } from "@/lib/leafletConfig";

if (typeof window !== 'undefined') {
    configureLeafletIcons();
}

const driverIcon = L.divIcon({
    className: 'car-marker-container',
    html: `
        <div style="width: 45px; height: 45px; background: #2fca71; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(47, 202, 113, 0.6); border: 3px solid white; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);">
             <span style="font-size: 24px;">🚗</span>
        </div>
    `,
    iconSize: [45, 45],
    iconAnchor: [22, 22],
});

function MapResizer({ pickup, drop, driverPos }) {
    const map = useMap();
    useEffect(() => {
        const points = [];
        if (pickup) points.push(pickup);
        if (drop) points.push(drop);
        if (driverPos) points.push(driverPos);

        if (points.length >= 2) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 });
        }
    }, [map, pickup, drop, driverPos]);
    return null;
}

const OngoingRideMap = ({ pickup, drop, driverPos }) => {
    const [routeGeometry, setRouteGeometry] = React.useState([]);
    const pickupPos = pickup || [23.8103, 90.4125];
    const dropPos = drop || [23.8213, 90.4195];

    // Fetch road route from OSRM
    useEffect(() => {
        const fetchRoute = async () => {
            const start = driverPos || pickupPos;
            const end = dropPos;

            try {
                const response = await fetch(
                    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
                );
                const data = await response.json();
                if (data.routes && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    setRouteGeometry(coords);
                }
            } catch (error) {
                console.error("Error fetching road route:", error);
                setRouteGeometry([start, end]);
            }
        };

        fetchRoute();
    }, [driverPos, pickupPos, dropPos]);

    return (
        <div className="h-full w-full relative z-10">
            <style>{`
                .leaf-polyline-green {
                    filter: drop-shadow(0 0 5px rgba(47, 202, 113, 0.5));
                }
            `}</style>
            <MapContainer
                center={pickupPos}
                zoom={14}
                className="h-full w-full bg-gray-50"
                zoomControl={false}
            >
                <TileLayer
                    url={voyagerTileLayer.url}
                    attribution={voyagerTileLayer.attribution}
                />

                <Marker position={pickupPos}>
                    <Popup>Pickup Location</Popup>
                </Marker>

                <Marker position={dropPos}>
                    <Popup>Destination</Popup>
                </Marker>

                {/* Main Route Line (Road Polylines) */}
                {routeGeometry.length >= 2 && (
                    <>
                        <Polyline
                            positions={routeGeometry}
                            color="#2fca71"
                            weight={6}
                            opacity={0.8}
                            className="leaf-polyline-green"
                        />
                        <Polyline
                            positions={routeGeometry}
                            color="#ffffff"
                            weight={2}
                            dashArray="1, 15"
                            opacity={0.5}
                        />
                    </>
                )}

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
