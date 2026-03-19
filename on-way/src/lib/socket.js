// src/lib/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

let riderSocket = null;
let passengerSocket = null;

// ─── RIDER SOCKET ───────────────────────────────────────────────
export const initRiderSocket = (riderId) => {
    if (!riderSocket && riderId) {
        riderSocket = io(SOCKET_URL, {
            transports: ["polling", "websocket"],
            auth: { userId: riderId, role: "rider" },
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
        });

        riderSocket.on("connect", () => {
            console.log("🔌 Rider Socket Connected:", riderSocket.id);
            riderSocket.emit("registerUser", { userId: riderId, role: "rider" });
        });

        console.log("🔌 Rider Socket Initialized:", SOCKET_URL, { riderId });
    }
    return riderSocket;
};

export const getRiderSocket = (riderId) => {
    if (!riderSocket) {
        return initRiderSocket(riderId);
    }
    return riderSocket;
};

export const disconnectRiderSocket = () => {
    if (riderSocket) {
        riderSocket.disconnect();
        riderSocket = null;
        console.log("🔌 Rider Socket Disconnected");
    }
};

// ─── PASSENGER SOCKET ───────────────────────────────────────────
export const initPassengerSocket = (passengerId) => {
    if (!passengerSocket && passengerId) {
        passengerSocket = io(SOCKET_URL, {
            transports: ["polling", "websocket"],
            auth: { userId: passengerId, role: "passenger" },
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
        });

        passengerSocket.on("connect", () => {
            console.log("🔌 Passenger Socket Connected:", passengerSocket.id);
            passengerSocket.emit("registerUser", { userId: passengerId, role: "passenger" });
            passengerSocket.emit("joinNotifications", passengerId);
        });

        console.log("🔌 Passenger Socket Initialized:", SOCKET_URL, { passengerId });
    }
    return passengerSocket;
};

export const getPassengerSocket = (passengerId) => {
    if (!passengerSocket) {
        return initPassengerSocket(passengerId);
    }
    return passengerSocket;
};

export const disconnectPassengerSocket = () => {
    if (passengerSocket) {
        passengerSocket.disconnect();
        passengerSocket = null;
        console.log("🔌 Passenger Socket Disconnected");
    }
};

// ─── DISCONNECT ALL ──────────────────────────────────────────────
export const disconnectAll = () => {
    disconnectRiderSocket();
    disconnectPassengerSocket();
};
