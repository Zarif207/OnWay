"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ otp: "", newPassword: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);

        const resetData = JSON.parse(localStorage.getItem("resetData"));

        if (!resetData) {
            toast.error("Session expired! Please try again.");
            router.push("/forgot-password");
            return;
        }

        if (formData.otp !== resetData.otp.toString()) {
            setLoading(false);
            return toast.error("Invalid OTP!");
        }

        const toastId = toast.loading("Updating password...");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger/update-password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resetData.email,
                    newPassword: formData.newPassword
                }),
            });

            const result = await response.json();

            if (result.success) {
                localStorage.removeItem("resetData");
                toast.success("Password Reset Successful! Please Login.", { id: toastId });
                router.push("/authPage");
            } else {
                toast.error(result.message || "Failed to reset password", { id: toastId });
            }
        } catch (error) {
            toast.error("Connection error! Try again.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border">
                <h2 className="text-2xl font-black mb-2 uppercase text-neutral">Set New Password</h2>
                <p className="text-gray-400 text-sm mb-6 font-medium">Enter the 6-digit code and your new password.</p>

                <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Verification Code</label>
                        <input
                            type="text"
                            placeholder="6-Digit OTP"
                            maxLength="6"
                            required
                            className="input input-bordered w-full h-14 rounded-2xl text-center font-black text-md tracking-widest focus:border-secondary"
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="input input-bordered w-full h-14 rounded-2xl focus:border-secondary"
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="btn btn-primary w-full h-14 rounded-2xl text-white uppercase font-black tracking-wider shadow-lg shadow-primary/20 mt-4 border-none"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;