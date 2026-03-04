"use client";
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({ label, value, icon: Icon, percentage, trend, color }) => {
  const isPositive = trend === "up";
  
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-').replace('-100', '-600')} />
      </div>
      
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      
      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50">
        <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {percentage}%
        </div>
        <span className="text-[10px] text-gray-400 font-medium">more from previous month</span>
      </div>
    </div>
  );
};

export const ActivityPanel = () => {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-tight">Actives</h3>
      
      <div className="space-y-8 relative">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-gray-100 italic" />
        
        <div className="flex gap-4 relative">
          <div className="w-3.5 h-3.5 rounded-full bg-green-500 ring-4 ring-green-50 z-10" />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-gray-900">Start</span>
              <span className="text-[10px] font-medium text-gray-400">Total 35.5km</span>
            </div>
            <p className="text-xs text-gray-500">Mapple H. International New York NY 44521</p>
          </div>
        </div>

        <div className="flex gap-4 relative">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-50 z-10" />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-gray-900">End</span>
              <span className="text-[10px] font-medium text-gray-400">Total 35.5km</span>
            </div>
            <p className="text-xs text-gray-500">Blue-crest 34th Liberty Road New York NY 32414</p>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-gray-50/50 p-4 rounded-2xl">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Service Available Location</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs font-bold text-gray-900">Passenger 1</span>
            </div>
            <span className="text-[10px] font-medium text-gray-400">Website - 5m</span>
          </div>
          <p className="text-[10px] text-gray-400 pl-5">123 Main Street, City Center, New York, NY 10001</p>
          
          <div className="flex justify-between items-center opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-xs font-bold text-gray-900">Passenger 2</span>
            </div>
            <span className="text-[10px] font-medium text-gray-400">Website - 10m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
