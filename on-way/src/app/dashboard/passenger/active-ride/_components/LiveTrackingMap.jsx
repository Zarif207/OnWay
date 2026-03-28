"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { configureLeafletIcons, voyagerTileLayer } from "@/lib/leafletConfig";

if (typeof window !== 'undefined') {
    configureLeafletIcons();
}

// Custom car icon
const carIcon = new L.Icon({
    iconUrl: '/icons/car.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'car-marker-animated'
});

// Passenger live location icon (Blue pin)
const passengerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    className: 'passenger-marker'
});

// Pickup location icon
const pickupIcon = L.divIcon({
    className: 'pickup-marker',
    html: `
        <div style="
            width: 40px; 
            height: 40px; 
            background: #3b82f6; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg);
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 3px 15px rgba(59, 130, 246, 0.5); 
            border: 3px solid white;
        ">
            <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 20px;">P</div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

// Destination icon
const destinationIcon = L.divIcon({
    className: 'destination-marker',
    html: `
        <div style="
            width: 40px; 
            height: 40px; 
            background: #ef4444; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg);
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 3px 15px rgba(239, 68, 68, 0.5); 
            border: 3px solid white;
        ">
            <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 20px;">D</div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

// Component to auto-fit bounds
function MapBounds({ pickup, dropoff, driver }) {
    const map = useMap();

    useEffect(() => {
        const points = [];
        if (pickup) points.push(pickup);
        if (dropoff) points.push(dropoff);
        if (driver) points.push(driver);

        if (points.length >= 2) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, {
                padding: [80, 80],
                maxZoom: 15
            });
        } else if (points.length === 1) {
            map.setView(points[0], 14);
        }
    }, [pickup, dropoff, driver, map]);

    return null;
}

// Animated polyline component
function AnimatedRoute({ positions }) {
    if (!positions || positions.length < 2) return null;
    return (
        <Polyline
            positions={positions}
            pathOptions={{
                color: '#2fca71',
                weight: 6,
                opacity: 0.8,
                dashArray: '10, 15',
                lineCap: 'round',
                lineJoin: 'round'
            }}
            className="animate-dash"
        />
    );
}

export default function LiveTrackingMap({ pickup, dropoff, driverLocation, passengerLocation, eta, distance }) {
    const [animatedDriver, setAnimatedDriver] = useState(driverLocation);
    const [routeGeometry, setRouteGeometry] = useState([]);
    const prevDriverLocation = useRef(driverLocation);

    // Fetch road route from OSRM
    useEffect(() => {
        const fetchRoute = async () => {
            const start = driverLocation || (pickup ? [pickup[0], pickup[1]] : null);
            const end = pickup ? [pickup[0], pickup[1]] : null;

            if (!start || !end) return;

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
                // Fallback to straight line if API fails
                setRouteGeometry([start, end]);
            }
        };

        fetchRoute();
    }, [driverLocation, pickup]);

    // Smooth driver position animation
    useEffect(() => {
        if (!driverLocation) return;

        // If this is the first location or a big jump, set immediately
        if (!prevDriverLocation.current ||
            Math.abs(driverLocation[0] - (animatedDriver ? animatedDriver[0] : 0)) > 0.01 ||
            Math.abs(driverLocation[1] - (animatedDriver ? animatedDriver[1] : 0)) > 0.01) {
            setAnimatedDriver(driverLocation);
            prevDriverLocation.current = driverLocation;
            return;
        }

        // Smooth animation for small movements
        let frame = 0;
        const frames = 30; // 30 frames for smoother motion over 2 seconds
        const startLat = animatedDriver ? animatedDriver[0] : driverLocation[0];
        const startLng = animatedDriver ? animatedDriver[1] : driverLocation[1];
        const deltaLat = driverLocation[0] - startLat;
        const deltaLng = driverLocation[1] - startLng;

        const animate = () => {
            frame++;
            if (frame <= frames) {
                const progress = frame / frames;
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                setAnimatedDriver([
                    startLat + deltaLat * easeProgress,
                    startLng + deltaLng * easeProgress
                ]);
                requestAnimationFrame(animate);
            } else {
                prevDriverLocation.current = driverLocation;
            }
        };

        requestAnimationFrame(animate);
    }, [driverLocation]);

    return (
        <div className="h-full w-full relative rounded-3xl overflow-hidden shadow-2xl bg-gray-50">
            <style>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -100;
                    }
                }
                .animate-dash {
                    animation: dash 2s linear infinite;
                }
            `}</style>

            <MapContainer
                center={pickup || [23.8103, 90.4125]}
                zoom={14}
                className="h-full w-full"
                zoomControl={false}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url={voyagerTileLayer.url}
                    attribution={voyagerTileLayer.attribution}
                />

                {/* Pickup Marker */}
                {pickup && (
                    <Marker position={pickup} icon={pickupIcon}>
                        <Popup>
                            <div className="text-center p-2">
                                <p className="font-bold text-blue-600">Pickup Location</p>
                                <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest font-bold">Driver is en route</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Dropoff Marker */}
                {dropoff && (
                    <Marker position={dropoff} icon={destinationIcon}>
                        <Popup>
                            <div className="text-center p-2">
                                <p className="font-bold text-red-600">Destination</p>
                                <p className="text-xs text-gray-600 mt-1">Your drop-off point</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Driver Marker with Animation */}
                {animatedDriver && (
                    <Marker position={animatedDriver} icon={carIcon}>
                        <Popup>
                            <div className="text-center p-2">
                                <p className="font-bold text-green-600 uppercase tracking-widest text-[10px]">Your Driver</p>
                                {eta && <p className="text-xs text-gray-900 font-black mt-1">{eta} MIN AWAY</p>}
                                {distance && <p className="text-xs text-gray-500">{distance}m</p>}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Passenger Marker (Live Location) */}
                {passengerLocation && (
                    <Marker position={passengerLocation} icon={passengerIcon}>
                        <Popup>
                            <div className="text-center p-2">
                                <p className="font-bold text-blue-600 uppercase tracking-widest text-[10px]">You</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Route Line (Road Polylines) */}
                {routeGeometry.length >= 2 && (
                    <AnimatedRoute positions={routeGeometry} />
                )}

                {/* Auto-fit bounds */}
                <MapBounds pickup={pickup} dropoff={dropoff} driver={animatedDriver} />
            </MapContainer>

            {/* Floating ETA Badge */}
            {eta && (
                <div className="absolute top-6 left-6 z-[1000] bg-white/95 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] shadow-2xl border border-gray-100 flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                        <Clock size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Estimated Arrival</p>
                        <p className="text-xl font-black text-gray-900 tracking-tighter leading-none">{eta} MIN</p>
                    </div>
                </div>
            )}
        </div>
    );
}
