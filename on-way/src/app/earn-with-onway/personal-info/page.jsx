"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import EarnInfo from "@/components/EarnInfo/EarnInfo";

export default function PersonalInfoPage() {
  const router = useRouter();
  const { formData, updateFormData } = useEarnRegistration();

  const {
    register,
    handleSubmit,
    control,
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
      // Ignoring photo file for simple JSON state example, 
      // in reality this would require FormData or base64
    },
  });

  const onSubmit = (data) => {
    updateFormData(data);
    router.push("/earn-with-onway/vehicle-info");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-16 font-sans">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 flex flex-col gap-12">
        
        {/* Top Section: Information Block */}
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 border border-gray-100">
          <EarnInfo />
        </div>

        {/* Bottom Section: Form */}
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          
          <div className="bg-gray-50 border-b border-gray-100 px-8 py-5">
            <h2 className="text-xl font-bold text-gray-900">01 Personal Information</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 flex flex-col gap-6 max-w-3xl">
            
            {/* Row: Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {...register("mobileNumber", { required: "Mobile Number is required" })}
                className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>

            {/* Gender Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select 
                {...register("gender")}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth & City */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Date Of Birth <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                {...register("dateOfBirth", { required: "Date of Birth is required" })}
                className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">City</label>
              <select 
                {...register("city")}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
              </select>
            </div>

            {/* Services Checkboxes */}
            <div className="flex flex-col gap-3 mt-2">
              <label className="text-sm font-medium text-gray-700">Service(s) you want to provide</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" value="Bike Rider" {...register("serviceProvide")} className="w-5 h-5 accent-red-600 rounded" />
                  <span className="text-gray-700 text-sm">Bike Rider</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" value="Food Delivery" {...register("serviceProvide")} className="w-5 h-5 accent-red-600 rounded" />
                  <span className="text-gray-700 text-sm">Food Delivery</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" value="Tong Delivery" {...register("serviceProvide")} className="w-5 h-5 accent-red-600 rounded" />
                  <span className="text-gray-700 text-sm">Tong Delivery</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" value="Parcel Delivery" {...register("serviceProvide")} className="w-5 h-5 accent-red-600 rounded" />
                  <span className="text-gray-700 text-sm">Parcel Delivery</span>
                </label>
              </div>
            </div>

            {/* Identity */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-medium text-gray-700">
                Select Your Identity <span className="text-red-500">*</span>
              </label>
              <select 
                {...register("identityType")}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="NID">NID</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                NID Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter your nid number"
                {...register("identityNumber", { required: "Identity Number is required" })}
                className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 ${errors.identityNumber ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Referral Code</label>
              <input 
                type="text" 
                placeholder="Enter your referral code"
                {...register("referralCode")}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-medium text-gray-700">
                Upload your photo <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-4 mt-1">
                <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer border border-gray-300 rounded-md" />
                  <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                    <p>*Please upload a clear image of your full face from front</p>
                    <p>*Full face should be visible</p>
                    <p>*Image size cannot exceed 1MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                type="submit"
                className="bg-[#e43232] text-white px-8 py-2.5 rounded hover:bg-[#c92828] transition-colors font-medium"
              >
                Next Step
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
