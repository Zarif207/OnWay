import { createContext, useContext, useEffect, useState } from "react";

const EarnRegistrationContext = createContext();

const STORAGE_KEY = "onway_rider_registration_data";

export function EarnRegistrationProvider({ children }) {
  // Initial state structure
  const initialState = {
    // Step 1: Landing Page
    vehicleType: "Bike",
    activeCategory: "bike",
    selectedModel: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    district: "Dhaka",
    bloodGroup: "",
    documents: {
      license: { uploaded: false, image: "" },
      passport: { uploaded: false, image: "" },
      nid: { uploaded: false, image: "" }
    },
    documentType: "NID",
    documentImage: null,
    documentFile: null,
    documentDetails: {}, // Stores all smart OCR fields (bloodGroup, fatherName, etc.)
    extractedData: {
      fullName: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      documentNumber: "",
      documentType: "",
      bloodGroup: "",
      fatherName: "",
      nationality: "",
      issueDate: "",
      expiryDate: "",
      address: "",
    },

    // Step 2: Personal Info
    gender: "Male",
    dateOfBirth: "",
    serviceProvide: [],
    identityType: "NID",
    identityNumber: "",
    identity: {
      type: "NID",
      number: "",
    },
    referralCode: "",
    riderImage: null,
    cities: [],
    emergencyName: "",   // Sync with PersonalInfoPage
    emergencyMobile: "", // Sync with PersonalInfoPage

    // Step 3: Vehicle Info
    brand: "",
    model: "",
    licenseNumber: "",
    registrationRegion: "Dhaka",
    registrationCategory: "Metric",
    registrationDigits: "",
    year: "",
    taxTokenNumber: "",
    fitnessNumber: "",
    licenseNumber: "",
    registrationNumber: "",

    // Face Verification
    faceVerification: {
      isVerified: false,
      verificationStatus: "pending",
      verifiedAt: null,
      verificationMethod: "face_match",
      confidenceScore: 0,
      verificationImage: "",
      faceEmbedding: [],
      lastVerificationAttempt: null,
      verificationAttempts: 0
    },
    isFaceVerified: false,
  };

  // Store all form data across the 3 steps
  const [formData, setFormData] = useState(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Don't restore files/blobs as they can't be serialized
        setFormData(prev => ({ ...prev, ...parsed, riderImage: null }));
      } catch (e) {
        console.error("Failed to parse saved registration data", e);
      }
    }
  }, []);

  // Sync to localStorage on change
  useEffect(() => {
    // Don't save if it's the very initial empty state to avoid overwriting
    if (formData.firstName || formData.email || formData.mobileNumber) {
      const dataToSave = { ...formData };
      delete dataToSave.riderImage; // Remove non-serializable data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [formData]);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const clearRegistrationData = () => {
    setFormData(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <EarnRegistrationContext.Provider value={{ formData, updateFormData, setFormData, clearRegistrationData }}>
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
