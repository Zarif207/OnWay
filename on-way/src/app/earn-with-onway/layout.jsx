"use client";

import { EarnRegistrationProvider } from "@/context/EarnRegistrationContext";

export default function EarnWithOnWayLayout({ children }) {
  return (
    <EarnRegistrationProvider>
      {/* 
        This provider wraps all pages under /earn-with-onway 
        so they can share the single form state.
      */}
      {children}
    </EarnRegistrationProvider>
  );
}
