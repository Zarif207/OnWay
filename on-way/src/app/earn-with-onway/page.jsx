"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import Image from "next/image";
import {
  Bike,
  Utensils,
  Package,
  ShieldCheck,
  DollarSign,
  CalendarCheck,
  CarFront,
  Ambulance,
  Car,
  Truck,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import DriverAnimation from "../components/DriverAnimation/DriverAnimation";

export default function EarnWithOnWayPage() {
  const router = useRouter();
  const { formData, updateFormData } = useEarnRegistration();
  console.log("data:", formData);

  const [activeCategory, setActiveCategory] = useState(formData.activeCategory || null); // "car" | "bike" | "ambulance" | null
  const [selectedModel, setSelectedModel] = useState(formData.selectedModel || "");
  const [selectedDistrict, setSelectedDistrict] = useState(
    formData.district || "Dhaka",
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vehicleType: formData.vehicleType || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      mobileNumber: formData.mobileNumber || "",
      email: formData.email || "",
      district: formData.district || "Dhaka",
      city: formData.city || "",
    },
  });

  const DISTRICT_OPTIONS = {
    Dhaka: ["Gulshan", "Banani", "Mirpur", "Dhanmondi", "Uttara"],
    Chittagong: ["Agrabad", "Pahartali", "Kotwali"],
    Sylhet: ["Zinda Bazar", "Amberkhana", "Subid Bazar"],
    Rajshahi: ["Boalia", "Rajpara", "Motihar"],
  };

  const CATEGORY_CONFIG = {
    car: {
      key: "car",
      label: "Car",
      accentBg: "bg-[#E8FFF4]", // soft light green derived from primary
      accentIcon: "text-[var(--color-primary)]",
      models: [
        {
          value: "Sedan",
          label: "Sedan",
          Icon: Car,
          iconClass: "text-[var(--color-primary)]",
        },
        {
          value: "SUV",
          label: "SUV",
          Icon: CarFront,
          iconClass: "text-blue-500",
        },
        {
          value: "Truck",
          label: "Pickup Truck",
          Icon: Truck,
          iconClass: "text-purple-500",
        },
      ],
    },
    bike: {
      key: "bike",
      label: "Bike",
      accentBg: "bg-yellow-50",
      accentIcon: "text-yellow-600",
      models: [
        {
          value: "Motorcycle",
          label: "Motorcycle",
          Icon: Bike,
          iconClass: "text-yellow-600",
        },
        {
          value: "Scooty",
          label: "Scooty",
          Icon: Bike,
          iconClass: "text-orange-500",
        },
      ],
    },
    ambulance: {
      key: "ambulance",
      label: "Ambulance",
      accentBg: "bg-red-50",
      accentIcon: "text-red-500",
      models: [
        {
          value: "1 Patient",
          label: "1 Patient",
          Icon: Ambulance,
          iconClass: "text-red-500",
        },
        {
          value: "2 Patient",
          label: "2 Patient",
          Icon: Ambulance,
          iconClass: "text-red-500",
        },
      ],
    },
  };

  const handleCategoryToggle = (key) => {
    setActiveCategory((prev) => (prev === key ? null : key));
  };

  const handleModelSelect = (categoryKey, modelValue) => {
    setSelectedModel(modelValue);
    setValue("vehicleType", modelValue);
  };

  const onSubmit = (data) => {
    if (!selectedModel) return;

    updateFormData({
      ...data,
      activeCategory,
      selectedModel,
    });

    router.push("/earn-with-onway/personal-info");
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col font-sans pt-20 pb-15 overflow-hidden">
      {/* Header Section */}
      <div className="w-full pt-28 pb-32 flex flex-col items-center justify-center text-center px-4 sm:px-10 relative overflow-hidden">
        {/* Background ride image with subtle motion */}
        <motion.div
          className="absolute inset-0 -z-20"
          initial={{ scale: 1, x: 0 }}
          animate={{ scale: 1.05, x: [0, -10, 10, 0] }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        >
          <Image
            src="/ride.png"
            alt="OnWay ride booking"
            fill
            className="w-auto h-auto object-contain object-center"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
          <div className="absolute inset-0 bg-linear-to-r from-black/55 via-transparent to-black/40" />
        </motion.div>

        {/* Soft floating gradient blob for 3D spatial depth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[520px] h-130 bg-[#2FCA71]/35 rounded-full blur-[110px]"
        />

        {/* Curved background bottom effect (subtle geometric 3D touch) */}
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-[150%] h-[200px] bg-[#f8f9fa] rounded-t-[100%] z-0 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.18)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10 px-4">
          {/* LEFT SIDE - TEXT */}
          <div className="text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight drop-shadow-[0_12px_45px_rgba(0,0,0,0.55)]"
            >
              Start Earning with{" "}
              <span
                className="relative inline-block bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent 
after:absolute after:-inset-1 after:bg-linear-to-r after:from-emerald-400 after:via-teal-300 after:to-cyan-400 
after:blur-2xl after:opacity-20 after:-z-10"
              >
                OnWay Rides
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-white/80 text-xl md:text-2xl max-w-xl font-medium"
            >
              Become a Rider on the highest earning platform!
            </motion.p>
          </div>

          {/* RIGHT SIDE - ANIMATION */}
          <div className="flex justify-center">
            <DriverAnimation />
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* Left Column: Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative z-20 -mt-25"
        >
          {/* 3D Glassmorphic Form Container */}
          <div className="bg-white/90 backdrop-blur-xl mt-10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(49,202,113,0.15)] p-10 border border-white/50 relative overflow-hidden">
            {/* Subtle inner highlight for glass edge */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/60 pointer-events-none" />

            <div className="relative z-10 mb-8 space-y-2">
              <h2 className="text-4xl font-extrabold text-[#001820]">
                Register Now
              </h2>
              <p className="text-sm text-gray-400">
                Tell us a bit about you and where you ride. You can adjust these
                details later from your profile.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              {!selectedModel && (
                <p className="text-xs text-red-500 text-center mb-2">
                  Please select a ride category and model to continue.
                </p>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-5 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-600 tracking-wide uppercase">
                    First Name <span className="text-[#2FCA71]">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("firstName", {
                      required: "First Name is required",
                    })}
                    className="w-full rounded-xl px-4 py-4 text-gray-900 bg-gray-50/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/40 focus:bg-white focus:border-[#2FCA71] transition-all shadow-inner shadow-gray-100/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-600 tracking-wide uppercase">
                    Last Name
                  </label>
                  <input
                    type="text"
                    {...register("lastName")}
                    className="w-full rounded-xl px-4 py-4 text-gray-900 bg-gray-50/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/40 focus:bg-white focus:border-[#2FCA71] transition-all shadow-inner shadow-gray-100/50"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-[13px] font-bold text-gray-700 tracking-wide uppercase">
                  Mobile Number <span className="text-[#2FCA71]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    +880
                  </span>
                  <input
                    type="tel"
                    {...register("mobileNumber", {
                      required: "Mobile Number is required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Please enter a valid number",
                      },
                    })}
                    className="w-full rounded-xl pl-16 pr-4 py-3.5 text-gray-900 bg-[#f8f9fa] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/40 focus:bg-white focus:border-[#2FCA71] transition-all shadow-inner shadow-gray-100/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-[13px] font-bold text-gray-700 tracking-wide uppercase">
                  Email <span className="text-[#2FCA71]">*</span>
                </label>

                <div className="relative">
                  <input
                    type="email"
                    placeholder="example@email.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                    className="w-full rounded-xl pl-4 pr-4 py-3.5 text-gray-900 bg-[#f8f9fa] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/40 focus:bg-white focus:border-[#2FCA71] transition-all shadow-inner shadow-gray-100/50"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-600 tracking-wide uppercase">
                    District <span className="text-[#2FCA71]">*</span>
                  </label>
                  <select
                    {...register("district", {
                      required: "District is required",
                    })}
                    value={selectedDistrict}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedDistrict(value);
                      setValue("district", value);
                      setValue("city", "");
                    }}
                    className="w-full rounded-xl px-4 py-3.5 text-gray-900 bg-[#f8f9fa] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/40 focus:bg-white focus:border-[#2FCA71] transition-all shadow-inner shadow-gray-100/50 appearance-none"
                  >
                    {Object.keys(DISTRICT_OPTIONS).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-700 tracking-wide uppercase">
                    City / Area <span className="text-[#2FCA71]">*</span>
                  </label>
                  <select
                    {...register("city", { required: "City is required" })}
                    className="w-full rounded-xl px-4 py-3.5 text-gray-900 bg-[#f8f9fa] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2FCA71]/40 focus:bg-white focus:border-[#2FCA71] transition-all shadow-inner shadow-gray-100/50 appearance-none"
                  >
                    <option value="">Select area</option>
                    {DISTRICT_OPTIONS[selectedDistrict]?.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div> */}
              </div>

              {/* Submit Button */}
              <div className="mt-4 relative z-10">
                <button
                  type="submit"
                  disabled={!selectedModel}
                  className={`w-full px-8 py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 group transition-all duration-300
    ${selectedModel
                      ? "bg-primary text-[var(--color-secondary)] hover:bg-[#26b861] hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(47,202,113,0.5)]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  Next Step
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-[11px] text-gray-400 mt-4 leading-tight text-center max-w-sm mx-auto">
                  By clicking this button, you agree to OnWay's{" "}
                  <a
                    href="#"
                    className="text-gray-900 underline hover:text-[#31ca71] transition-colors"
                  >
                    terms and privacy policy
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Column: Information */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col gap-8 mt-4 lg:mt-16 lg:pl-8"
        >
          {/* category div */}
          <div className="py-15 px-0 relative">
            <h3 className="text-4xl font-bold text-center text-white mb-3">
              Choose Your Ride
            </h3>
            <p className="text-white text-center mb-10">
              Select a category to continue
            </p>

            <div className="max-w-5xl mx-auto">
              <AnimatePresence initial={false} mode="wait">
                {activeCategory === null ? (
                  <motion.div
                    key="all-categories"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-8"
                  >
                    {["car", "bike", "ambulance"].map((key) => {
                      const category = CATEGORY_CONFIG[key];
                      const isSelectedCategory = activeCategory === key;
                      const Icon =
                        key === "car" ? Car : key === "bike" ? Bike : Ambulance;

                      return (
                        <motion.button
                          key={category.key}
                          type="button"
                          onClick={() => handleCategoryToggle(key)}
                          whileHover={{ y: -6, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="group relative flex flex-col items-center justify-between rounded-3xl bg-white/90 backdrop-blur-xl p-7 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)] border border-white/60 transition-all"
                        >
                          <div
                            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${CATEGORY_CONFIG[key].accentBg} transition-colors duration-300 group-hover:bg-[var(--color-primary)]`}
                          >
                            <Icon
                              className={`w-7 h-7 ${CATEGORY_CONFIG[key].accentIcon} group-hover:text-[var(--color-secondary)] transition-colors`}
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <h4 className="text-xl font-semibold text-[#001820]">
                              {category.label}
                            </h4>
                            <ChevronDown
                              className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isSelectedCategory ? "rotate-180" : ""
                                }`}
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Tap to view available models
                          </p>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`active-${activeCategory}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="grid grid-cols-1 gap-8"
                  >
                    {(() => {
                      const category = CATEGORY_CONFIG[activeCategory];
                      const Icon =
                        activeCategory === "car"
                          ? Car
                          : activeCategory === "bike"
                            ? Bike
                            : Ambulance;

                      return (
                        <motion.div
                          key={category.key}
                          layout
                          className="relative rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-[0_30px_70px_-25px_rgba(15,23,42,0.55)] border border-white/70"
                        >
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle(category.key)}
                            className="flex w-full items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${category.accentBg}`}
                              >
                                <Icon
                                  className={`w-8 h-8 ${category.accentIcon}`}
                                />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Category
                                </p>
                                <h4 className="text-2xl font-bold text-[#001820]">
                                  {category.label}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Choose a model to continue registration
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${activeCategory ? "rotate-180" : ""
                                }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            <motion.div
                              key={`${category.key}-dropdown`}
                              initial={{ opacity: 0, y: 10, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: "auto" }}
                              exit={{ opacity: 0, y: 10, height: 0 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="mt-6 overflow-hidden"
                            >
                              <div className="space-y-3">
                                {category.models.map((model) => {
                                  const ModelIcon = model.Icon;
                                  const isSelected =
                                    selectedModel === model.value;

                                  return (
                                    <button
                                      key={model.value}
                                      type="button"
                                      onClick={() =>
                                        handleModelSelect(
                                          category.key,
                                          model.value,
                                        )
                                      }
                                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all duration-200 ${isSelected
                                        ? "border-[var(--color-primary)] bg-[#E8FFF4] text-[var(--color-secondary)] shadow-[0_12px_30px_-18px_rgba(47,202,113,0.7)]"
                                        : "border-gray-200 bg-white/80 hover:border-[var(--color-primary)]/80 hover:bg-[#E8FFF4]/60"
                                        }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
                                          <ModelIcon
                                            className={`h-5 w-5 ${model.iconClass}`}
                                          />
                                        </span>
                                        <span>{model.label}</span>
                                      </div>
                                      {isSelected && (
                                        <span className="text-xs font-semibold text-[var(--color-primary)]">
                                          Selected
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="mt-5 flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center">
                                <p>
                                  Tip: You can change the model later from your
                                  profile.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setActiveCategory(null)}
                                  className="text-[11px] font-semibold text-gray-600 underline-offset-2 hover:text-[var(--color-primary)] hover:underline"
                                >
                                  Back to all categories
                                </button>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Easy Income Opportunity Section */}
          <div
            className="relative group mt-5 p-8 rounded-3xl 
  bg-white shadow-sm border border-transparent 
  hover:border-[var(--color-primary)]/20 
  hover:shadow-[0_20px_40px_-15px_rgba(47,202,113,0.1)] 
  transition-all duration-500 
  max-w-5xl -ml-20 mx-auto"
          >
            <h3 className="text-[26px] font-extrabold text-[#001820] mb-4 leading-snug">
              OnWay:{" "}
              <span className="text-[var(--color-primary)]">
                Flexible & Reliable Income Opportunity
              </span>
            </h3>

            <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-3xl">
              Earn between 45,000 to 50,000 taka per month as an OnWay rider
              while enjoying complete flexibility over your schedule. As a new
              rider, benefit from an exclusive 1% commission rate on ride
              sharing. Whether you choose to ride full-time or part-time, OnWay
              provides the support, technology, and earning potential you need
              to grow consistently.
            </p>

            <div className="flex flex-col gap-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-5">
                <div className="mt-0.5 flex-shrink-0 w-12 h-12 rounded-xl bg-[#E8FFF4] flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                  <ShieldCheck className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#001820] text-[16px] mb-1.5">
                    Your Ride is Secured
                  </h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed max-w-lg">
                    Your safety is our top priority. OnWay provides
                    comprehensive safety coverage, real-time ride tracking, and
                    24/7 rider support to ensure every journey is secure and
                    stress-free.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-5">
                <div className="mt-0.5 flex-shrink-0 w-12 h-12 rounded-xl bg-[#E8FFF4] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 delay-75">
                  <DollarSign className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#001820] text-[16px] mb-1.5">
                    Earn More with Bonuses
                  </h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed max-w-lg">
                    Complete daily ride quests, unlock performance-based
                    bonuses, and take advantage of seasonal promotions designed
                    to maximize your weekly and monthly income.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-5">
                <div className="mt-0.5 flex-shrink-0 w-12 h-12 rounded-xl bg-[#E8FFF4] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 delay-150">
                  <CalendarCheck className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#001820] text-[16px] mb-1.5">
                    Get Your Payment on Time
                  </h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed max-w-lg">
                    Enjoy fast and reliable payouts with transparent earnings
                    tracking. Withdraw your income quickly without delays or
                    hidden deductions, giving you full control over your
                    finances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
