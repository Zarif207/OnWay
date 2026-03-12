import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket;

export const initPassengerSocket = (passengerId) => {
    if (!socket && passengerId) {
        socket = io(SOCKET_URL, {
            auth: {
                role: "passenger",
                userId: passengerId,
            },
            transports: ["websocket", "polling"],
            withCredentials: true
        });
        console.log("🔌 Passenger Socket Initialized:", SOCKET_URL, { passengerId });

        socket.on("connect", () => {
            console.log("✅ Passenger Socket Connected:", socket.id);
        });

        socket.on("connect_error", (error) => {
            console.error("❌ Passenger Socket Connection Error:", error);
        });
    }
    return socket;
};

export const getPassengerSocket = (passengerId) => {
    if (!socket) {
        return initPassengerSocket(passengerId);
    }
    return socket;
};

export const disconnectPassengerSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("🔌 Passenger Socket Disconnected");
    }
};
