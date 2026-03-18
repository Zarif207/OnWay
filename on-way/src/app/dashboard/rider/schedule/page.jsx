"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarRange, Clock, Power, ShieldAlert, CheckCircle2, AlertCircle, Save, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulePage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const driverId = session?.user?.id;

    // Local State for Form
    const [selectedDays, setSelectedDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    const [workingHours, setWorkingHours] = useState({ start: "09:00", end: "17:00" });
    const [isVacation, setIsVacation] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch Schedule Data
    const { data: scheduleData, isLoading, isError } = useQuery({
        queryKey: ["driverSchedule", driverId],
        queryFn: async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/riders/schedule?driverId=${driverId}`);
                if (res.data && res.data.success === false) {
                    console.warn("Schedule API notice:", res.data.message);
                    return { workingDays: [], workingHours: { start: "09:00", end: "17:00" }, vacationMode: false };
                }
                return res.data.data;
            } catch (error) {
                // If the error is a 404 (e.g., rider not found / no schedule yet), fail gracefully
                if (error.response && error.response.status === 404) {
                    console.warn("Schedule API notice:", error.response.data?.message || "Rider not found");
                    return { workingDays: [], workingHours: { start: "09:00", end: "17:00" }, vacationMode: false };
                }
                // For other catastrophic network errors, actually throw
                console.error("Critical error fetching schedule:", error);
                throw error;
            }
        },
        enabled: !!driverId,
    });

    // Populate local state on fetch
    useEffect(() => {
        if (scheduleData) {
            setSelectedDays(scheduleData.workingDays || []);
            if (scheduleData.workingHours) {
                setWorkingHours({
                    start: scheduleData.workingHours.start || "09:00",
                    end: scheduleData.workingHours.end || "17:00"
                });
            }
            setIsVacation(scheduleData.vacationMode || false);
            setHasUnsavedChanges(false);
        }
    }, [scheduleData]);

    // Mutation to Update Schedule
    const updateScheduleMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/riders/schedule`, payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Schedule successfully updated.");
            queryClient.invalidateQueries(["driverSchedule", driverId]);
            setHasUnsavedChanges(false);
        },
        onError: () => {
            toast.error("Failed to update schedule. Please try again.");
        }
    });

    const handleDayToggle = (day) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
        setHasUnsavedChanges(true);
    };

    const handleTimeChange = (field, value) => {
        setWorkingHours(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleVacationToggle = () => {
        setIsVacation(prev => !prev);
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        if (!driverId) return;

        // Basic Validation
        if (!isVacation && selectedDays.length === 0) {
            toast.error("Please select at least one working day unless on vacation.");
            return;
        }

        if (workingHours.end <= workingHours.start) {
            toast.error("End time must be securely after start time.");
            return;
        }

        updateScheduleMutation.mutate({
            driverId,
            workingDays: selectedDays,
            workingHours,
            vacationMode: isVacation
        });
    };

    // Derived Status Color logic
    const getStatusIndicator = () => {
        if (isVacation) return { label: "On Vacation", color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200", icon: ShieldAlert };
        if (selectedDays.length === 0) return { label: "Offline", color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200", icon: Power };
        return { label: "Available", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", icon: CheckCircle2 };
    };

    const currentStatus = getStatusIndicator();

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="h-16 w-16 text-red-500" />
                <h3 className="text-xl font-bold text-secondary">Failed to establish connection.</h3>
                <p className="text-gray-500">Could not retrieve the remote dispatch schedule at this time.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 pb-24 pt-4 px-2 xl:px-0">
            {/* Header / Page Title */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-12 bg-primary rounded-full" />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">Dispatch Management</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-secondary">
                        Driver <span className="text-primary">Schedule</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                        Configure Your Operational Availability
                    </p>
                </div>

                {/* Status Indicator Badge */}
                <div className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] border ${currentStatus.border} ${currentStatus.bg} transition-all`}>
                    <div className={`h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm`}>
                        <currentStatus.icon size={20} className={currentStatus.color} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Current Status</p>
                        <p className={`text-sm font-black uppercase tracking-widest ${currentStatus.color}`}>
                            {currentStatus.label}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Config Column */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Working Days Selector */}
                    <section className={`bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 transition-opacity duration-300 ${isVacation ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <CalendarRange size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-secondary tracking-tight">Working Days</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Select your active dispatch days</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {DAYS_OF_WEEK.map((day) => {
                                const isSelected = selectedDays.includes(day);
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDayToggle(day)}
                                        className={`relative h-24 rounded-[1.5rem] border flex items-center justify-center transition-all overflow-hidden group
                                            ${isSelected
                                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20"
                                                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-white"
                                            }`}
                                    >
                                        <span className={`text-sm font-black uppercase tracking-widest z-10 transition-colors ${isSelected ? "text-white" : "text-gray-600 group-hover:text-secondary"}`}>
                                            {day.substring(0, 3)}
                                        </span>
                                        {/* Background micro-interaction */}
                                        {isSelected && (
                                            <motion.div
                                                className="absolute inset-0 bg-white opacity-10"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1.5 }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Working Hours Settings */}
                    <section className={`bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 transition-opacity duration-300 ${isVacation ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-secondary tracking-tight">Operating Hours</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Define your daily active window</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Start Time */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Start Time</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={workingHours.start}
                                        onChange={(e) => handleTimeChange("start", e.target.value)}
                                        className="w-full h-16 px-6 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-black text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* End Time */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">End Time</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={workingHours.end}
                                        onChange={(e) => handleTimeChange("end", e.target.value)}
                                        className="w-full h-16 px-6 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-black text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Side Settings */}
                <div className="space-y-10">
                    {/* Vacation Mode Toggle */}
                    <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-grow">
                                <div className="flex items-center gap-3 text-yellow-600">
                                    <ShieldAlert size={20} />
                                    <h3 className="text-lg font-black tracking-tight text-secondary">Vacation Mode</h3>
                                </div>
                                <p className="text-xs font-bold text-gray-400 leading-relaxed">
                                    When enabled, you will temporarily pause all incoming ride requests and appear entirely offline in the system.
                                </p>
                            </div>

                            {/* Custom Toggle Switch */}
                            <button
                                onClick={handleVacationToggle}
                                className={`relative w-20 h-10 flex items-center rounded-full transition-colors shrink-0 ${isVacation ? 'bg-yellow-500' : 'bg-gray-200'}`}
                            >
                                <motion.div
                                    className="w-8 h-8 bg-white rounded-full shadow-md ml-1"
                                    animate={{
                                        x: isVacation ? 40 : 0
                                    }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>
                    </section>

                    {/* Action Card */}
                    <section className="bg-primary/5 p-10 rounded-[3rem] border border-primary/20 shadow-sm flex flex-col items-center text-center space-y-6">
                        <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                            <Save className="text-primary" size={28} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight text-secondary">Save Configuration</h3>
                            <p className="text-xs font-bold text-gray-500 px-4">
                                Update the global dispatch ledger with your chosen operational constraints.
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={updateScheduleMutation.isPending || (!hasUnsavedChanges)}
                            className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                                ${hasUnsavedChanges
                                    ? "bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/30 active:scale-95"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }
                            `}
                        >
                            {updateScheduleMutation.isPending ? (
                                <><Loader2 className="animate-spin" /> Saving</>
                            ) : (
                                "Apply Settings"
                            )}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
