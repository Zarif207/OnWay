"use client";

import { createContext, useContext, useState } from "react";

const EarnRegistrationContext = createContext();

export function EarnRegistrationProvider({ children }) {
  // Store all form data across the 3 steps
  const [formData, setFormData] = useState({
    // Step 1: Landing Page
    vehicleType: "Bike",
    activeCategory: "bike", // NEW: to store "car" | "bike" | "ambulance"
    selectedModel: "",      // NEW: to store specific model like "Sedan", "Motorcycle"
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",              // Added to sync with form
    district: "Dhaka",
    city: "",               // Added to sync with form

    // Step 2: Personal Info
    gender: "Male",
    dateOfBirth: "",
    serviceProvide: [],
    identityType: "NID",
    identityNumber: "",
    referralCode: "",
    riderImage: null,       // Renamed from photo to match field name in personal-info/page.jsx
    cities: [],             // Added to store operation cities

    // Step 3: Vehicle Info
    brand: "",
    model: "",              // vehicleModel in payload
    registrationRegion: "Dhaka",
    registrationCategory: "Metric",
    registrationDigits: "", // vehicleNumber in payload
    year: "",
    taxTokenNumber: "",
    fitnessNumber: "",
    licenseNumber: "",      // NEW: required in payload
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
