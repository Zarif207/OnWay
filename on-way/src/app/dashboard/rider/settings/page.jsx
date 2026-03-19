"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import {
    Settings,
    Lock,
    Bell,
    Eye,
    EyeOff,
    Globe,
    Moon,
    Sun,
    Save,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const riderId = session?.user?.id;

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Preferences State
    const [preferences, setPreferences] = useState({
        language: "English",
        darkMode: false,
        notifications: {
            rideUpdates: true,
            payments: true,
            bonuses: true,
            system: true
        }
    });
    const [hasUnsavedPrefs, setHasUnsavedPrefs] = useState(false);

    // 1. Fetch Existing Preferences
    const { data: profileData, isLoading } = useQuery({
        queryKey: ["riderSettings", riderId],
        queryFn: async () => {
            if (!riderId) return null;
            const res = await axios.get(`${API_BASE_URL}/riders/${riderId}`);
            return res.data.data;
        },
        enabled: !!riderId,
    });

    useEffect(() => {
        if (profileData && profileData.preferences) {
            setPreferences({
                language: profileData.preferences.language || "English",
                darkMode: profileData.preferences.darkMode || false,
                notifications: {
                    rideUpdates: profileData.preferences.notifications?.rideUpdates ?? true,
                    payments: profileData.preferences.notifications?.payments ?? true,
                    bonuses: profileData.preferences.notifications?.bonuses ?? true,
                    system: profileData.preferences.notifications?.system ?? true
                }
            });
            setHasUnsavedPrefs(false);
        }
    }, [profileData]);

    // 2. Password Mutation
    const updatePasswordMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axios.put(`${API_BASE_URL}/riders/${riderId}/password`, payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Password successfully updated.");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (err) => {
            const msg = err.response?.data?.message || "Failed to update password.";
            toast.error(msg);
        }
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }
        updatePasswordMutation.mutate({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
    };

    const isPasswordValid = passwordData.currentPassword &&
        passwordData.newPassword.length >= 6 &&
        passwordData.newPassword === passwordData.confirmPassword;

    // 3. Preferences Mutation
    const updatePreferencesMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axios.patch(`${API_BASE_URL}/riders/${riderId}`, { preferences: payload });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Preferences updated.");
            queryClient.invalidateQueries(["riderSettings", riderId]);
            setHasUnsavedPrefs(false);
        },
        onError: () => {
            toast.error("Failed to save preferences.");
        }
    });

    const handlePrefChange = (category, field, value) => {
        setHasUnsavedPrefs(true);
        if (category === "notifications") {
            setPreferences(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [field]: value
                }
            }));
        } else {
            setPreferences(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSavePrefs = () => {
        updatePreferencesMutation.mutate(preferences);
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 pb-24 pt-4 px-2 xl:px-0">
            {/* Header section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-12 bg-primary rounded-full" />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">Configuration</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-secondary">
                        Settings
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                        Security and Application Preferences
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Security / Password Card */}
                <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                        <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                            <Lock size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-secondary tracking-tight">Account Security</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Change your password</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword.current ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full h-14 pl-5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Enter current password"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full h-14 pl-5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Min. 6 characters"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full h-14 pl-5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Retype new password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!isPasswordValid || updatePasswordMutation.isPending}
                            className={`w-full h-14 mt-4 rounded-xl font-black uppercase tracking-widest transition-all
                                ${isPasswordValid
                                    ? "bg-secondary hover:bg-secondary/90 text-white active:scale-[0.98]"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                            `}
                        >
                            {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </section>

                <div className="space-y-8">
                    {/* Notification Preferences */}
                    <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-secondary tracking-tight">Notifications</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Alert Preferences</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'rideUpdates', label: 'Ride Updates', desc: 'Alerts for new requests & statuses' },
                                { id: 'payments', label: 'Payments', desc: 'Wallet credits & withdrawal logs' },
                                { id: 'bonuses', label: 'Bonuses', desc: 'Tier progression and quests' },
                                { id: 'system', label: 'Admin Messages', desc: 'Critical system maintenance' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between group">
                                    <div className="space-y-1 pr-4">
                                        <p className="text-sm font-bold text-secondary">{item.label}</p>
                                        <p className="text-xs font-medium text-gray-400">{item.desc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handlePrefChange("notifications", item.id, !preferences.notifications[item.id])}
                                        className={`shrink-0 relative h-7 w-12 rounded-full transition-colors duration-300 ease-in-out pl-1 pr-1
                                            ${preferences.notifications[item.id] ? "bg-primary" : "bg-gray-200"}`}
                                    >
                                        <motion.div
                                            layout
                                            className={`h-5 w-5 bg-white rounded-full shadow-sm`}
                                            initial={false}
                                            animate={{ x: preferences.notifications[item.id] ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Application Settings (Lang + Mode) */}
                    <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-secondary tracking-tight">App Preferences</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Language & Appearance</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Language */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Display Language</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handlePrefChange(null, "language", "English")}
                                        className={`h-12 rounded-xl border text-sm font-bold transition-all
                                            ${preferences.language === "English"
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => handlePrefChange(null, "language", "Bangla")}
                                        className={`h-12 rounded-xl border text-sm font-bold transition-all
                                            ${preferences.language === "Bangla"
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        বাংলা
                                    </button>
                                </div>
                            </div>

                            {/* Dark Mode */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {preferences.darkMode ? <Moon size={16} className="text-gray-600" /> : <Sun size={16} className="text-amber-500" />}
                                        <p className="text-sm font-bold text-secondary">Dark Mode</p>
                                    </div>
                                    <p className="text-xs font-medium text-gray-400">Match native system theme</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handlePrefChange(null, "darkMode", !preferences.darkMode)}
                                    className={`shrink-0 relative h-7 w-12 rounded-full transition-colors duration-300 ease-in-out pl-1 pr-1
                                        ${preferences.darkMode ? "bg-gray-800" : "bg-gray-200"}`}
                                >
                                    <motion.div
                                        layout
                                        className={`h-5 w-5 bg-white rounded-full shadow-sm`}
                                        initial={false}
                                        animate={{ x: preferences.darkMode ? 20 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Save Preferences Action */}
                        <div className="pt-4">
                            <button
                                onClick={handleSavePrefs}
                                disabled={!hasUnsavedPrefs || updatePreferencesMutation.isPending}
                                className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${hasUnsavedPrefs
                                        ? "bg-primary hover:bg-primary-dark text-white active:scale-[0.98] shadow-lg shadow-primary/20"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                                `}
                            >
                                {updatePreferencesMutation.isPending ? (
                                    <><Loader2 size={18} className="animate-spin" /> Saving</>
                                ) : (
                                    <><Save size={18} /> Apply Preferences</>
                                )}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
