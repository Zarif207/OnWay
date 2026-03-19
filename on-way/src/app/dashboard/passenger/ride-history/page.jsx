"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Search,
  Star,
  ChevronRight,
  ReceiptText,
  Download,
  MapPin,
  Clock,
  Calendar,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function RideHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRides();
    }
  }, [session]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/bookings?passengerId=${session.user.id}`);
      if (res.data.success) {
        setRides(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load ride history");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = (ride) => {
    try {
      setDownloadingId(ride._id);
      const doc = new jsPDF();

      doc.setFillColor(47, 202, 113); // OnWay Green
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("OnWay RIDE RECEIPT", 14, 25);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Invoice: INV-${ride._id.slice(-6).toUpperCase()}`, 14, 50);
      doc.text(`Date: ${new Date(ride.createdAt).toLocaleString()}`, 14, 55);

      const tableData = [
        ["From", ride.pickupLocation.address],
        ["To", ride.dropoffLocation.address],
        ["Vehicle", ride.vehicleType.toUpperCase()],
        ["Distance", `${ride.distance} KM`],
        ["Fare", `BDT ${ride.price}`],
        ["Status", ride.bookingStatus.toUpperCase()],
      ];

      autoTable(doc, {
        startY: 65,
        head: [["Description", "Detail"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [1, 25, 41] }, // Secondary color
      });

      doc.setFontSize(8);
      doc.text("Thank you for riding with OnWay!", 105, doc.lastAutoTable.finalY + 20, { align: 'center' });

      doc.save(`OnWay-Receipt-${ride._id.slice(-6)}.pdf`);
      toast.success("Receipt downloaded!");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredRides = rides.filter((ride) => {
    const term = searchTerm.toLowerCase();
    return (
      ride.pickupLocation.address.toLowerCase().includes(term) ||
      ride.dropoffLocation.address.toLowerCase().includes(term) ||
      ride.bookingStatus.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-[#011929]">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Ride History</h1>
          <p className="text-gray-400 font-medium">Manage and review your past journeys</p>
        </div>

        <div className="relative group w-full md:w-96">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search pickup, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={ride._id}
              className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col lg:flex-row justify-between gap-6 group"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${ride.bookingStatus === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                    <Car size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {new Date(ride.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="font-black text-secondary uppercase tracking-widest text-xs">ID: #{ride._id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-dashed border-gray-100 ml-5 py-1">
                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-blue-500 mt-1 shrink-0" />
                    <p className="text-sm font-bold text-secondary line-clamp-1">{ride.pickupLocation.address}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-[#2FCA71] mt-1 shrink-0" />
                    <p className="text-sm font-bold text-secondary line-clamp-1">{ride.dropoffLocation.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 md:gap-8 justify-between lg:justify-end border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-50">
                <div className="text-center md:text-right">
                  <p className="text-3xl font-black text-secondary tracking-tighter">৳{ride.price}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{ride.paymentMethod}</p>
                </div>

                <button
                  onClick={() => generateInvoice(ride)}
                  disabled={downloadingId === ride._id}
                  className="h-14 w-14 rounded-2xl bg-gray-50 text-secondary flex items-center justify-center hover:bg-secondary hover:text-white transition-all active:scale-90 shadow-sm"
                >
                  {downloadingId === ride._id ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                </button>

                <button
                  onClick={() => router.push(`/dashboard/passenger/active-ride?bookingId=${ride._id}`)}
                  className="px-6 py-4 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#011421] transition-all hover:translate-x-1"
                >
                  Details
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
              <Car size={40} />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No ride history found</p>
          </div>
        )}
      </div>
    </div>
  );
}