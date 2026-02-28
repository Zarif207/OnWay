"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import { ChevronDown } from "lucide-react";

export default function RideCategoryPage() {
  const router = useRouter();
  const { updateFormData } = useEarnRegistration();

  const [activeCategory, setActiveCategory] = useState(null);
  const [openLuxury, setOpenLuxury] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleSelect = (type) => {
    setSelectedVehicle(type);
    updateFormData({ vehicleType: type });
  };

  const handleNext = () => {
    if (!selectedVehicle) {
      alert("Please select vehicle type");
      return;
    }

    router.push("/earn-with-onway/personal-info");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">

      <h1 className="text-3xl font-bold mb-10">Choose Your Ride</h1>

      <div className="flex gap-6">

        {/* Cars */}
        <div className="bg-zinc-900 p-6 rounded-2xl w-72">
          <div
            onClick={() =>
              setActiveCategory(activeCategory === "cars" ? null : "cars")
            }
            className="flex justify-between cursor-pointer"
          >
            <h2>Cars</h2>
            <ChevronDown
              className={`transition ${
                activeCategory === "cars" ? "rotate-180" : ""
              }`}
            />
          </div>

          {activeCategory === "cars" && (
            <div className="mt-5 space-y-3">

              {["Sedan", "SUV", "Pickup Truck"].map((type) => (
                <div
                  key={type}
                  onClick={() => handleSelect(type)}
                  className={`p-3 rounded-xl cursor-pointer ${
                    selectedVehicle === type
                      ? "bg-green-500 text-black"
                      : "bg-zinc-800"
                  }`}
                >
                  {type}
                </div>
              ))}

            </div>
          )}
        </div>

        {/* Bike */}
        <div
          onClick={() => handleSelect("Bike")}
          className={`bg-zinc-900 p-6 rounded-2xl w-52 cursor-pointer ${
            selectedVehicle === "Bike"
              ? "bg-blue-500 text-black"
              : ""
          }`}
        >
          Bike
        </div>

        {/* Ambulance */}
        <div
          onClick={() => handleSelect("Ambulance")}
          className={`bg-zinc-900 p-6 rounded-2xl w-52 cursor-pointer ${
            selectedVehicle === "Ambulance"
              ? "bg-red-500 text-black"
              : ""
          }`}
        >
          Ambulance
        </div>
      </div>

      <button
        onClick={handleNext}
        className="mt-10 bg-green-500 px-8 py-3 rounded-xl text-black font-bold"
      >
        Next Step
      </button>
    </div>
  );
}