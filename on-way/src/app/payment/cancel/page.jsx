"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction");
  const bookingId     = searchParams.get("bookingId");
  const router        = useRouter();

  useEffect(() => {
    toast("Payment cancelled. You still need to complete it.", {
      duration: 5000,
      style: { borderRadius: "15px", background: "#011421", color: "#fff" },
      icon: "⚠️",
    });
  }, []);

  const retryUrl = bookingId ? `/payment?bookingId=${bookingId}` : "/payment";

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">

        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-2">You cancelled the payment. No charges were made.</p>
        <p className="text-sm text-yellow-600 font-medium mb-6">
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

export default function PaymentCancel() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}
