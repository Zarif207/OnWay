"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Car,
  User,
  Navigation2,
  Download,
  AlertCircle,
  Search,
  Star,
  X,
  MapPin
} from "lucide-react";
import OnWayLoading from "@/app/components/Loading/page";
import AddReviewForm from "../addReviewForm/addReviewForm"; // Review form component

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RideHistoryPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRide, setSelectedRide] = useState(null); // Review modal state

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/rides`);
      const data = await res.json();
      if (res.ok) {
        setRides(data.data || []);
      } else {
        throw new Error("Failed to fetch rides");
      }
    } catch (err) {
      setError("Failed to fetch ride history");
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  // --- SINGLE RIDE INVOICE GENERATOR ---
  const generateInvoice = (ride) => {
    try {
      setDownloadingId(ride._id);
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text("RIDE INVOICE", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice No: INV-${ride._id.slice(-6).toUpperCase()}`, 14, 30);
      doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 14, 36);

      const tableData = [
        ["Pickup Location", ride.pickupLocation],
        ["Drop Location", ride.dropLocation],
        ["Driver ID", ride.driverId?.slice(-6).toUpperCase() || "N/A"],
        ["Ride Date", new Date(ride.createdAt).toLocaleDateString()],
        ["Status", ride.status || "Completed"],
        ["Total Fare", `BDT ${ride.fare}`],
      ];

      autoTable(doc, {
        startY: 45,
        head: [["Description", "Details"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontSize: 11, fontStyle: 'bold' },
        styles: { cellPadding: 5, fontSize: 10, font: "helvetica" },
        columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } }
      });

      doc.save(`Invoice_${ride._id.slice(-6)}.pdf`);
    } catch (err) {
      alert("Problem creating invoice.");
    } finally {
      setDownloadingId(null);
    }
  };

  // --- FULL HISTORY GENERATOR ---
  const downloadFullHistoryPDF = () => {
    try {
      setDownloadingId("all");
      const doc = new jsPDF();
      doc.text("RIDE HISTORY REPORT", 14, 22);

      const tableData = rides.map((ride) => [
        new Date(ride.createdAt).toLocaleDateString(),
        ride.pickupLocation,
        ride.dropLocation,
        ride.status || "Completed",
        `BDT ${ride.fare}`
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Date", "Pickup", "Drop", "Status", "Fare"]],
        body: tableData,
      });

      doc.save("Ride_History_Full_Report.pdf");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredRides = rides.filter(
    (ride) =>
      ride?.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride?.dropLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <OnWayLoading />;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Ride History</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage and review your past travels</p>
          </div>

          <div className="relative group">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search destination..."
              className="input input-bordered bg-white border-slate-200 pl-10 rounded-2xl w-full md:w-80 outline-none focus:ring-4 focus:ring-indigo-50"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Download All Action Card */}
        <div className="bg-primary/50 p-8 rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-between text-white mb-8">
          <div>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Export Data</p>
            <h2 className="text-2xl font-black">Full Ride Report</h2>
          </div>
          <button
            onClick={downloadFullHistoryPDF}
            disabled={downloadingId === "all"}
            className="btn bg-primary text-accent px-6 py-3 rounded-2xl font-bold transition-all border-none"
          >
            {downloadingId === "all" ? "Generating..." : "Download History (PDF)"}
          </button>
        </div>

        {/* Rides Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="py-5 pl-8 text-xs font-bold uppercase tracking-wider">Date</th>
                  <th className="text-xs font-bold uppercase tracking-wider">Trip Details</th>
                  <th className="text-xs font-bold uppercase tracking-wider">Fare</th>
                  <th className="text-xs font-bold uppercase tracking-wider text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRides.map((ride) => (
                  <tr key={ride._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="pl-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center font-bold text-indigo-600">
                          <span className="text-[10px] uppercase">{new Date(ride.createdAt).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-base">{new Date(ride.createdAt).getDate()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-400" />
                          <span className="text-sm font-bold text-slate-700 truncate max-w-50">{ride.pickupLocation}</span>
                        </div>
                        <div className="h-4 border-l-2 border-dotted border-slate-200 ml-0.75 my-1" />
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-slate-500 truncate max-w-50">{ride.dropLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-lg font-black text-slate-800">৳{ride.fare}</span>
                    </td>
                    <td className="pr-8">
                      <div className="flex items-center justify-end gap-3">
                        {/* Review Button */}
                        {!ride.rating ? (
                          <button
                            onClick={() => setSelectedRide(ride)}
                            className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-xl transition-colors"
                            title="Rate Driver"
                          >
                            <Star className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                            {ride.rating} <Star className="w-4 h-4 fill-current" />
                          </div>
                        )}

                        {/* Single Receipt Download */}
                        <button
                          onClick={() => generateInvoice(ride)}
                          disabled={downloadingId === ride._id}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                        >
                          <Download className="w-4 h-4" />
                          {downloadingId === ride._id ? "..." : "Invoice"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- REVIEW MODAL --- */}
        {selectedRide && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRide(null)} />
            <div className="relative z-10 w-full max-w-md">
              <button
                onClick={() => setSelectedRide(null)}
                className="absolute top-5 right-5 text-white flex items-center gap-2 font-medium hover:text-indigo-300"
              >
                <X className="w-6 h-6" /> Close
              </button>
              <AddReviewForm
                rideId={selectedRide.id || selectedRide._id}
                driverId={selectedRide.driverId}
                passengerId={selectedRide.passengerId}
                onSuccess={() => {
                  setSelectedRide(null);
                  fetchRides(); // UI refresh to show rating
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}