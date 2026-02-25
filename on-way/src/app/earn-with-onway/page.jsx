"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import { Bike, Utensils, Package, ShieldCheck, DollarSign, CalendarCheck } from "lucide-react";

export default function EarnWithOnWayPage() {
  const router = useRouter();
  const { formData, updateFormData } = useEarnRegistration();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vehicleType: formData.vehicleType || "Bike",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      mobileNumber: formData.mobileNumber || "",
      city: formData.city || "Dhaka",
    },
  });

  // Sync form data on navigation
  const onSubmit = (data) => {
    updateFormData(data);
    router.push("/earn-with-onway/personal-info");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans mb-12">
      {/* Header Section */}
      <div className="w-full bg-white pt-24 pb-12 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Curved background bottom effect (optional subtle touch) */}
        <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-[150%] h-[150px] bg-[#f8f9fa] rounded-t-[100%]"></div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Earn with Your Bike, Car or Cycle
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Become a captain, rider or foodman on the highest earning platform!
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Register Form */}
        <div className="lg:col-span-5 relative z-20 -mt-24 lg:-mt-28">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Register Now</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              
              {/* Vehicle Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                <select 
                  {...register("vehicleType")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="Bike">Bike</option>
                  <option value="Car">Car</option>
                  <option value="Cycle">Cycle</option>
                </select>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    {...register("firstName", { required: "First Name is required" })}
                    className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input 
                    type="text" 
                    {...register("lastName")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  {...register("mobileNumber", { 
                    required: "Mobile Number is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Please enter a valid number"
                    }
                  })}
                  className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register("city", { required: "City is required" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="mt-2">
                <button 
                  type="submit"
                  className="bg-[#e43232] text-white px-8 py-2.5 rounded hover:bg-[#c92828] transition-colors font-medium flex items-center justify-center gap-2 w-fit"
                >
                  Next Step
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
                <p className="text-[10px] text-gray-500 mt-3 leading-tight">
                  By clicking this button, you are agreeing to OnWay's <a href="#" className="text-red-500 hover:underline">terms and privacy policy</a>
                </p>
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="lg:col-span-7 flex flex-col gap-12 mt-4 lg:mt-0 lg:pl-8">
          
          {/* Got a bike section */}
          <div>
            <h3 className="text-2xl font-bold text-[#1a3760] mb-2">Got a bike?</h3>
            <p className="text-gray-500 text-sm mb-6">These are the services you can be a part of!</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Bike className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">Bike Rider</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-5 h-5 text-green-500" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">Food Man</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">Parcel Delivery</span>
              </div>
            </div>
            
            <div className="h-px w-full bg-gray-200 mt-10"></div>
          </div>

          {/* Easy Income Opportunity Section */}
          <div>
            <h3 className="text-2xl font-bold text-[#1a3760] mb-4 leading-snug max-w-sm">
              OnWay Bike: Easy Income Opportunity!
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
              Now earn from 45,000 to 50,000 taka per month being an OnWay Bike rider. 
              As a new rider, enjoy 1% commission on ride sharing. Parcel - Along with 
              ride sharing, take the opportunity to earn extra income through parcel delivery. 
              Become an OnWay Hero today!
            </p>

            <div className="flex flex-col gap-6">
              
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Your Ride is Secured</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    OnWay cares about your safety. And to keep you safe, OnWay is giving you safety coverage.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Earn More with Bonus</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    With OnWay's daily quests and attractive special offers, you can earn extra regularly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <CalendarCheck className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Get Your Payment on Time</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    With OnWay, you will never face a delay in payment. Get your payment in the shortest time!
                  </p>
                </div>
              </div>

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}