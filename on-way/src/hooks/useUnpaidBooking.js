import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Checks whether the given passenger has an unpaid booking.
 * Returns { hasUnpaid, unpaidBookingId, loading, recheck }
 */
export function useUnpaidBooking(passengerId) {
  const [hasUnpaid, setHasUnpaid]               = useState(false);
  const [unpaidBookingId, setUnpaidBookingId]   = useState(null);
  const [loading, setLoading]                   = useState(false);

  const recheck = useCallback(async () => {
    if (!passengerId) return;
    // Skip if not a valid MongoDB ObjectId — avoids a 400/500 from the backend
    if (!/^[a-f\d]{24}$/i.test(passengerId)) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/bookings/unpaid-check?passengerId=${passengerId}`);
      const data = await res.json();
      if (data.success) {
        setHasUnpaid(data.hasUnpaid);
        setUnpaidBookingId(data.unpaidBookingId ?? null);
      }
    } catch {
      // silently fail — don't block the UI on a network hiccup
    } finally {
      setLoading(false);
    }
  }, [passengerId]);

  useEffect(() => {
    recheck();
  }, [recheck]);

  return { hasUnpaid, unpaidBookingId, loading, recheck };
}
