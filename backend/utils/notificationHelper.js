/**
 * Notification Helper Utility
 * Handles notification creation and real-time emission to admin users
 */

// Socket.io instance will be set from server.js
let io = null;

/**
 * Set Socket.io instance
 * @param {Object} socketIoInstance - Socket.io server instance
 */
function setSocketIO(socketIoInstance) {
  io = socketIoInstance;
  console.log("✅ Socket.io instance set in notification helper");
}

/**
 * Get all admin user IDs from database
 * @param {Object} passengerCollection - MongoDB passenger collection
 * @returns {Promise<Array>} Array of admin user IDs
 */
async function getAdminUserIds(passengerCollection) {
  try {
    const admins = await passengerCollection
      .find({ role: { $in: ["admin", "supportAgent"] } })
      .project({ _id: 1 })
      .toArray();

    return admins.map(admin => admin._id.toString());
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}

/**
 * Create notification in database and emit via socket
 * @param {Object} notificationsCollection - MongoDB notifications collection
 * @param {Object} passengerCollection - MongoDB passenger collection
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
async function createAndEmitNotification(
  notificationsCollection,
  passengerCollection,
  notificationData
) {
  try {
    const { message, type, metadata = {}, targetAdmins = "all" } = notificationData;

    // Get admin user IDs
    let adminIds = [];
    if (targetAdmins === "all") {
      adminIds = await getAdminUserIds(passengerCollection);
    } else if (Array.isArray(targetAdmins)) {
      adminIds = targetAdmins;
    }

    if (adminIds.length === 0) {
      console.warn("⚠️ No admin users found to send notification");
      return null;
    }

    // Create notifications for each admin
    const notifications = adminIds.map(adminId => ({
      userId: adminId,
      message,
      type,
      metadata,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentBy: "system",
      sentByRole: "system",
    }));

    // Insert notifications into database
    const result = await notificationsCollection.insertMany(notifications);
    console.log(`✅ Created ${result.insertedCount} notifications in database`);

    // Emit notifications via Socket.io to each admin
    if (io) {
      adminIds.forEach((adminId, index) => {
        const notification = {
          _id: Object.values(result.insertedIds)[index],
          ...notifications[index],
        };

        // Emit to admin's notification room
        io.to(`user_${adminId}`).emit("newNotification", notification);
        console.log(`🔔 Notification emitted to admin ${adminId}: ${type}`);
      });
    } else {
      console.warn("⚠️ Socket.io not initialized. Notifications saved to DB but not emitted.");
    }

    return {
      success: true,
      count: result.insertedCount,
      notifications: Object.values(result.insertedIds),
    };
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    throw error;
  }
}

/**
 * Notification type constants
 */
const NOTIFICATION_TYPES = {
  USER_REGISTRATION:             "user_registration",
  RIDER_REGISTRATION:            "rider_registration",
  BOOKING_CREATED:               "booking_created",
  BOOKING_CANCELLED:             "booking_cancelled",
  PAYMENT_RECEIVED:              "payment_received",
  EMERGENCY_ALERT:               "emergency_alert",
  SYSTEM_ALERT:                  "system_alert",
  // Passenger-specific
  RIDE_COMPLETED:                "RIDE_COMPLETED",
  PAYMENT_SUCCESS:               "PAYMENT_SUCCESS",
  PAYMENT_FAILED:                "PAYMENT_FAILED",
  BOOKING_CANCELLED_PASSENGER:   "BOOKING_CANCELLED_PASSENGER",
  DRIVER_ASSIGNED:               "DRIVER_ASSIGNED",
  DRIVER_ARRIVED:                "DRIVER_ARRIVED",
};

/**
 * Helper function: Notify new user registration
 */
async function notifyUserRegistration(collections, userData) {
  return createAndEmitNotification(
    collections.notificationsCollection,
    collections.passengerCollection,
    {
      message: `New user registered: ${userData.name} (${userData.email})`,
      type: NOTIFICATION_TYPES.USER_REGISTRATION,
      metadata: {
        userId: userData._id || userData.userId,
        userName: userData.name,
        userEmail: userData.email,
        userRole: userData.role || "passenger",
        registeredAt: new Date(),
      },
    }
  );
}

/**
 * Helper function: Notify new rider registration
 */
async function notifyRiderRegistration(collections, riderData) {
  return createAndEmitNotification(
    collections.notificationsCollection,
    collections.passengerCollection,
    {
      message: `New rider registered: ${riderData.name} - Pending approval`,
      type: NOTIFICATION_TYPES.RIDER_REGISTRATION,
      metadata: {
        riderId: riderData._id || riderData.riderId,
        riderName: riderData.name,
        riderEmail: riderData.email,
        riderPhone: riderData.phone,
        isApproved: riderData.isApproved || false,
        registeredAt: new Date(),
      },
    }
  );
}

/**
 * Helper function: Notify new booking created
 */
async function notifyBookingCreated(collections, bookingData) {
  return createAndEmitNotification(
    collections.notificationsCollection,
    collections.passengerCollection,
    {
      message: `New booking created: ${bookingData.pickupLocation?.address || "Unknown"} → ${bookingData.dropoffLocation?.address || "Unknown"}`,
      type: NOTIFICATION_TYPES.BOOKING_CREATED,
      metadata: {
        bookingId: bookingData._id || bookingData.bookingId,
        passengerId: bookingData.passengerId,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        distance: bookingData.distance,
        price: bookingData.price,
        bookingStatus: bookingData.bookingStatus || "pending",
        createdAt: new Date(),
      },
    }
  );
}

/**
 * Helper function: Notify booking cancellation
 */
async function notifyBookingCancelled(collections, bookingData) {
  return createAndEmitNotification(
    collections.notificationsCollection,
    collections.passengerCollection,
    {
      message: `Booking cancelled: ${bookingData.pickupLocation?.address || "Unknown"} → ${bookingData.dropoffLocation?.address || "Unknown"}`,
      type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
      metadata: {
        bookingId: bookingData._id || bookingData.bookingId,
        passengerId: bookingData.passengerId,
        cancelledAt: new Date(),
      },
    }
  );
}

/**
 * Send a real-time notification directly to a specific passenger.
 * Saves to DB and emits via socket to the passenger's room.
 * Uses HTTP dispatch to the socket-server (port 4001) since passengers
 * connect there, not to the main backend server.
 */
async function notifyPassenger(notificationsCollection, passengerId, type, message, metadata = {}) {
  if (!passengerId) {
    console.warn("⚠️ notifyPassenger: passengerId is required");
    return null;
  }

  try {
    const notification = {
      userId:    passengerId.toString(),
      role:      "passenger",
      type,
      message,
      metadata,
      isRead:    false,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentBy:    "system",
    };

    // 1. Persist to MongoDB
    const result = await notificationsCollection.insertOne(notification);
    const saved  = { _id: result.insertedId.toString(), ...notification };

    // 2. Emit via main backend io (covers sockets connected to port 5000)
    if (io) {
      io.to(`user_${passengerId}`).emit("passenger:notification", saved);
      io.to(`passenger:${passengerId}`).emit("passenger:notification", saved);
    }

    // 3. Dispatch to socket-server (port 4001) — passengers connect here
    const axios = require("axios");
    const socketUrl = process.env.SOCKET_URL || "http://localhost:4001";
    try {
      await axios.post(`${socketUrl}/api/notify-passenger`, {
        passengerId: passengerId.toString(),
        notification: saved,
      }, { timeout: 3000 });
    } catch (dispatchErr) {
      // Non-fatal — socket-server may not be running in all envs
      console.warn("⚠️ Could not dispatch to socket-server:", dispatchErr.message);
    }

    console.log(`🔔 Passenger notification → ${passengerId}: [${type}] ${message}`);
    return saved;
  } catch (error) {
    console.error("❌ notifyPassenger error:", error);
    return null;
  }
}

module.exports = {
  setSocketIO,
  getAdminUserIds,
  createAndEmitNotification,
  notifyUserRegistration,
  notifyRiderRegistration,
  notifyBookingCreated,
  notifyBookingCancelled,
  notifyPassenger,
  NOTIFICATION_TYPES,
};
