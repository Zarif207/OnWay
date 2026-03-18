import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket;

export const initRiderSocket = (riderId) => {
    if (!socket && riderId) {
        socket = io(SOCKET_URL, {
            auth: {
                role: "rider",
                userId: riderId,
            },
            transports: ["websocket", "polling"],
            withCredentials: true
        });
        console.log("🔌 Rider Socket Initialized:", SOCKET_URL, { riderId });
    }
    return socket;
};

export const getRiderSocket = (riderId) => {
    if (!socket) {
        return initRiderSocket(riderId);
    }
    return socket;
};

export const disconnectRiderSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("🔌 Rider Socket Disconnected");
    }
};

// --- PASSENGER SOCKET ---
let passengerSocket;

export const initPassengerSocket = (passengerId) => {
    if (!passengerSocket && passengerId) {
        passengerSocket = io(SOCKET_URL, {
            auth: {
                role: "passenger",
                userId: passengerId,
            },
            transports: ["websocket", "polling"],
            withCredentials: true
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
