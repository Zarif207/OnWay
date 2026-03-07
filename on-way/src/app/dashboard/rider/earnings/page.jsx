"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    TrendingUp,
    DollarSign,
    PieChart as PieChartIcon,
    Gift,
    Wallet,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    AlertCircle
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "@/utils/socket";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const EarningsAnalytics = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const riderId = session?.user?.id;
    const [period, setPeriod] = useState("weekly");

    // 1. Fetch Earnings Data
    const { data: earningsData, isLoading, isError, error } = useQuery({
        queryKey: ["riderEarnings", riderId, period],
        queryFn: async () => {
            if (!riderId) return null;
            const res = await axios.get(`${API_BASE_URL}/riders/earnings?period=${period}&driverId=${riderId}`);
            return res.data.data;
        },
        enabled: !!riderId,
    });

    // 2. Fetch Balance Data
    const { data: balanceData } = useQuery({
        queryKey: ["riderBalance", riderId],
        queryFn: async () => {
            if (!riderId) return null;
            const res = await axios.get(`${API_BASE_URL}/riders/balance?driverId=${riderId}`);
            return res.data.data;
        },
        enabled: !!riderId,
    });

    // 3. Socket.io Real-time Balance
    useEffect(() => {
        if (!riderId) return;
        const socket = getSocket();

        socket.on("balance_update", (data) => {
            if (data.driverId === riderId) {
                queryClient.setQueryData(["riderBalance", riderId], (old) => ({
                    ...old,
                    availableBalance: data.newBalance
                }));
                toast.success("Wallet Synchronized", {
                    icon: '💰',
                    style: { borderRadius: '15px', background: '#011421', color: '#fff' }
                });
            }
        });

        return () => {
            socket.off("balance_update");
        };
    }, [riderId, queryClient]);

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

    const pieData = useMemo(() => {
        if (!earningsData) return [];
        return [
            { name: "Base Pay", value: earningsData.earnings.reduce((s, e) => s + (e.baseEarnings || 0), 0) },
            { name: "Commission", value: earningsData.totalCommission || 0 },
            { name: "Bonus", value: earningsData.totalBonus || 0 }
        ];
    }, [earningsData]);

    const exportCSV = () => {
        if (!earningsData?.earnings) return;
        const headers = ["Date", "Rides", "Base Earnings", "Commission", "Net Earnings"];
        const rows = earningsData.earnings.map(e => [
            e.date, e.rides, e.baseEarnings, e.commission, e.netEarnings
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `earnings_${period}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 pt-4">
            {/* Header & Period Selector */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-8 bg-primary rounded-full" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Financial Center</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-[#011421]">
                        Earnings <span className="text-primary">Analytics</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        Real-time Revenue Monitor <TrendingUp size={14} className="text-primary" />
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-[#f5f7fa] p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                    {["daily", "weekly", "monthly"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${period === p
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "text-gray-500 hover:text-[#011421] hover:bg-white border border-transparent shadow-none"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:col-span-1">
                    <MetricCard
                        icon={<DollarSign className="text-primary" />}
                        title="Total Revenue"
                        value={`৳${earningsData?.earnings?.reduce((s, e) => s + (e.netEarnings || 0), 0).toLocaleString() || "0"}`}
                        trend="+12.5%"
                    />
                    <MetricCard
                        icon={<Wallet className="text-[#011421]" />}
                        title="Available Balance"
                        value={`৳${balanceData?.availableBalance?.toLocaleString() || "0"}`}
                        isLive
                    />
                    <MetricCard
                        icon={<Gift className="text-yellow-500" />}
                        title="Bonus Earned"
                        value={`৳${earningsData?.totalBonus?.toLocaleString() || "0"}`}
                    />
                </div>

                {/* Chart Area */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-[450px]"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-[#011421] tracking-tight">Revenue Trajectory</h3>
                            <button
                                onClick={exportCSV}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={earningsData?.earnings || []}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#259461" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#259461" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                                        tickFormatter={(v) => `৳${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6', borderRadius: '15px', padding: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#011421', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="netEarnings"
                                        stroke="#259461"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorEarnings)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Commission Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm"
                >
                    <h3 className="text-2xl font-black text-[#011421] tracking-tight mb-8">Payout Composition</h3>
                    <div className="h-[300px] w-full flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="40%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#259461', '#f59e0b', '#011421'][index % 3]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6' }} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Detailed Table */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
                >
                    <h3 className="text-2xl font-black text-[#011421] tracking-tight mb-8 text-center lg:text-left">Earnings Ledger</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
                                    <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Rides</th>
                                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Net Pay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(earningsData?.earnings || []).map((row, i) => (
                                    <tr key={i} className="group hover:bg-gray-50 border-b border-gray-50 transition-colors">
                                        <td className="py-5 font-bold text-sm text-[#011421] flex items-center gap-3">
                                            <Calendar size={14} className="text-primary" /> {row.date}
                                        </td>
                                        <td className="py-5 text-center font-black text-gray-500">{row.rides}</td>
                                        <td className="py-5 text-right font-black text-primary text-lg">৳{row.netEarnings.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!earningsData?.earnings || earningsData.earnings.length === 0) && (
                            <div className="py-20 text-center space-y-4">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="text-gray-300" size={32} />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">No Mission Logs Found</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, title, value, trend, isLive }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group transition-all hover:shadow-md hover:border-primary/20"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 transition-all text-primary">
                {icon}
            </div>
            {trend && (
                <span className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                    <ArrowUpRight size={12} /> {trend}
                </span>
            )}
            {isLive && (
                <span className="flex items-center gap-1.5 text-[8px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full animate-pulse tracking-widest uppercase">
                    <div className="h-2 w-2 rounded-full bg-primary" /> Live
                </span>
            )}
        </div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h4 className="text-3xl font-black text-[#011421] tracking-tighter">{value}</h4>
    </motion.div>
);

export default EarningsAnalytics;
