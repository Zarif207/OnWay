"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Search,
  Star,
  ChevronRight,
  ReceiptText,
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";
import OnWayLoading from "@/app/components/Loading/page";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RideHistoryPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const router = useRouter();
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/rides`);
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to fetch rides");

      setRides(data?.data || []);
    } catch (err) {
      setError("Failed to load ride history");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Location Formatter ----------
  const formatLocation = (loc) => {
    if (!loc) return "N/A";
    if (typeof loc === "string") return loc;
    if (typeof loc === "object") {
      return (
        loc.address ||
        `Lat: ${loc?.coordinates?.[1]}, Lng: ${loc?.coordinates?.[0]}`
      );
    }
    return "Unknown";
  };

  // ---------- Single Invoice ----------
  const generateInvoice = (ride) => {
    try {
      setDownloadingId(ride._id);
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("RIDE RECEIPT", 14, 20);

      const tableData = [
        ["Invoice ID", `INV-${ride._id.slice(-6).toUpperCase()}`],
        ["Date", new Date(ride.createdAt).toLocaleDateString()],
        ["Pickup", formatLocation(ride.pickupLocation)],
        ["Dropoff", formatLocation(ride.dropLocation)],
        ["Fare", `BDT ${ride.fare}`],
        ["Status", ride.status || "Completed"],
      ];

      autoTable(doc, {
        startY: 30,
        head: [["Field", "Details"]],
        body: tableData,
        theme: "striped",
      });

      doc.save(`Receipt-${ride._id.slice(-6)}.pdf`);
    } finally {
      setDownloadingId(null);
    }
  };

  // ---------- Full History PDF ----------
  const downloadFullHistoryPDF = () => {
    try {
      setDownloadingId("all");
      const doc = new jsPDF();
      doc.text("RIDE HISTORY REPORT", 14, 20);

      const tableData = rides.map((ride) => [
        new Date(ride.createdAt).toLocaleDateString(),
        formatLocation(ride.pickupLocation),
        formatLocation(ride.dropLocation),
        ride.status || "Completed",
        `BDT ${ride.fare}`,
      ]);

      autoTable(doc, {
        startY: 30,
        head: [["Date", "Pickup", "Drop", "Status", "Fare"]],
        body: tableData,
      });

      doc.save("Ride_History_Report.pdf");
    } finally {
      setDownloadingId(null);
    }
  };

  // ---------- Filter ----------
  const filteredRides = rides.filter((ride) => {
    const term = searchTerm.toLowerCase();
    return (
      formatLocation(ride.pickupLocation)
        .toLowerCase()
        .includes(term) ||
      formatLocation(ride.dropLocation)
        .toLowerCase()
        .includes(term)
    );
  });

  if (loading) return <OnWayLoading />;

  if (error)
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900">
              Ride History
            </h1>
            <p className="text-slate-400 mt-1">
              Review and manage your previous trips
            </p>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by location..."
              className="bg-white border border-slate-200 pl-12 pr-6 py-4 rounded-3xl w-full md:w-96 focus:ring-4 focus:ring-blue-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Full History Download */}
        <div className="flex justify-end mb-8">
          <button
            onClick={downloadFullHistoryPDF}
            disabled={downloadingId === "all"}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold"
          >
            <Download className="w-4 h-4" />
            {downloadingId === "all" ? "Generating..." : "Download Full Report"}
          </button>
        </div>

        {/* Ride Cards */}
        <div className="space-y-6">
          {filteredRides.length > 0 ? (
            filteredRides.map((ride) => (
              <div
                key={ride._id}
                className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between gap-6"
              >
                <div>
                  <p className="font-bold text-slate-700">
                    {formatLocation(ride.pickupLocation)}
                  </p>
                  <p className="text-slate-400">
                    {formatLocation(ride.dropLocation)}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(ride.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <span className="px-5 py-2 bg-slate-900 text-white rounded-2xl font-bold">
                    ৳{ride.fare}
                  </span>

                  <button
                    onClick={() => generateInvoice(ride)}
                    disabled={downloadingId === ride._id}
                    className="p-3 bg-slate-100 rounded-xl"
                  >
                    <ReceiptText className="w-5 h-5" />
                  </button>

                  {!ride.rating ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/review?rideId=${ride._id}&driverId=${ride.driverId}`
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold"
                    >
                      <Star className="w-4 h-4 fill-amber-600" />
                      Rate
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                      {ride.rating}
                      <Star className="w-4 h-4 fill-emerald-600" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
              <Car className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">
                No ride history found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}