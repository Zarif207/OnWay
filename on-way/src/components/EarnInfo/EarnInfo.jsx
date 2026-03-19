import React from "react";
import { ShieldCheck, DollarSign, Clock, Zap, TrendingUp } from "lucide-react";

export default function EarnInfo() {
  return (
    <div className="w-full max-w-5xl mx-auto py-10 flex flex-col gap-12">

      {/* HEADER */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-4xl font-extrabold text-[#001820] leading-tight">
          Build your income with{" "}
          <span className="text-[#31ca71]">OnWay</span>
        </h2>
        <p className="text-gray-500 mt-3 text-[15px]">
          Ride on your own time, earn consistently, and grow with a platform built for riders.
        </p>
      </div>

      {/* BENEFITS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* CARD */}
        <div className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#e8faf2] flex items-center justify-center mb-4 group-hover:bg-[#31ca71] transition">
            <DollarSign className="text-[#31ca71] group-hover:text-white" />
          </div>
          <h4 className="font-bold text-lg text-[#001820] mb-1">
            Earn More Per Ride
          </h4>
          <p className="text-gray-500 text-sm">
            Competitive fares and bonus incentives help you maximize your daily income.
          </p>
        </div>

        {/* CARD */}
        <div className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#e8faf2] flex items-center justify-center mb-4 group-hover:bg-[#31ca71] transition">
            <Clock className="text-[#31ca71] group-hover:text-white" />
          </div>
          <h4 className="font-bold text-lg text-[#001820] mb-1">
            Work on Your Time
          </h4>
          <p className="text-gray-500 text-sm">
            No fixed shifts. Go online anytime and ride whenever it suits you.
          </p>
        </div>

        {/* CARD */}
        <div className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#e8faf2] flex items-center justify-center mb-4 group-hover:bg-[#31ca71] transition">
            <Zap className="text-[#31ca71] group-hover:text-white" />
          </div>
          <h4 className="font-bold text-lg text-[#001820] mb-1">
            Instant Withdrawals
          </h4>
          <p className="text-gray-500 text-sm">
            Get your earnings fast with simple and quick withdrawal options.
          </p>
        </div>

        {/* CARD */}
        <div className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#e8faf2] flex items-center justify-center mb-4 group-hover:bg-[#31ca71] transition">
            <ShieldCheck className="text-[#31ca71] group-hover:text-white" />
          </div>
          <h4 className="font-bold text-lg text-[#001820] mb-1">
            Safer Rides
          </h4>
          <p className="text-gray-500 text-sm">
            Verified users and ride tracking help keep every trip secure.
          </p>
        </div>

        {/* EXTRA STRONG SELLING POINT */}
        <div className="group bg-[#31ca71] text-white rounded-2xl p-6 col-span-1 sm:col-span-2 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <TrendingUp />
            <div>
              <h4 className="font-bold text-lg mb-1">
                Grow with OnWay
              </h4>
              <p className="text-sm opacity-90">
                The more you ride, the more opportunities you unlock — bonuses, priority rides, and higher earnings.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}