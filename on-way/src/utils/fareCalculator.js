export const FARE_RATES = {
  classic: {
    base: 50,
    perKm: 15,
    minFare: 80,
    name: "Classic",
    icon: "🚗"
  },
  premium: {
    base: 80,
    perKm: 25,
    minFare: 150,
    name: "Premium",
    icon: "🚙"
  },
  bike: {
    base: 30,
    perKm: 10,
    minFare: 50,
    name: "Bike",
    icon: "🏍️"
  },
  ambulance: {
    base: 100,
    perKm: 1,
    minFare: 200,
    name: "Ambulance",
    icon: "🚑"
  }
};

/**
 * @param {number} distance (in kilometers)
 * @param {string} rideType
 * @param {number} multiplier
 */
export const calculateFare = (distance, rideType = "classic", multiplier = 1.0) => {
  if (!distance || distance <= 0) return 0;
  
  const rates = FARE_RATES[rideType] || FARE_RATES.classic;
  const BOOKING_FEE = 15;

  let travelCost = rates.base + (distance * rates.perKm);

  let surgedTravelCost = travelCost * multiplier;

  if (distance > 20) {
    surgedTravelCost *= 0.95;
  }

  const totalFare = surgedTravelCost + BOOKING_FEE;

  const surgedMinFare = rates.minFare * Math.max(multiplier, 1.0);
  const finalFare = Math.max(totalFare, surgedMinFare);

  return Math.ceil(finalFare / 5) * 5;
};