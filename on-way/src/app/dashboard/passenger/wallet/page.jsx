'use client';

import {
  DollarSign,
  Plus,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  TicketPercent,
} from 'lucide-react';

/* ---------- UI Components ---------- */

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, variant = 'primary', className = '' }) {
  const base =
    'px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center';

  const styles = {
    primary: 'bg-black text-white hover:opacity-90',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    accent: 'bg-yellow-400 text-black hover:bg-yellow-500',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* ---------- Wallet Page ---------- */

export default function Wallet() {
  const balance = 73.75;

  const transactions = [
    {
      id: 1,
      type: 'debit',
      amount: 12.5,
      description: 'Ride to Elm St',
      date: '2026-02-16',
      status: 'completed',
    },
    {
      id: 2,
      type: 'credit',
      amount: 50,
      description: 'Wallet Top-up (Stripe)',
      date: '2026-02-15',
      status: 'completed',
    },
    {
      id: 3,
      type: 'credit',
      amount: 10,
      description: 'Refund (Cancelled Ride)',
      date: '2026-02-14',
      status: 'refunded',
    },
  ];

  const promoHistory = [
    { code: 'WELCOME10', discount: '$10', usedOn: '2026-02-12' },
    { code: 'RIDE5', discount: '$5', usedOn: '2026-02-10' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Wallet & Payments
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your ride credits, payment methods, and transactions.
          </p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 border-l-4 border-yellow-400">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 mb-2">
                Available Ride Credits
              </p>
              <h2 className="text-4xl font-bold text-black">
                ${balance.toFixed(2)}
              </h2>
            </div>

            <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center">
              <DollarSign className="text-black w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button variant="accent">
              <Plus className="w-5 h-5 mr-2" />
              Add via Stripe
            </Button>

            <Button variant="outline">
              <CreditCard className="w-5 h-5 mr-2" />
              SSLCommerz
            </Button>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-black">
              Payment Methods
            </h3>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>

          <div className="p-4 border-2 border-yellow-400 bg-yellow-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <CreditCard className="text-yellow-400 w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-black">
                    Visa •••• 4242
                  </p>
                  <p className="text-sm text-gray-600">
                    Expires 12/26
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-400 text-black text-sm rounded-full font-medium">
                Default
              </span>
            </div>
          </div>
        </Card>

        {/* Promo Code History */}
        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-black mb-4">
            Promo Code History
          </h3>

          <div className="space-y-3">
            {promoHistory.map((promo, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <TicketPercent className="text-yellow-500" />
                  <div>
                    <p className="font-semibold text-black">
                      {promo.code}
                    </p>
                    <p className="text-sm text-gray-500">
                      Used on {promo.usedOn}
                    </p>
                  </div>
                </div>
                <span className="text-green-600 font-bold">
                  -{promo.discount}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Transactions */}
        <Card>
          <h3 className="text-xl font-semibold text-black mb-6">
            Transaction Statements
          </h3>

          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex gap-4 items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      tx.type === 'credit'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowDownLeft className="text-green-600" />
                    ) : (
                      <ArrowUpRight className="text-red-600" />
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-black">
                      {tx.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-bold ${
                      tx.type === 'credit'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}$
                    {tx.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}