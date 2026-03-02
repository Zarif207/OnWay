import React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

const PromoCodes = () => {
  const promos = [
    {
      id: 1,
      code: "SAVE20",
      discount: "20%",
      validUntil: "2026-03-31",
      used: 345,
      limit: 1000,
      status: "active",
    },
    {
      id: 2,
      code: "FLAT10",
      discount: "$10",
      validUntil: "2026-02-28",
      used: 489,
      limit: 500,
      status: "active",
    },
    {
      id: 3,
      code: "SPRING15",
      discount: "15%",
      validUntil: "2026-02-28",
      used: 756,
      limit: 2000,
      status: "active",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] px-6 py-8">
      <div className="max-w-7xl mx-auto">

  
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">
              Promo Codes
            </h1>
            <p className="text-gray-600 mt-1">
              Manage promotional offers and discounts
            </p>
          </div>

          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl shadow-md transition">
            <Plus size={18} />
            Create Promo Code
          </button>
        </div>

        {/* Promo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map((promo) => {
            const usagePercent = (promo.used / promo.limit) * 100;

            return (
              <div
                key={promo.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition"
              >
                {/* Top Section */}
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl text-lg tracking-wide">
                    {promo.code}
                  </div>

                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-medium capitalize">
                    {promo.status}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-semibold">
                      {promo.discount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Valid Until</span>
                    <span className="font-semibold">
                      {promo.validUntil}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Usage</span>
                    <span className="font-semibold">
                      {promo.used} / {promo.limit}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-6">
                  <button className="flex items-center justify-center gap-2 flex-1 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 py-2.5 rounded-xl font-medium transition">
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button className="flex items-center justify-center gap-2 flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium shadow-sm transition">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PromoCodes;