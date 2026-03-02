import React from "react";
import { Bike, Utensils, Package, ShieldCheck, DollarSign, CalendarCheck } from "lucide-react";

export default function EarnInfo() {
  return (
    <div className="flex flex-col gap-10">

      {/* Dynamic Header Block */}
      <div>
        <h3 className="text-3xl font-extrabold text-[#001820] mb-3">
          Why ride with <span className="text-[#31ca71]">OnWay?</span>
        </h3>
        <p className="text-gray-500 text-[15px] max-w-sm mb-6">
          Your journey to flexible, massive earnings starts right here.
        </p>

        {/* Service Tiles */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#31ca71]/30 transition-all duration-300 w-fit pr-6 group">
            <div className="w-9 h-9 rounded-lg bg-[#e5f7f0] flex items-center justify-center flex-shrink-0 group-hover:bg-[#31ca71] transition-colors duration-300">
              <span className="text-[#15ae72] group-hover:text-[#001820] text-sm font-bold transition-colors">🏍</span>
            </div>
            <span className="font-bold text-[#001820] text-[14px] whitespace-nowrap">Bike Rider</span>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-yellow-400/30 transition-all duration-300 w-fit pr-6 group">
            <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-400 transition-colors duration-300">
              <span className="text-yellow-600 group-hover:text-[#001820] text-sm font-bold transition-colors">🍴</span>
            </div>
            <span className="font-bold text-[#001820] text-[14px] whitespace-nowrap">Food Man</span>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 w-fit pr-6 group">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors duration-300">
              <span className="text-blue-500 group-hover:text-white text-sm font-bold transition-colors">📦</span>
            </div>
            <span className="font-bold text-[#001820] text-[14px] whitespace-nowrap">Parcel Delivery</span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-gray-200 to-transparent"></div>

      {/* Easy Income Stats */}
      <div>
        <h3 className="text-xl font-bold text-[#001820] mb-6">
          Premium Captain Benefits
        </h3>

        <div className="flex flex-col gap-8 max-w-md">

          <div className="flex items-start gap-5 group">
            <div className="mt-0.5 flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_-10px_rgba(49,202,113,0.3)] transition-all duration-500">
              <ShieldCheck className="w-6 h-6 text-[#31ca71]" />
            </div>
            <div>
              <h4 className="font-bold text-[#001820] text-[15px] mb-1">Guaranteed Safety</h4>
              <p className="text-gray-500 text-[13px] leading-relaxed">
                OnWay cares about your safety. And to keep you safe, we provide comprehensive captain safety coverage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 group">
            <div className="mt-0.5 flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_-10px_rgba(49,202,113,0.3)] transition-all duration-500 delay-75">
              <DollarSign className="w-6 h-6 text-[#31ca71]" />
            </div>
            <div>
              <h4 className="font-bold text-[#001820] text-[15px] mb-1">Massive Bonuses</h4>
              <p className="text-gray-500 text-[13px] leading-relaxed">
                Enjoy a flat 1% commission structure for new riders, plus daily quests to massively scale up your income.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 group">
            <div className="mt-0.5 flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_-10px_rgba(49,202,113,0.3)] transition-all duration-500 delay-150">
              <CalendarCheck className="w-6 h-6 text-[#31ca71]" />
            </div>
            <div>
              <h4 className="font-bold text-[#001820] text-[15px] mb-1">Instant Payouts</h4>
              <p className="text-gray-500 text-[13px] leading-relaxed">
                Never wait for what's yours. Withdraw your earnings daily and watch your bank account grow instantly.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
