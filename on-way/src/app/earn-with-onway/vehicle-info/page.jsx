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
  const { formData, updateFormData, clearRegistrationData } = useEarnRegistration();
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
      // Pre-fill license Number from context if it's uploaded and Identity Type is Driving License
      licenseNumber: formData.licenseNumber || (formData.identityType === 'Driving License' ? formData.identityNumber : ""),
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

      // 2. Map existing structure to FormData for multipart upload
      const submitData = new FormData();

      // Basic Information
      submitData.append("name", `${updatedForm.firstName} ${updatedForm.lastName}`.trim());
      submitData.append("firstName", updatedForm.firstName || "");
      submitData.append("lastName", updatedForm.lastName || "");
      submitData.append("email", updatedForm.email || "");
      submitData.append("phone", `+880${updatedForm.mobileNumber || "00000"}`);
      submitData.append("role", "rider");
      submitData.append("gender", updatedForm.gender || "Male");
      submitData.append("dateOfBirth", updatedForm.dateOfBirth || "");
      submitData.append("referralCode", updatedForm.referralCode || "");
      submitData.append("licenseNumber", data.licenseNumber);

      // Document OCR Data (Structured for MongoDB)
      submitData.append("documents", JSON.stringify({
        submittedType: updatedForm.documentType?.toLowerCase() || "nid",
        files: {
          nid: updatedForm.documentType === "NID" ? "pending_upload" : "",
          license: updatedForm.documentType === "Driving License" ? "pending_upload" : "",
          passport: updatedForm.documentType === "Passport" ? "pending_upload" : "",
          birthCertificate: updatedForm.documentType === "Birth Certificate" ? "pending_upload" : ""
        },
        extractedData: updatedForm.extractedData || {}
      }));

      // NEW: Dynamic Smart Data from OCR
      if (updatedForm.documentDetails) {
        submitData.append("documentDetails", JSON.stringify(updatedForm.documentDetails));
      }

      // Append Document OCR File if available
      if (updatedForm.documentFile) {
        const fieldName = updatedForm.documentType === "NID"
          ? "nidFile"
          : updatedForm.documentType === "Driving License"
            ? "drivingLicenseFile"
            : updatedForm.documentType === "Passport"
              ? "passportFile"
              : "birthCertificateFile";
        submitData.append(fieldName, updatedForm.documentFile);
      }

      // Profile Image
      submitData.append("image", uploadedImageUrl);

      // Arrays and Nest Objects require stringification before transmission
      submitData.append("address", JSON.stringify({
        district: updatedForm.district || "Dhaka",
        city: updatedForm.city || "",
      }));

      submitData.append("emergencyContact", JSON.stringify({
        name: updatedForm.emergencyName || "",
        phone: `+880${updatedForm.emergencyMobile || ""}`
      }));

      submitData.append("identity", JSON.stringify({
        type: updatedForm.identity?.type || updatedForm.identityType || "NID (National ID)",
        number: updatedForm.identity?.number || updatedForm.identityNumber || updatedForm.extractedData?.documentNumber || "000",
      }));

      submitData.append("vehicle", JSON.stringify({
        category: updatedForm.activeCategory || "bike",
        type: updatedForm.selectedModel || "Motorcycle",
        number: data.registrationDigits || data.registrationNumber || "Unregistered",
        model: data.year || data.model || "2024",
        registrationNumber: data.registrationNumber || ""
      }));

      submitData.append("operationCities", JSON.stringify(updatedForm.cities || []));

      submitData.append("faceVerification", JSON.stringify(updatedForm.faceVerification || {
        isVerified: updatedForm.isFaceVerified || false,
        verificationStatus: "pending",
        verifiedAt: null,
        verificationMethod: "face_match",
        confidenceScore: 0,
        verificationImage: "",
        faceEmbedding: [],
        lastVerificationAttempt: null,
        verificationAttempts: 0
      }));
      submitData.append("isFaceVerified", updatedForm.isFaceVerified || false);

      // 3. Append Binary Files safely from React State or Global State
      // If we uploaded a new license here, use it. Wait, the global state already appended the global file in step 1 as drivingLicenseFile?
      // Yes, if `updatedForm.documentType === "Driving License"`, step 1's file is appended above as `drivingLicenseFile`.
      // If the user uploaded a **replacement** file here (`licenseFile`), it might override the backend key if appended again, or we should use a specific field name.
      if (licenseFile) {
        submitData.set("drivingLicenseFile", licenseFile); // Use set to overwrite if it was already appended
      } else if (formData.documents?.license?.uploaded && formData.documents?.license?.image) {
        // Fallback to the globally stored Base64 string if it was somehow missed or if we're not relying on `updatedForm.documentFile` anymore.
        submitData.set("drivingLicenseBase64", formData.documents.license.image);
      }

      if (regFile) {
        submitData.append("vehicleRegistrationFile", regFile);
      }

      console.log("Submitting FormData...");

      const result = await registerRider(submitData);

      if (result.success) {
        toast.success("Application submitted successfully.");
        // Successfully registered, clear local storage/context state
        clearRegistrationData();
        router.push("/");
      } else {
        toast.error(result.message || "Failed to submit application.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative font-sans pb-10 lg:pb-24 pt-20 lg:pt-32 px-4 md:px-8">

      <div className="w-full max-w-[1400px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

        {/* ===================== LEFT COLUMN (Info Panel) ===================== */}
        <div className="lg:col-span-12 xl:col-span-4 lg:sticky lg:top-32 flex flex-col gap-8 lg:gap-10 h-fit">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A1F3D] mb-6 lg:mb-8 leading-tight">
              Become an <br />
              <span className="text-[#22c55e]">OnWay Partner</span>
            </h1>

            <div className="flex lg:flex-col gap-4 lg:gap-6 mb-6 lg:mb-8 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
              {/* Step 1 Completed */}
              <div className="flex items-center gap-4 lg:gap-5 shrink-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#22c55e] flex items-center justify-center shadow-sm">
                  <Check className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h4 className="font-bold text-[#0A1F3D] text-sm lg:text-base">Personal Info</h4>
                  <p className="text-xs lg:text-sm text-[#22c55e] font-bold">Completed</p>
                </div>
              </div>

              {/* Connector Line (Mobile) */}
              <div className="lg:hidden w-8 h-[2px] bg-[#22c55e]/30 self-center shrink-0"></div>

              {/* Step 2 Face Verification Completed */}
              <div className="flex items-center gap-4 lg:gap-5 shrink-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#22c55e] flex items-center justify-center shadow-sm">
                  <Check className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h4 className="font-bold text-[#0A1F3D] text-sm lg:text-base">Identity</h4>
                  <p className="text-xs lg:text-sm text-[#22c55e] font-bold">Verified</p>
                </div>
              </div>

              {/* Connector Line (Desktop) */}
              <div className="hidden lg:block w-0.5 h-8 bg-[#22c55e]/30 ml-6 -my-2 rounded-full"></div>
              {/* Connector Line (Mobile) */}
              <div className="lg:hidden w-8 h-[2px] bg-[#22c55e]/30 self-center shrink-0"></div>

              {/* Step 3 Active */}
              <div className="flex items-center gap-4 lg:gap-5 shrink-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#22c55e] text-white flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
                  <span className="font-bold text-base lg:text-lg">3</span>
                </div>
                <div className="hidden sm:block">
                  <h4 className="font-bold text-[#0A1F3D] text-sm lg:text-base">Vehicle Details</h4>
                  <p className="text-xs lg:text-sm text-gray-500 font-medium">In Progress</p>
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
          className="lg:col-span-12 xl:col-span-8"
        >
          <div className="bg-white rounded-[24px] lg:rounded-[32px] shadow-sm p-6 md:p-8 lg:p-10 border border-gray-100 relative">

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A1F3D] mb-2">
                Vehicle Information
              </h2>
              <p className="text-gray-500 font-medium text-sm lg:text-base">
                Enter your vehicle details carefully for verification.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 lg:gap-8">

              {/* Card 1: Vehicle Profile */}
              <div className="bg-[#f8fafc] rounded-2xl p-6 lg:p-8 border border-gray-200">
                <h3 className="text-xs lg:text-sm font-bold text-[#0A1F3D] tracking-wide mb-6 uppercase border-b border-gray-200 pb-3 flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-[#22c55e] rounded-full"></span>
                  Vehicle Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
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
                      className={`w-full rounded-xl px-4 py-3.5 bg-white text-[#0A1F3D] border outline-none transition focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] appearance-none cursor-pointer ${errors.year ? "border-red-400" : "border-gray-200"}`}
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
              <div className="bg-[#f8fafc] rounded-2xl p-6 lg:p-8 border border-gray-200">
                <h3 className="text-xs lg:text-sm font-bold text-[#0A1F3D] tracking-wide mb-6 uppercase border-b border-gray-200 pb-3 flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-[#22c55e] rounded-full"></span>
                  Documents
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 lg:mb-8">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F3D] uppercase tracking-wider mb-2">Driving License Number <span className="text-red-500">*</span></label>
                    {formData?.documents?.license?.uploaded ? (
                      <div className="w-full rounded-xl px-4 py-3.5 bg-[#f0fdf4] border border-[#bbf7d0] text-green-700 font-semibold text-sm flex items-center shadow-sm">
                        Driving License Already Submitted ✅
                      </div>
                    ) : (
                      <input
                        placeholder="DHXXXXXXXXX"
                        value={formData?.licenseNumber || ""}
                        readOnly={!!formData?.documents?.license?.uploaded}
                        {...register("licenseNumber", {
                          required: !formData?.documents?.license?.uploaded ? "License Number is required" : false
                        })}
                        onChange={(e) => {
                          updateFormData({ licenseNumber: e.target.value });
                          setValue("licenseNumber", e.target.value, { shouldValidate: true });
                        }}
                        className={`w-full rounded-xl px-4 py-3.5 bg-white text-[#0A1F3D] border outline-none transition focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] ${errors.licenseNumber ? "border-red-400" : "border-gray-200"}`}
                      />
                    )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Driving License Conditional Box */}
                  {formData.documents?.license?.uploaded && !licenseFile ? (
                    <div className="border-2 border-[#22c55e] rounded-xl p-6 lg:p-8 flex flex-col items-center justify-center bg-[#22c55e]/5 relative">
                      <Check className="w-8 h-8 text-[#22c55e] mb-3" />
                      <span className="text-sm font-bold text-[#0A1F3D] text-center max-w-full">
                        Driving License Uploaded ✓
                      </span>
                      <span className="text-[11px] lg:text-xs text-gray-500 mt-2 text-center">
                        Verified from previous step
                      </span>
                      <label className="mt-4 text-xs font-bold text-[#22c55e] hover:text-[#16a34a] cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-[#22c55e]/30 transition shadow-sm">
                        <input type="file" accept=".jpg,.png,.jpeg,.pdf" className="hidden" onChange={(e) => setLicenseFile(e.target.files[0])} />
                        Replace Document
                      </label>
                    </div>
                  ) : (
                    <label className={`border border-dashed rounded-xl p-6 lg:p-8 flex flex-col items-center justify-center transition cursor-pointer group ${licenseFile ? 'border-[#22c55e] bg-[#22c55e]/5' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                      <input type="file" accept=".jpg,.png,.jpeg,.pdf" className="hidden" onChange={(e) => setLicenseFile(e.target.files[0])} />
                      {licenseFile ? (
                        <Check className="w-8 h-8 text-[#22c55e] mb-3" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-3 group-hover:text-[#22c55e] transition-colors" />
                      )}
                      <span className="text-sm font-bold text-[#0A1F3D] text-center max-w-full truncate px-2">
                        {licenseFile ? licenseFile.name : "Upload Driving License"}
                      </span>
                      <span className="text-[11px] lg:text-xs text-gray-400 mt-2">{licenseFile ? 'Click to change file' : '(JPG, PNG, PDF max 5MB)'}</span>
                    </label>
                  )}

                  <label className={`border border-dashed rounded-xl p-6 lg:p-8 flex flex-col items-center justify-center transition cursor-pointer group ${regFile ? 'border-[#22c55e] bg-[#22c55e]/5' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                    <input type="file" accept=".jpg,.png,.jpeg,.pdf" className="hidden" onChange={(e) => setRegFile(e.target.files[0])} />
                    {regFile ? (
                      <Check className="w-8 h-8 text-[#22c55e] mb-3" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-3 group-hover:text-[#22c55e] transition-colors" />
                    )}
                    <span className="text-sm font-bold text-[#0A1F3D] text-center max-w-full truncate px-2">
                      {regFile ? regFile.name : "Upload Vehicle Registration"}
                    </span>
                    <span className="text-[11px] lg:text-xs text-gray-400 mt-2">{regFile ? 'Click to change file' : '(JPG, PNG, PDF max 5MB)'}</span>
                  </label>
                </div>
              </div>

              {/* Submit Area */}
              <div className="flex flex-col md:flex-row justify-end pt-4 mt-2 lg:mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-[#22c55e] text-white px-12 py-4 rounded-xl hover:bg-[#16a34a] font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#22c55e]/20 disabled:bg-[#22c55e]/60 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isSubmitting ? "Submitting Application..." : "Finish Registration"}
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