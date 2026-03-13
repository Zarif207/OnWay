import { io } from "socket.io-client";

// In production, this should be an environment variable
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket;

export const initSocket = (authData = null) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: authData, // Pass userId and role here
      withCredentials: true
    });
    console.log("Socket initialized with auth:", SOCKET_URL, authData);
  }
  return socket;
};

export const getSocket = (authData = null) => {
  if (!socket) {
    return initSocket(authData);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
