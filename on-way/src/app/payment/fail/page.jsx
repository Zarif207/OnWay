"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction");
  const bookingId     = searchParams.get("bookingId");
  const router        = useRouter();

  useEffect(() => {
    toast.error("Payment failed. Please complete your payment to continue.", {
      duration: 5000,
      style: { borderRadius: "15px", background: "#011421", color: "#fff" },
      icon: "❌",
    });
  }, []);

  const retryUrl = bookingId ? `/payment?bookingId=${bookingId}` : "/payment";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4">
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-2">Your payment could not be processed.</p>
        <p className="text-sm text-red-500 font-medium mb-6">
          You must complete this payment before booking a new ride.
        </p>

        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{transactionId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push(retryUrl)}
            className="block w-full bg-primary hover:bg-accent text-white font-semibold py-3 rounded-xl transition-all"
          >
            Complete Payment
          </button>
          <button
            onClick={() => router.push("/dashboard/passenger")}
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}
