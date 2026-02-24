import React from "react";
import { Bike, Utensils, Package, ShieldCheck, DollarSign, CalendarCheck } from "lucide-react";

export default function EarnInfo() {
  return (
    <div className="flex flex-col gap-10">
      {/* Got a bike section */}
      <div>
        <h3 className="text-2xl font-bold text-[#1a3760] mb-2">Got a bike?</h3>
        <p className="text-gray-500 text-sm mb-6">These are the services you can be a part of!</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-3 bg-red-50/50 p-2.5 rounded-lg border border-red-100 w-fit pr-6">
            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-red-500 text-sm font-bold">🏍</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">Bike Rider</span>
          </div>
          <div className="flex items-center gap-3 bg-green-50/50 p-2.5 rounded-lg border border-green-100 w-fit pr-6">
            <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-500 text-sm font-bold">🍴</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">Food Man</span>
          </div>
          <div className="flex items-center gap-3 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 w-fit pr-6">
            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-500 text-sm font-bold">📦</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">Parcel Delivery</span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gray-200"></div>

      {/* Easy Income Opportunity Section */}
      <div>
        <h3 className="text-2xl font-bold text-[#1a3760] mb-4 leading-snug max-w-sm">
          OnWay Bike: Easy Income Opportunity!
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 md:max-w-xl">
          Now earn from 45,000 to 50,000 taka per month being an OnWay Bike rider. 
          As a new rider, enjoy 1% commission on ride sharing. Parcel - Along with 
          ride sharing, take the opportunity to earn extra income through parcel delivery. 
          Become an OnWay Hero today!
        </p>

        <div className="flex flex-col gap-6 max-w-xl">
          
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
  );
}
