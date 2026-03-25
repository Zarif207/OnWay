/**
 * Notification Helper
 * Saves notifications to MongoDB and forwards real-time emission
 * to the dedicated Socket Server via HTTP POST.
 */

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || "http://localhost:4001";

// ── HTTP emit helper ──────────────────────────────────────────
async function emitViaSocketServer(event, room, payload) {
  try {
    const res = await fetch(`${SOCKET_SERVER_URL}/api/emit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, room, payload }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn(`⚠️  Socket server emit failed [${res.status}]: ${text}`);
    }
  } catch (err) {
    // Socket server may be down — notifications are already in DB, so non-fatal
    console.warn("⚠️  Could not reach socket server for real-time emit:", err.message);
  }
}

// ── Admin ID lookup ───────────────────────────────────────────
async function getAdminUserIds(passengerCollection) {
  try {
    const admins = await passengerCollection
      .find({ role: { $in: ["admin", "supportAgent"] } })
      .project({ _id: 1 })
      .toArray();
    return admins.map(a => a._id.toString());
  } catch (err) {
    console.error("Error fetching admin users:", err);
    return [];
  }
}

// ── Core: persist + emit ──────────────────────────────────────
async function createAndEmitNotification(
  notificationsCollection,
  passengerCollection,
  { message, type, metadata = {}, targetAdmins = "all" }
) {
  try {
    const adminIds =
      targetAdmins === "all"
        ? await getAdminUserIds(passengerCollection)
        : Array.isArray(targetAdmins)
        ? targetAdmins
        : [];

    if (adminIds.length === 0) {
      console.warn("⚠️  No admin users found — notification not sent");
      return null;
    }

    const docs = adminIds.map(userId => ({
      userId,
      message,
      type,
      metadata,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentBy: "system",
      sentByRole: "system",
    }));

    const result = await notificationsCollection.insertMany(docs);
    console.log(`✅ ${result.insertedCount} notification(s) saved to DB`);

    // Forward to socket server for real-time delivery
    const insertedIds = Object.values(result.insertedIds);
    for (let i = 0; i < adminIds.length; i++) {
      const notification = { _id: insertedIds[i], ...docs[i] };
      await emitViaSocketServer("newNotification", `user_${adminIds[i]}`, notification);
    }

    return { success: true, count: result.insertedCount };
  } catch (err) {
    console.error("❌ createAndEmitNotification error:", err);
    throw err;
  }
}

// ── Notification type constants ───────────────────────────────
const NOTIFICATION_TYPES = {
  USER_REGISTRATION:  "user_registration",
  RIDER_REGISTRATION: "rider_registration",
  BOOKING_CREATED:    "booking_created",
  BOOKING_CANCELLED:  "booking_cancelled",
  PAYMENT_RECEIVED:   "payment_received",
  EMERGENCY_ALERT:    "emergency_alert",
  SYSTEM_ALERT:       "system_alert",
};

// ── Convenience helpers ───────────────────────────────────────
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

async function notifyRiderRegistration(collections, riderData) {
  return createAndEmitNotification(
    collections.notificationsCollection,
    collections.passengerCollection,
    {
      message: `New rider registered: ${riderData.name} — Pending approval`,
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

async function notifyBookingCreated(collections, bookingData) {
  return createAndEmitNotification(
    collections.notificationsCollection,
    collections.passengerCollection,
    {
      message: `New booking: ${bookingData.pickupLocation?.address || "?"} → ${bookingData.dropoffLocation?.address || "?"}`,
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

async function notifyBookingCancelled(collections, bookingData) {
  return createAndEmitNotification(
    collections.notificationsCollection,
    collections.passengerCollection,
    {
      message: `Booking cancelled: ${bookingData.pickupLocation?.address || "?"} → ${bookingData.dropoffLocation?.address || "?"}`,
      type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
      metadata: {
        bookingId: bookingData._id || bookingData.bookingId,
        passengerId: bookingData.passengerId,
        cancelledAt: new Date(),
      },
    }
  );
}

module.exports = {
  getAdminUserIds,
  createAndEmitNotification,
  notifyUserRegistration,
  notifyRiderRegistration,
  notifyBookingCreated,
  notifyBookingCancelled,
  NOTIFICATION_TYPES,
};
