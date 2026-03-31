"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction");
  const router = useRouter();

  useEffect(() => {
    toast.success("Payment Successful! Redirecting to your dashboard.", {
      duration: 3000,
      style: { borderRadius: "15px", background: "#011421", color: "#fff" },
      icon: "🎉",
    });

    // Clean up any pending booking reference
    localStorage.removeItem("onway_pending_bookingId");

    const timer = setTimeout(() => {
      router.push("/dashboard/passenger");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>

        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{transactionId}</p>
          </div>
        )}

        <p className="text-sm text-gray-400 animate-pulse">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
