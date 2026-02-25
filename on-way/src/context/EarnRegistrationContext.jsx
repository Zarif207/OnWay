"use client";

import { createContext, useContext, useState } from "react";

const EarnRegistrationContext = createContext();

export function EarnRegistrationProvider({ children }) {
  // Store all form data across the 3 steps
  const [formData, setFormData] = useState({
    // Step 1: Landing Page
    vehicleType: "Bike",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    city: "Dhaka",

    // Step 2: Personal Info
    gender: "Male",
    dateOfBirth: "",
    serviceProvide: [],
    identityType: "NID",
    identityNumber: "",
    referralCode: "",
    photo: null,

    // Step 3: Vehicle Info
    brand: "",
    model: "",
    registrationRegion: "Dhaka",
    registrationCategory: "Metric",
    registrationDigits: "",
    year: "",
    taxTokenNumber: "",
    fitnessNumber: "",
  });

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <EarnRegistrationContext.Provider value={{ formData, updateFormData, setFormData }}>
      {children}
    </EarnRegistrationContext.Provider>
  );
}

export function useEarnRegistration() {
  const context = useContext(EarnRegistrationContext);
  if (!context) {
    throw new Error("useEarnRegistration must be used within an EarnRegistrationProvider");
  }
  return context;
}
