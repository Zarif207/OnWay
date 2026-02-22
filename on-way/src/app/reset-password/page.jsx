"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ otp: "", newPassword: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReset = (e) => {
        e.preventDefault();
        setLoading(true);

        const resetData = JSON.parse(localStorage.getItem("resetData"));

        if (parseInt(formData.otp) !== resetData.otp) {
            setLoading(false);
            return toast.error("Invalid OTP!");
        }

        const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const updatedUsers = allUsers.map(u => {
            if (u.email === resetData.email) {
                return { ...u, password: formData.newPassword };
            }
            return u;
        });

        localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
        localStorage.removeItem("resetData");

        toast.success("Password Reset Successful! Please Login.");
        router.push("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border">
                <h2 className="text-2xl font-black mb-2 uppercase">Set New Password</h2>
                <form onSubmit={handleReset} className="space-y-4">
                    <input
                        type="text"
                        placeholder="6-Digit OTP"
                        maxLength="6"
                        required
                        className="input input-bordered w-full rounded-2xl text-center font-bold"
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        required
                        className="input input-bordered w-full rounded-2xl"
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                    <button disabled={loading} className="btn btn-secondary w-full rounded-2xl text-white uppercase font-bold">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;