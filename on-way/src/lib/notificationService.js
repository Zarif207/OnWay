import { io } from "socket.io-client";

let socket = null;

// Initialize socket connection
export const initializeSocket = (socketUrl) => {
  if (!socket) {
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("🔌 Notification service connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Notification service disconnected");
    });
  }

  return socket;
};

// Get socket instance
export const getSocket = () => {
  return socket;
};

// Send notification via socket
export const sendNotification = (userId, message, type, metadata = {}) => {
  if (!socket || !socket.connected) {
    console.error("Socket not connected. Cannot send notification.");
    return false;
  }

  socket.emit("sendNotification", {
    userId,
    message,
    type,
    metadata,
  });

  console.log(`🔔 Notification sent to user ${userId}: ${type}`);
  return true;
};

// Notification type constants
export const NOTIFICATION_TYPES = {
  BOOKING: "booking",
  DRIVER_REGISTRATION: "driver_registration",
  CANCELLATION: "cancellation",
  PAYMENT: "payment",
  SYSTEM: "system",
};

// Helper functions for specific notification types
export const notifyNewBooking = (adminId, bookingDetails) => {
  return sendNotification(
    adminId,
    `New ride booking from ${bookingDetails.passengerName || "a passenger"}`,
    NOTIFICATION_TYPES.BOOKING,
    bookingDetails
  );
};

export const notifyDriverRegistration = (adminId, driverDetails) => {
  return sendNotification(
    adminId,
    `New driver registration: ${driverDetails.name || "Unknown"} - Pending approval`,
    NOTIFICATION_TYPES.DRIVER_REGISTRATION,
    driverDetails
  );
};

export const notifyRideCancellation = (adminId, cancellationDetails) => {
  return sendNotification(
    adminId,
    `Ride cancelled by ${cancellationDetails.cancelledBy || "user"}`,
    NOTIFICATION_TYPES.CANCELLATION,
    cancellationDetails
  );
};

export const notifyPaymentUpdate = (adminId, paymentDetails) => {
  return sendNotification(
    adminId,
    `Payment ${paymentDetails.status || "update"}: ₹${paymentDetails.amount || 0}`,
    NOTIFICATION_TYPES.PAYMENT,
    paymentDetails
  );
};

export const notifySystemAlert = (adminId, alertMessage, alertDetails = {}) => {
  return sendNotification(
    adminId,
    alertMessage,
    NOTIFICATION_TYPES.SYSTEM,
    alertDetails
  );
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
