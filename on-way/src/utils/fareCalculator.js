export const FARE_RATES = {
  standard: { base: 50, perKm: 15, name: "Standard", icon: "🚗" },
  premium: { base: 80, perKm: 25, name: "Premium", icon: "🚙" },
  bike: { base: 30, perKm: 10, name: "Bike", icon: "🏍️" },
};

/**
 * Calculates the total fare based on route distance and ride type.
 * @param {number} distance - Distance in kilometers
 * @param {string} rideType - 'standard', 'premium', or 'bike'
 * @returns {number} Final calculated fare (rounded)
 */
export const calculateFare = (distance, rideType = "standard") => {
  if (!distance || distance <= 0) return 0;
  
  const rates = FARE_RATES[rideType] || FARE_RATES.standard;
  const fare = rates.base + (distance * rates.perKm);
  
  return Math.round(fare);
};
