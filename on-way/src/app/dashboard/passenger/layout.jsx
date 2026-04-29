"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ShieldX } from "lucide-react";

// Role guard only — no payment gate.
// Payment is optional and available via the payment page.

export default function PassengerLayout({ children }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  if (authStatus === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    router.replace("/authPage");
    return null;
  }

  const rawRole = session?.user?.role;
  const role    = rawRole === "user" ? "passenger" : rawRole;

  if (role !== "passenger") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldX size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">
            This dashboard is only accessible to passengers.
          </p>
          <button
            onClick={() => router.replace(`/dashboard/${role}`)}
            className="w-full py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl transition-all"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
