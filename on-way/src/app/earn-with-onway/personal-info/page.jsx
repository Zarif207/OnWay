"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import EarnInfo from "@/components/EarnInfo/EarnInfo";

export default function PersonalInfoPage() {
  const router = useRouter();
  const { formData, updateFormData } = useEarnRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      mobileNumber: formData.mobileNumber || "",
      gender: formData.gender || "Male",
      dateOfBirth: formData.dateOfBirth || "",
      city: formData.city || "Dhaka",
      serviceProvide: formData.serviceProvide || [],
      identityType: formData.identityType || "NID",
      identityNumber: formData.identityNumber || "",
      referralCode: formData.referralCode || "",
    },
  });

  const onSubmit = (data) => {
    updateFormData(data);
    router.push("/earn-with-onway/vehicle-info");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden font-sans pb-24">
      {/* Deep Spatial Background Blobs */}
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

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* LEFT COLUMN: Stepper & Info (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-10">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl font-extrabold text-[#001820] mb-8 leading-tight">
                Become an <br /> <span className="text-accent">OnWay Partner</span>
              </h1>

              {/* Progress Stepper */}
              <div className="flex flex-col gap-6 mb-12">
                {/* Step 1: Active */}
                <div className="flex items-center gap-5 group">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#31ca71] text-[#001820] shadow-[0_0_20px_rgba(49,202,113,0.4)] transition-all">
                    <span className="font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-[#001820]">Personal Info</h4>
                    <p className="text-[13px] text-gray-500 font-medium tracking-wide">In Progress</p>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="w-[2px] h-8 bg-gray-200 ml-6 -my-2 rounded-full"></div>

                {/* Step 2: Pending */}
                <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200 text-gray-400">
                    <span className="font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-gray-400">Vehicle Details</h4>
                    <p className="text-[13px] text-gray-400 font-medium tracking-wide">Pending</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Earn Info Block */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
            >
              <EarnInfo />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 w-full"
          >
            <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_60px_-15px_rgba(49,202,113,0.1)] p-8 md:p-12 border border-white/60 relative overflow-hidden">
              {/* Glass edge highlight */}
              <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white pointer-events-none" />

              <div className="mb-10 relative z-10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#001820] mb-2 tracking-tight">
                  Personal Information
                </h2>
                <p className="text-gray-500 text-[15px]">
                  Please provide your accurate details to create your captain profile.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 relative z-10">

                {/* Contact Information Group */}
                <div className="bg-[#f8f9fa] rounded-2xl p-6 md:p-8 border border-gray-100 shadow-inner shadow-gray-200/50">
                  <h3 className="text-[13px] font-bold text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                    <span className="w-6 h-[2px] bg-[#31ca71] rounded-full"></span>
                    Contact Profile
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                        First Name <span className="text-[#31ca71]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John"
                        {...register("firstName", { required: "First Name is required" })}
                        className={`w-full rounded-xl px-4 py-3.5 text-gray-900 bg-white border focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm ${errors.firstName ? "border-red-400 bg-red-50/50" : "border-gray-200"
                          }`}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Doe"
                        {...register("lastName")}
                        className="w-full rounded-xl px-4 py-3.5 text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                      Mobile Number <span className="text-[#31ca71]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-3">
                        <span className="text-xl leading-none origin-center">🇧🇩</span>
                        <span className="text-gray-500 font-medium text-[15px]">+880</span>
                      </span>
                      <input
                        type="tel"
                        {...register("mobileNumber", { required: true })}
                        className={`w-full rounded-xl pl-[100px] pr-4 py-3.5 text-gray-900 bg-white border focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm ${errors.mobileNumber ? "border-red-400 bg-red-50/50" : "border-gray-200"
                          }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information Group */}
                <div className="bg-[#f8f9fa] rounded-2xl p-6 md:p-8 border border-gray-100 shadow-inner shadow-gray-200/50">
                  <h3 className="text-[13px] font-bold text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                    <span className="w-6 h-[2px] bg-[#31ca71] rounded-full"></span>
                    Demographics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                        Gender
                      </label>
                      <select
                        {...register("gender")}
                        className="w-full rounded-xl px-4 py-3.5 text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                        Date Of Birth <span className="text-[#31ca71]">*</span>
                      </label>
                      <input
                        type="date"
                        {...register("dateOfBirth", { required: true })}
                        className={`w-full rounded-xl px-4 py-3.5 text-gray-900 bg-white border focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm cursor-text ${errors.dateOfBirth ? "border-red-400 bg-red-50/50" : "border-gray-200"
                          }`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                      Operation City <span className="text-[#31ca71]">*</span>
                    </label>
                    <select
                      {...register("city")}
                      className="w-full rounded-xl px-4 py-3.5 text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option>Dhaka</option>
                      <option>Chittagong</option>
                      <option>Sylhet</option>
                      <option>Rajshahi</option>
                    </select>
                  </div>
                </div>

                {/* Identity Verification Group */}
                <div className="bg-[#f8f9fa] rounded-2xl p-6 md:p-8 border border-gray-100 shadow-inner shadow-gray-200/50">
                  <h3 className="text-[13px] font-bold text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                    <span className="w-6 h-[2px] bg-[#31ca71] rounded-full"></span>
                    Verification
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                        Identity Type <span className="text-[#31ca71]">*</span>
                      </label>
                      <select
                        {...register("identityType")}
                        className="w-full rounded-xl px-4 py-3.5 text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option>NID (National ID)</option>
                        <option>Passport</option>
                        <option>Driving License</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                        Identity Number <span className="text-[#31ca71]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 199XXXXXXXXXX"
                        {...register("identityNumber", { required: true })}
                        className={`w-full rounded-xl px-4 py-3.5 text-gray-900 bg-white border focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm ${errors.identityNumber ? "border-red-400 bg-red-50/50" : "border-gray-200"
                          }`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-[#001820] tracking-wide">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter code if you have one"
                      {...register("referralCode")}
                      className="w-full rounded-xl px-4 py-3.5 text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#31ca71]/40 focus:border-[#31ca71] transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6 mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-[#31ca71] text-[#001820] px-10 py-4 rounded-xl hover:bg-[#28ad60] hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(49,202,113,0.5)] transition-all duration-300 font-extrabold text-[15px] flex items-center justify-center gap-3 group"
                  >
                    Continue to Vehicle Details
                    <span className="w-6 h-6 rounded-full bg-[#001820]/10 flex items-center justify-center group-hover:bg-[#001820]/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </button>
                </div>

              </form>
            </div>
          </motion.div>

          {/* Render EarnInfo below form on Mobile */}
          <div className="lg:hidden block mt-8 col-span-1">
            <EarnInfo />
          </div>

        </div>
      </div>
    </div>
  );
}