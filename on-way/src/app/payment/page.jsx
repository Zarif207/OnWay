"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ─── Payment Methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "bkash", name: "bKash", image: "https://i.ibb.co.com/T35XzZc/b-Kash-Icon-Vector-300x300.jpg" },
  { id: "nagad", name: "Nagad", image: "https://i.ibb.co.com/s0tykNn/images.png" },
  { id: "bank",  name: "Bank",  image: "https://i.ibb.co.com/v4tBXZvy/visa-logo-visa-icon-transparent-free-png.png" },
  { id: "upay",  name: "Upay",  image: "https://i.ibb.co.com/TDCPrv99/images.jpg" },
];

// ─── Validation Rules ─────────────────────────────────────────────────────────
const RULES = {
  walletName: { regex: /^[A-Za-z\s]{3,50}$/,  msg: "Name must be 3-50 letters only" },
  phone:      { regex: /^01[3-9][0-9]{8}$/,   msg: "Enter a valid BD phone number (e.g. 01XXXXXXXXX)" },
  accName:    { regex: /^[A-Za-z\s]{3,50}$/,  msg: "Account name must be 3-50 letters only" },
  accNumber:  { regex: /^[0-9]{8,20}$/,        msg: "Account number must be 8-20 digits" },
  bankName:   { regex: /^[A-Za-z\s]{3,50}$/,  msg: "Bank name must be 3-50 letters only" },
};

function validate(fields) {
  const errors = {};
  Object.entries(fields).forEach(([key, { value, rule }]) => {
    if (!value.trim()) {
      errors[key] = "This field is required";
    } else if (!RULES[rule].regex.test(value.trim())) {
      errors[key] = RULES[rule].msg;
    }
  });
  return errors;
}

// ─── Reusable FormField ───────────────────────────────────────────────────────
function FormField({ label, name, value, onChange, placeholder, error, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Wallet Form (bKash / Nagad / Upay) ──────────────────────────────────────
function WalletForm({ values, onChange, errors }) {
  return (
    <div className="space-y-4">
      <FormField
        label="Account Holder Name"
        name="walletName"
        value={values.walletName}
        onChange={onChange}
        placeholder="e.g. Rahim Uddin"
        error={errors.walletName}
      />
      <FormField
        label="Phone Number"
        name="phone"
        value={values.phone}
        onChange={onChange}
        placeholder="01XXXXXXXXX"
        error={errors.phone}
        type="tel"
      />
    </div>
  );
}

// ─── Bank Form ────────────────────────────────────────────────────────────────
function BankForm({ values, onChange, errors }) {
  return (
    <div className="space-y-4">
      <FormField
        label="Account Name"
        name="accName"
        value={values.accName}
        onChange={onChange}
        placeholder="e.g. John Doe"
        error={errors.accName}
      />
      <FormField
        label="Account Number"
        name="accNumber"
        value={values.accNumber}
        onChange={onChange}
        placeholder="e.g. 12345678901"
        error={errors.accNumber}
      />
      <FormField
        label="Bank Name"
        name="bankName"
        value={values.bankName}
        onChange={onChange}
        placeholder="e.g. Dutch Bangla Bank"
        error={errors.bankName}
      />
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function PaymentContent() {
  const searchParams = useSearchParams();
  const amountFromUrl = searchParams.get("amount");

  const [amount, setAmount]               = useState(amountFromUrl || "");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [loading, setLoading]             = useState(false);
  const [wallet, setWallet]               = useState({ walletName: "", phone: "" });
  const [bank, setBank]                   = useState({ accName: "", accNumber: "", bankName: "" });
  const [errors, setErrors]               = useState({});

  useEffect(() => {
    if (amountFromUrl) setAmount(amountFromUrl);
  }, [amountFromUrl]);

  const handleMethodChange = (id) => {
    setPaymentMethod(id);
    setErrors({});
  };

  const handleWalletChange = (e) => {
    setWallet((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleBankChange = (e) => {
    setBank((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const getValidationFields = () => {
    if (paymentMethod === "bank") {
      return {
        accName:   { value: bank.accName,   rule: "accName" },
        accNumber: { value: bank.accNumber, rule: "accNumber" },
        bankName:  { value: bank.bankName,  rule: "bankName" },
      };
    }
    return {
      walletName: { value: wallet.walletName, rule: "walletName" },
      phone:      { value: wallet.phone,      rule: "phone" },
    };
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const fieldErrors = validate(getValidationFields());
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount,
        paymentMethod,
        ...(paymentMethod === "bank" ? { bankDetails: bank } : { walletDetails: wallet }),
      };

      const res  = await fetch(`${API_URL}/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (data.gatewayUrl) {
          window.location.href = data.gatewayUrl;
        } else {
          Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Payment Initiated!", showConfirmButton: false, timer: 3000, timerProgressBar: true });
        }
      } else {
        Swal.fire({ toast: true, position: "top-end", icon: "error", title: "Payment Failed", text: "Please try again.", showConfirmButton: false, timer: 3000, timerProgressBar: true });
      }
    } catch {
      Swal.fire({ toast: true, position: "top-end", icon: "error", title: "Something went wrong!", showConfirmButton: false, timer: 3000, timerProgressBar: true });
    } finally {
      setLoading(false);
    }
  };

  const activeMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 pt-24">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Payment</h1>
          <p className="text-gray-500 mt-1 text-sm">Choose your payment method and complete the details below.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Method Tabs + Form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Method Tabs */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-secondary mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const isActive = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleMethodChange(method.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-sm scale-[1.03]"
                          : "border-gray-100 bg-gray-50 hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <img
                          src={method.image}
                          alt={method.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-gray-600"}`}>
                        {method.name}
                      </span>
                      {isActive && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <img src={activeMethod.image} alt={activeMethod.name} className="w-full h-full object-contain p-0.5" />
                </div>
                <h2 className="text-base font-semibold text-secondary">{activeMethod.name} Details</h2>
              </div>

              <form onSubmit={handlePayment} noValidate>
                {paymentMethod === "bank" ? (
                  <BankForm values={bank} onChange={handleBankChange} errors={errors} />
                ) : (
                  <WalletForm values={wallet} onChange={handleWalletChange} errors={errors} />
                )}
                <button
                  type="submit"
                  disabled={loading || !amount}
                  className="mt-6 w-full lg:hidden bg-primary hover:bg-accent text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? <Spinner /> : `Pay ${amount || "0"} BDT`}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-base font-semibold text-secondary mb-4">Summary</h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service</span>
                  <span className="font-medium text-gray-900">Ride Payment</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Amount</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-24 text-right px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Processing Fee</span>
                  <span className="font-medium text-gray-900">0 BDT</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                  <span className="font-semibold text-secondary">Total</span>
                  <span className="font-black text-2xl text-primary">{amount || "0"} BDT</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 mb-4">
                <div className="w-6 h-6 rounded overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                  <img src={activeMethod.image} alt={activeMethod.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-semibold text-primary">Paying via {activeMethod.name}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !amount}
                className="hidden lg:flex w-full bg-primary hover:bg-accent text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] items-center justify-center gap-2"
              >
                {loading ? <Spinner /> : `Pay ${amount || "0"} BDT`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">Secured by OnWay</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
