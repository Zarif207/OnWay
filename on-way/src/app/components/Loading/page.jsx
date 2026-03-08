"use client";

import { useEffect, useState } from "react";
import { Car } from "lucide-react";

export default function OnWayLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          return 100;
        }
        return old + 4;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      data-theme="onwaytheme"
      className="flex items-center justify-center min-h-screen bg-transparent"
    >
      <div className="text-center w-80">

        {/* Moving Car Animation */}
        <div className="relative h-16 mb-6 overflow-hidden">
          <div
            className="absolute text-secondary transition-all duration-200"
            style={{ left: `${progress}%` }}
          >
            <Car size={50} />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-accent tracking-wide">
          OnWay
        </h1>

        <p className="text-secondary text-sm mt-1 mb-6">
          Your Ride, Your Way
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-accent/30 rounded-full h-3 overflow-hidden">
          <div
            className="bg-secondary h-3 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="mt-3 text-accent text-sm font-medium">
          {progress}% Loading...
        </p>

      </div>
    </div>
  );
}