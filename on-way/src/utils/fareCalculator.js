export const FARE_RATES = {
  standard: { base: 50, perKm: 15, name: "Standard", icon: "🚗" },
  premium: { base: 80, perKm: 25, name: "Premium", icon: "🚙" },
  bike: { base: 30, perKm: 10, name: "Bike", icon: "🏍️" },
};

export const calculateFare = (distance, rideType = "standard", multiplier = 1.0) => {
  if (!distance || distance <= 0) return 0;

  const rates = FARE_RATES[rideType] || FARE_RATES.standard;

  // Logic: Base Fare + (Distance * Rate * Multiplier)
  const fare = rates.base + (distance * rates.perKm * multiplier);

  return Math.round(fare);
};