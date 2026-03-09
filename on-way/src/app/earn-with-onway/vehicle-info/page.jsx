"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import EarnInfo from "@/components/EarnInfo/EarnInfo";
import { Check, UploadCloud } from "lucide-react";
import useRiders from "@/hooks/useRiders";
import toast from "react-hot-toast";

export default function VehicleInfoPage() {
  const router = useRouter();
  const { formData, updateFormData } = useEarnRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenseFile, setLicenseFile] = useState(null);
  const [regFile, setRegFile] = useState(null);
  const { registerRider, uploadRiderImage } = useRiders();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      model: formData.model || "",
      registrationRegion: formData.registrationRegion || "Dhaka",
      registrationCategory: formData.registrationCategory || "Metric",
      registrationDigits: formData.registrationDigits || "",
      year: formData.year || "",
      licenseNumber: formData.licenseNumber || "",
      registrationNumber: formData.registrationNumber || "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const updatedForm = { ...formData, ...data };
    updateFormData(data);

    try {
      // 1. Upload Rider Image First if it exists
      let uploadedImageUrl = updatedForm.image || "";
      if (updatedForm.riderImage && updatedForm.riderImage.length > 0) {
        const fileToUpload = updatedForm.riderImage[0];
        console.log("Uploading Profile Image...");
        uploadedImageUrl = await uploadRiderImage(fileToUpload);
        console.log("Image Uploaded URL:", uploadedImageUrl);
      }

      // 2. Map existing structure to requested payload
      const payload = {
        firstName: updatedForm.firstName || "",
        lastName: updatedForm.lastName || "",
        email: updatedForm.email || "",
        phone: `+880${updatedForm.mobileNumber || "00000"}`,
        role: "rider",

        address: {
          district: updatedForm.district || "Dhaka",
          city: updatedForm.city || "",
        },

        gender: updatedForm.gender || "Male",
        dateOfBirth: updatedForm.dateOfBirth || "",

        emergencyContact: {
          name: updatedForm.emergencyContactName || "",
          phone: updatedForm.emergencyContactPhone || ""
        },

        identity: {
          type: updatedForm.identityType || "NID",
          number: updatedForm.identityNumber || "000",
        },

        referralCode: updatedForm.referralCode || "",

        licenseNumber: data.licenseNumber,

        vehicle: {
          category: updatedForm.activeCategory || "bike",
          type: updatedForm.selectedModel || "Motorcycle",
          number: data.registrationDigits || data.registrationNumber || "Unregistered",
          model: data.year || data.model || "2024",
          registrationNumber: data.registrationNumber || ""
        },

        documents: {
          drivingLicenseFile: "", // Left blank during onboarding logic for now
          vehicleRegistrationFile: "" // Left blank during onboarding logic for now
        },

        operationCities: updatedForm.cities || [],

        image: uploadedImageUrl,
      };

      console.log("Submitting Payload:", payload);

      await registerRider(payload);
      toast.success("Application submitted successfully.");
      router.push("/");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative font-sans lg:pb-24 pt-24 md:pt-32 px-4 md:px-8">

      <div className="w-full max-w-[1400px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

        {/* ===================== LEFT COLUMN (Info Panel) ===================== */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-10 h-fit">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-extrabold text-[#0A1F3D] mb-8">
              Become an <br />
              <span className="text-[#22c55e]">OnWay Partner</span>
            </h1>

            <div className="flex flex-col gap-6 mb-8">
              {/* Step 1 Completed */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center shadow-sm">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0A1F3D]">Personal Info</h4>
                  <p className="text-sm text-[#22c55e] font-bold">Completed</p>
                </div>
              </div>

              <div className="w-0.5 h-8 bg-[#22c55e]/30 ml-6 -my-2 rounded-full"></div>

              {/* Step 2 Active */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#22c55e] text-white flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
                  <span className="font-bold text-lg">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0A1F3D]">Vehicle Details</h4>
                  <p className="text-sm text-gray-500 font-medium">In Progress</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
          >
            <EarnInfo />
          </motion.div>
        </div>

        {/* ===================== RIGHT COLUMN (Form) ===================== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-8"
        >
          <div className="bg-white rounded-[32px] shadow-sm p-6 md:p-10 border border-gray-100 relative">

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A1F3D] mb-2">
                Vehicle Information
              </h2>
              <p className="text-gray-500 font-medium">
                Enter your vehicle details carefully for verification.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">

              {/* Card 1: Vehicle Profile */}
              <div className="bg-[#f8fafc] rounded-2xl p-6 md:p-8 border border-gray-200">
                <h3 className="text-sm font-bold text-[#0A1F3D] tracking-wide mb-6 uppercase border-b border-gray-200 pb-3">
                  Vehicle Profile
                </h3>

                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vehicle Category</label>
                    <input
                      placeholder="e.g. Bike, Car"
                      value={formData.activeCategory || "Bike"}
                      disabled
                      className="w-full rounded-xl px-4 py-3.5 bg-gray-100 border border-gray-200 text-gray-500 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vehicle Type</label>
                    <input
                      placeholder="e.g. Motorcycle, Sedan"
                      value={formData.selectedModel || "Motorcycle"}
                      disabled
                      className="w-full rounded-xl px-4 py-3.5 bg-gray-100 border border-gray-200 text-gray-500 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F3D] uppercase tracking-wider mb-2">Vehicle Number <span className="text-red-500">*</span></label>
                    <input
                      placeholder="DHK-METRO-HA-12-3456"
                      {...register("registrationDigits", { required: true })}
                      className={`w-full rounded-xl px-4 py-3.5 bg-white text-[#0A1F3D] border outline-none transition focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] ${errors.registrationDigits ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F3D] uppercase tracking-wider mb-2">Model Year <span className="text-red-500">*</span></label>
                    <select
                      {...register("year", { required: true })}
                      className={`w-full rounded-xl px-4 py-3.5 bg-white text-[#0A1F3D] border outline-none transition focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] appearance-none ${errors.year ? "border-red-400" : "border-gray-200"}`}
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Documents */}
              <div className="bg-[#f8fafc] rounded-2xl p-6 md:p-8 border border-gray-200">
                <h3 className="text-sm font-bold text-[#0A1F3D] tracking-wide mb-6 uppercase border-b border-gray-200 pb-3">
                  Documents
                </h3>

                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F3D] uppercase tracking-wider mb-2">Driving License Number <span className="text-red-500">*</span></label>
                    <input
                      placeholder="DHXXXXXXXXX"
                      {...register("licenseNumber", { required: "License Number is required" })}
                      className={`w-full rounded-xl px-4 py-3.5 bg-white text-[#0A1F3D] border outline-none transition focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] ${errors.licenseNumber ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F3D] uppercase tracking-wider mb-2">Vehicle Reg. Number <span className="text-red-500">*</span></label>
                    <input
                      placeholder="Registration Document No"
                      {...register("registrationNumber", { required: true })}
                      className={`w-full rounded-xl px-4 py-3.5 bg-white text-[#0A1F3D] border outline-none transition focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] ${errors.registrationNumber ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mt-8">
                  <label className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition cursor-pointer group ${licenseFile ? 'border-[#22c55e] bg-[#22c55e]/5' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                    <input type="file" accept=".jpg,.png,.jpeg,.pdf" className="hidden" onChange={(e) => setLicenseFile(e.target.files[0])} />
                    {licenseFile ? (
                      <Check className="w-8 h-8 text-[#22c55e] mb-2" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#22c55e] transition-colors" />
                    )}
                    <span className="text-sm font-bold text-[#0A1F3D] text-center max-w-full truncate px-2">
                      {licenseFile ? licenseFile.name : "Upload Driving License"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">{licenseFile ? 'Click to change file' : '(JPG, PNG, PDF max 5MB)'}</span>
                  </label>

                  <label className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition cursor-pointer group ${regFile ? 'border-[#22c55e] bg-[#22c55e]/5' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                    <input type="file" accept=".jpg,.png,.jpeg,.pdf" className="hidden" onChange={(e) => setRegFile(e.target.files[0])} />
                    {regFile ? (
                      <Check className="w-8 h-8 text-[#22c55e] mb-2" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#22c55e] transition-colors" />
                    )}
                    <span className="text-sm font-bold text-[#0A1F3D] text-center max-w-full truncate px-2">
                      {regFile ? regFile.name : "Upload Vehicle Registration"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">{regFile ? 'Click to change file' : '(JPG, PNG, PDF max 5MB)'}</span>
                  </label>
                </div>
              </div>

              {/* Submit Area */}
              <div className="flex flex-col md:flex-row justify-end pt-4 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-[#22c55e] text-white px-12 py-4 rounded-xl hover:bg-[#16a34a] font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#22c55e]/20 disabled:bg-[#22c55e]/60 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>

            </form>
          </div>
        </motion.div>

        {/* Mobile Info View */}
        <div className="lg:hidden block mt-6 col-span-1">
          <EarnInfo />
        </div>

      </div>
    </div>
  );
}