"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FloatingSOSButton() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);

  // Only show if user is logged in
  if (!session) {
    return null;
  }

  const handleClick = () => {
    router.push("/emergency-sos");
  };

  return (
    <div className="fixed bottom-24 right-6 z-46">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-10 h-10 bg-linear-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
        aria-label="Emergency SOS"
      >
        <div className="relative flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
          Panic Button
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
