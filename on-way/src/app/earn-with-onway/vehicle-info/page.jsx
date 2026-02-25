"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import EarnInfo from "@/components/EarnInfo/EarnInfo";

export default function VehicleInfoPage() {
  const router = useRouter();
  const { formData, updateFormData } = useEarnRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    setErrorMsg("");
    
    // Merge final data
    const finalData = { ...formData, ...data };
    updateFormData(data);

    try {
      const response = await fetch("/api/earn-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        setSuccess(true);
        // Normally you might redirect to a success page
        // router.push("/earn-with-onway/success");
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || "Failed to submit registration");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] pt-32 pb-16 flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-12 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-center max-w-lg border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-500 mb-8">
            Thank you for registering with OnWay. Our team will review your application and contact you shortly.
          </p>
          <button 
            onClick={() => router.push("/")}
            className="bg-[#e43232] text-white px-8 py-3 rounded hover:bg-[#c92828] transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-16 font-sans">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 flex flex-col gap-12">
        
        {/* Top Section: Form */}
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          
          <div className="bg-gray-50 border-b border-gray-100 px-8 py-5">
            <h2 className="text-xl font-bold text-gray-900">02 Vehicle Information</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 flex flex-col gap-6 max-w-3xl">
            
            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {errorMsg}
              </div>
            )}

            {/* Row: Brand & Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Select Brand <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register("brand", { required: "Brand is required" })}
                  className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white ${errors.brand ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select The Brand</option>
                  <option value="Yamaha">Yamaha</option>
                  <option value="Honda">Honda</option>
                  <option value="Suzuki">Suzuki</option>
                  <option value="Bajaj">Bajaj</option>
                  <option value="Toyota">Toyota (Car)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Select Model <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register("model", { required: "Model is required" })}
                  className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white ${errors.model ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Your Vehicle Model</option>
                  <option value="R15">R15</option>
                  <option value="CBR">CBR</option>
                  <option value="Gixxer">Gixxer</option>
                  <option value="Pulsar">Pulsar</option>
                  <option value="Axio">Axio</option>
                </select>
              </div>
            </div>

            {/* Registration Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  {...register("registrationRegion")}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                </select>
                <select 
                  {...register("registrationCategory")}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="Metric">Metric</option>
                  <option value="Ha">Ha</option>
                  <option value="La">La</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Digits"
                  {...register("registrationDigits", { required: "Registration Digits required" })}
                  className={`flex-1 border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 ${errors.registrationDigits ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Year <span className="text-red-500">*</span>
              </label>
              <select 
                {...register("year", { required: "Year is required" })}
                className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Year</option>
                {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Tax Token Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Tax Token Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Add your Token Number"
                {...register("taxTokenNumber", { required: "Tax Token is required" })}
                className={`w-full border rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 ${errors.taxTokenNumber ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>

            {/* Fitness Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Fitness Number</label>
              <input 
                type="text" 
                placeholder="Add your Fitness Number"
                {...register("fitnessNumber")}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#e43232] text-white px-8 py-2.5 rounded hover:bg-[#c92828] transition-colors font-medium disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                Submit
              </button>
            </div>

          </form>
        </div>

        {/* Bottom Section: Information Block */}
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 border border-gray-100 mb-12">
          <EarnInfo />
        </div>

      </div>
    </div>
  );
}
