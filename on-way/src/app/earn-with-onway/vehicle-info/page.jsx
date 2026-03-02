"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import EarnInfo from "@/components/EarnInfo/EarnInfo";
import { Check } from "lucide-react";

export default function VehicleInfoPage() {
  const router = useRouter();
  const { formData, updateFormData } = useEarnRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      brand: formData.brand || "",
      model: formData.model || "",
      registrationRegion: formData.registrationRegion || "Dhaka",
      registrationCategory: formData.registrationCategory || "Metric",
      registrationDigits: formData.registrationDigits || "",
      year: formData.year || "",
      taxTokenNumber: formData.taxTokenNumber || "",
      fitnessNumber: formData.fitnessNumber || "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const finalData = { ...formData, ...data };
    updateFormData(data);

    await fetch("/api/earn-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalData),
    });

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden font-sans pb-24">

      {/* Background Blobs (same as PersonalInfo) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#31ca71]/20 rounded-full blur-[120px] pointer-events-none z-0 transform translate-x-1/3 -translate-y-1/4"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none z-0 transform -translate-x-1/3 translate-y-1/3"
      />

      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-32 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* LEFT COLUMN — Stepper */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-10">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-extrabold text-[#001820] mb-8">
                Become an <br />
                <span className="text-[#31ca71]">OnWay Partner</span>
              </h1>

              <div className="flex flex-col gap-6 mb-12">

                {/* Step 1 Completed */}
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#31ca71] flex items-center justify-center shadow-[0_0_20px_rgba(49,202,113,0.4)]">
                    <Check className="w-6 h-6 text-[#001820]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#001820]">Personal Info</h4>
                    <p className="text-sm text-[#31ca71] font-medium">Completed</p>
                  </div>
                </div>

                <div className="w-[2px] h-8 bg-[#31ca71]/40 ml-6 -my-2 rounded-full"></div>

                {/* Step 2 Active */}
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#31ca71] text-[#001820] flex items-center justify-center shadow-[0_0_20px_rgba(49,202,113,0.4)]">
                    <span className="font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#001820]">Vehicle Details</h4>
                    <p className="text-sm text-gray-500">In Progress</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
            >
              <EarnInfo />
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_60px_-15px_rgba(49,202,113,0.1)] p-8 md:p-12 border border-white/60 relative overflow-hidden">

              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-[#001820] mb-2">
                  Vehicle Information
                </h2>
                <p className="text-gray-500">
                  Enter your vehicle details carefully for verification.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">

                {/* Vehicle Basics */}
                <div className="bg-[#f8f9fa] rounded-2xl p-8 border border-gray-100 shadow-inner">

                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                    Vehicle Profile
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <input
                      placeholder="Brand"
                      {...register("brand", { required: true })}
                      className={`rounded-xl px-4 py-3.5 bg-white border shadow-sm focus:ring-2 focus:ring-[#31ca71]/40 ${errors.brand ? "border-red-400" : "border-gray-200"
                        }`}
                    />
                    <input
                      placeholder="Model"
                      {...register("model", { required: true })}
                      className={`rounded-xl px-4 py-3.5 bg-white border shadow-sm focus:ring-2 focus:ring-[#31ca71]/40 ${errors.model ? "border-red-400" : "border-gray-200"
                        }`}
                    />
                  </div>

                  <input
                    placeholder="Registration Digits"
                    {...register("registrationDigits", { required: true })}
                    className={`w-full rounded-xl px-4 py-3.5 bg-white border shadow-sm focus:ring-2 focus:ring-[#31ca71]/40 ${errors.registrationDigits ? "border-red-400" : "border-gray-200"
                      }`}
                  />
                </div>

                {/* Documents */}
                <div className="bg-[#f8f9fa] rounded-2xl p-8 border border-gray-100 shadow-inner">

                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                    Documents
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <input
                      placeholder="Tax Token Number"
                      {...register("taxTokenNumber", { required: true })}
                      className="rounded-xl px-4 py-3.5 bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#31ca71]/40"
                    />
                    <input
                      placeholder="Fitness Number"
                      {...register("fitnessNumber")}
                      className="rounded-xl px-4 py-3.5 bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#31ca71]/40"
                    />
                  </div>

                  <select
                    {...register("year", { required: true })}
                    className="w-full rounded-xl px-4 py-3.5 bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#31ca71]/40"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 25 }, (_, i) =>
                      new Date().getFullYear() - i
                    ).map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#31ca71] text-[#001820] px-10 py-4 rounded-xl hover:bg-[#28ad60] hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(49,202,113,0.5)] transition-all duration-300 font-extrabold flex items-center gap-3"
                  >
                    {isSubmitting && (
                      <div className="w-4 h-4 border-2 border-[#001820]/30 border-t-[#001820] rounded-full animate-spin"></div>
                    )}
                    Submit Application
                  </button>
                </div>

              </form>
            </div>
          </motion.div>

          {/* Mobile EarnInfo */}
          <div className="lg:hidden block mt-8 col-span-1">
            <EarnInfo />
          </div>

        </div>
      </div>
    </div>
  );
}