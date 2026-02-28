"use client";

import { useState } from "react";

export default function PaymentPage() {
  const [paymentData, setPaymentData] = useState({
    amount: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "Ride Payment",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // SSLCommerz integration korar jonno ekhane code likhben
    console.log("Payment Data:", paymentData);

    // Simulate payment process
    setTimeout(() => {
      setLoading(false);
      alert("Payment gateway ready for SSLCommerz integration");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Payment Gateway
            </h1>
            <p className="text-gray-600">
              Complete your payment securely
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (BDT)
              </label>
              <input
                type="number"
                name="amount"
                value={paymentData.amount}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="customerName"
                value={paymentData.customerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="customerEmail"
                value={paymentData.customerEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={paymentData.customerPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product/Service
              </label>
              <input
                type="text"
                name="productName"
                value={paymentData.productName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Product name"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">৳{paymentData.amount || "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-medium">৳0</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="font-bold text-indigo-600 text-lg">
                  ৳{paymentData.amount || "0"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Secured by SSLCommerz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
