"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
function PaymentFailContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction");

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-rose-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. Please try again.
        </p>

        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {transactionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/payment"
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}