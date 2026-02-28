"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Car,
  User,
  Navigation2,
  Download,
  AlertCircle,
  Search
} from "lucide-react";
import OnWayLoading from "@/app/components/Loading/page";

// Correct import method for PDF.js and autoTable

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RideHistoryPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = "http://localhost:4000/api";

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
      setTimeout(() => {
        setLoading(false);
      }, 2000); // 2000ms = 2 seconds
    }
  };

  // Updated PDF generation function with error handling and better formatting
  const generateInvoice = (ride) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // Slate-800
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

      //Use the autoTable function directly (Error Fix)

      autoTable(doc, {
        startY: 45,
        head: [["Description", "Details"]],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229], // Indigo-600
          fontSize: 11,
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 5,
          fontSize: 10,
          font: "helvetica"
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' }
        }
      });

      // Footer
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Thank you for choosing our service!", 14, finalY + 15);

      // Download
      doc.save(`Invoice_${ride._id.slice(-6)}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("There was a problem creating the invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredRides = rides.filter(ride =>
    ride.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.dropLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <OnWayLoading />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Ride History</h1>
            <p className="text-slate-500 mt-2 font-medium">Detailed report of all your rides</p>
          </div>

          <div className="relative group">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by destination…"
              className="input input-bordered bg-white border-slate-200 pl-10 rounded-2xl w-full md:w-80 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Rides</p>
              <h2 className="text-3xl font-black text-slate-800">{rides.length}</h2>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-500"><Car /></div>
          </div>
          <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-between text-white">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Total Spent</p>
              <h2 className="text-3xl font-black">৳ {rides.reduce((acc, r) => acc + (Number(r.fare) || 0), 0)}</h2>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl"><Navigation2 /></div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500">
                  <th className="py-6 pl-10 font-bold uppercase text-[10px] tracking-widest">Date</th>
                  <th className="font-bold uppercase text-[10px] tracking-widest">Route</th>
                  <th className="font-bold uppercase text-[10px] tracking-widest">Fare</th>
                  <th className="text-right pr-10 font-bold uppercase text-[10px] tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRides.map((ride) => (
                  <tr key={ride._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="pl-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex flex-col items-center justify-center font-bold text-slate-600">
                          <span className="text-[9px] uppercase">{new Date(ride.createdAt).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-sm leading-none">{new Date(ride.createdAt).getDate()}</span>
                        </div>
                        <Calendar className="w-4 h-4 text-slate-300" />
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col max-w-62.5">
                        <span className="text-sm font-bold text-slate-700 truncate">{ride.pickupLocation}</span>
                        <div className="h-2 border-l border-dotted border-slate-300 ml-1.5 my-0.5"></div>
                        <span className="text-sm font-medium text-slate-400 truncate">{ride.dropLocation}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-lg font-black text-slate-800">৳{ride.fare}</span>
                    </td>
                    <td className="text-right pr-10">
                      <button
                        onClick={() => {
                          setDownloadingId(ride._id);
                          generateInvoice(ride);
                        }}
                        disabled={downloadingId === ride._id}
                        className={`btn btn-sm h-10 px-5 rounded-xl border-none font-bold transition-all shadow-sm ${downloadingId === ride._id
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-slate-900 text-white hover:bg-indigo-600'
                          }`}
                      >
                        {downloadingId === ride._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <div className="flex items-center gap-2">
                            Download <Download className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}