"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function PaymentPage() {
  const [paymentData, setPaymentData] = useState({
    amount: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "Ride Payment",
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: "card", name: "Card", icon: "💳", color: "from-blue-500 to-blue-600" },
    { id: "bkash", name: "bKash", icon: "📱", color: "from-pink-500 to-pink-600" },
    { id: "nagad", name: "Nagad", icon: "💰", color: "from-orange-500 to-orange-600" },
    { id: "cash", name: "Cash", icon: "💵", color: "from-green-500 to-green-600" },
  ];

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCardChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    // Card number formatting
    if (name === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      if (value.length > 19) return;
    }

    // Expiry date formatting
    if (name === "expiryDate") {
      value = value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
      }
      if (value.length > 5) return;
    }

    // CVV limit
    if (name === "cvv" && value.length > 3) return;

    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          customerName: paymentData.customerName,
          customerEmail: paymentData.customerEmail,
          customerPhone: paymentData.customerPhone,
          productName: paymentData.productName,
          paymentMethod: paymentMethod,
          ...(paymentMethod === "card" && { cardDetails }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (paymentMethod === "cash") {
          Swal.fire({
            toast: true,
            position: window.innerWidth < 768 ? "top" : "top-end",
            icon: "success",
            title: "Cash Payment Confirmed!",
            text: "Payment will be collected during service.",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        } else if (data.gatewayUrl) {
          window.location.href = data.gatewayUrl;
        } else {
          Swal.fire({
            toast: true,
            position: window.innerWidth < 768 ? "top" : "top-end",
            icon: "success",
            title: "Payment Initiated!",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } else {
        Swal.fire({
          toast: true,
          position: window.innerWidth < 768 ? "top" : "top-end",
          icon: "error",
          title: "Payment Failed",
          text: "Please try again.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire({
        toast: true,
        position: window.innerWidth < 768 ? "top" : "top-end",
        icon: "error",
        title: "Something went wrong!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-1">Choose your payment method</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Side - Payment Methods & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Method
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`relative p-4 rounded-xl transition-all ${
                      paymentMethod === method.id
                        ? `bg-linear-to-br ${method.color} text-white shadow-lg scale-105`
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <div className="text-sm font-medium">{method.name}</div>
                    {paymentMethod === method.id && (
                      <div className="absolute top-2 right-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details Form */}
            {paymentMethod === "card" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Card Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={cardDetails.cardName}
                      onChange={handleCardChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Details
              </h2>
              <form onSubmit={handlePayment} className="space-y-4">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={paymentData.customerEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={paymentData.customerPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium text-gray-900">
                    {paymentData.productName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handleChange}
                    required
                    className="w-24 text-right px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium text-gray-900">৳0</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-2xl text-blue-600">
                    ৳{paymentData.amount || "0"}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !paymentData.amount}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : paymentMethod === "cash" ? (
                  "Confirm Cash Payment"
                ) : (
                  `Pay ৳${paymentData.amount || "0"}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {paymentMethod === "cash"
                  ? "💵 Pay when service is provided"
                  : "🔒 Secured by SSLCommerz"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
