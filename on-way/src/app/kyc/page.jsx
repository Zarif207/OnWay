"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  User,
  FileText,
  Car,
  ChevronRight,
  ChevronLeft,
  Eye,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

// Image upload field component
function ImageUploadField({ label, name, value, onChange, required }) {
  const inputRef = useRef();
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-[#2FCA71] transition-colors flex flex-col items-center gap-2 bg-gray-50 min-h-[100px] justify-center"
      >
        {value ? (
          <div className="relative w-full">
            <img
              src={value}
              alt={label}
              className="w-full max-h-40 object-contain rounded-lg"
            />
            <p className="text-xs text-green-600 text-center mt-1 font-medium">✓ Uploaded</p>
          </div>
        ) : (
          <>
            <Upload size={24} className="text-gray-400" />
            <p className="text-sm text-gray-500 text-center">Click to upload {label}</p>
            <p className="text-xs text-gray-400">JPG, PNG (max 5MB)</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be under 5MB");
            return;
          }
          const base64 = await toBase64(file);
          onChange(name, base64);
        }}
      />
    </div>
  );
}

const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "License", icon: FileText },
  { id: 3, label: "Vehicle", icon: Car },
];

export default function KYCPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    riderId: "",
    fullName: "",
    dateOfBirth: "",
    nidNumber: "",
    nidFrontImage: "",
    nidBackImage: "",
    selfieImage: "",
    drivingLicenseNumber: "",
    drivingLicenseFrontImage: "",
    drivingLicenseBackImage: "",
    licenseExpiryDate: "",
    vehicleRegistrationNumber: "",
    vehicleRegistrationImage: "",
    taxTokenImage: "",
    taxTokenExpiry: "",
    fitnessImage: "",
    fitnessExpiry: "",
  });

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleText = (e) => setField(e.target.name, e.target.value);

  // Step validation
  const canProceed = () => {
    if (step === 1) return form.fullName && form.dateOfBirth && form.nidNumber && form.nidFrontImage;
    if (step === 2) return form.drivingLicenseNumber && form.drivingLicenseFrontImage;
    return true;
  };

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      toast.error("Please login first");
      return router.push("/login");
    }

    setSubmitting(true);
    try {
      // Get riderId from email
      const riderRes = await axios.get(`${API_URL}/riders`);
      const riders = riderRes.data?.data || [];
      const rider = riders.find((r) => r.email === session.user.email);

      if (!rider) {
        toast.error("Rider account not found. Please register as a rider first.");
        setSubmitting(false);
        return;
      }

      const payload = { ...form, riderId: rider._id, email: session.user.email };

      await axios.post(`${API_URL}/kyc/submit`, payload);
      toast.success("KYC submitted successfully! Awaiting admin review.");
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2FCA71]" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center"
        >
          <CheckCircle size={64} className="text-[#2FCA71] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">KYC Submitted</h2>
          <p className="text-gray-500 mb-6">
            Your documents are under review. You will be notified once approved.
          </p>
          <button
            onClick={() => router.push("/dashboard/rider")}
            className="bg-[#2FCA71] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#27b362] transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mt-16 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-500 mt-2">Complete your identity verification to start riding</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isDone
                        ? "bg-[#2FCA71] text-white"
                        : isActive
                        ? "bg-[#2FCA71] text-white ring-4 ring-[#2FCA71]/30"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isDone ? <CheckCircle size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? "text-[#2FCA71]" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mb-4 mx-1 ${step > s.id ? "bg-[#2FCA71]" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          {/* Step 1: Personal & NID */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Personal Information & NID</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleText}
                    placeholder="As on NID"
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FCA71]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleText}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FCA71]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">NID Number <span className="text-red-500">*</span></label>
                <input
                  name="nidNumber"
                  value={form.nidNumber}
                  onChange={handleText}
                  placeholder="National ID number"
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FCA71]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploadField label="NID Front" name="nidFrontImage" value={form.nidFrontImage} onChange={setField} required />
                <ImageUploadField label="NID Back" name="nidBackImage" value={form.nidBackImage} onChange={setField} />
              </div>

              <ImageUploadField label="Selfie with NID" name="selfieImage" value={form.selfieImage} onChange={setField} />
            </div>
          )}

          {/* Step 2: Driving License */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Driving License</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">License Number <span className="text-red-500">*</span></label>
                  <input
                    name="drivingLicenseNumber"
                    value={form.drivingLicenseNumber}
                    onChange={handleText}
                    placeholder="Driving license number"
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FCA71]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={form.licenseExpiryDate}
                    onChange={handleText}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FCA71]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploadField label="License Front" name="drivingLicenseFrontImage" value={form.drivingLicenseFrontImage} onChange={setField} required />
                <ImageUploadField label="License Back" name="drivingLicenseBackImage" value={form.drivingLicenseBackImage} onChange={setField} />
              </div>
            </div>
          )}

          {/* Step 3: Vehicle Documents */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Vehicle Documents</h2>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Vehicle Registration Number</label>
                <input
                  name="vehicleRegistrationNumber"
                  value={form.vehicleRegistrationNumber}
                  onChange={handleText}
                  placeholder="e.g. Dhaka Metro-Ga 11-1234"
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FCA71]"
                />
              </div>

              <ImageUploadField label="Registration Document" name="vehicleRegistrationImage" value={form.vehicleRegistrationImage} onChange={setField} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <ImageUploadField label="Tax Token" name="taxTokenImage" value={form.taxTokenImage} onChange={setField} />
                  <input
                    type="date"
                    name="taxTokenExpiry"
                    value={form.taxTokenExpiry}
                    onChange={handleText}
                    placeholder="Tax token expiry"
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FCA71]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <ImageUploadField label="Fitness Certificate" name="fitnessImage" value={form.fitnessImage} onChange={setField} />
                  <input
                    type="date"
                    name="fitnessExpiry"
                    value={form.fitnessExpiry}
                    onChange={handleText}
                    placeholder="Fitness expiry"
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2FCA71]"
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2FCA71] text-white font-semibold hover:bg-[#27b362] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2FCA71] text-white font-semibold hover:bg-[#27b362] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={18} /> Submit KYC
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
