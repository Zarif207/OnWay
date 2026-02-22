"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const userExists = allUsers.find(u => u.email === email);

        if (!userExists) {
            setLoading(false);
            return toast.error("User not found with this email!");
        }

        const toastId = toast.loading("Sending OTP...");
        try {
            const generatedOTP = Math.floor(100000 + Math.random() * 900000);

            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: generatedOTP }),
            });

            if (response.ok) {
                localStorage.setItem("resetData", JSON.stringify({ email, otp: generatedOTP }));
                toast.success("Reset OTP sent to your email!", { id: toastId });
                router.push("/reset-password");
            }
        } catch (error) {
            toast.error("Failed to send OTP!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border">
                <h2 className="text-2xl font-black mb-2 uppercase">Forgot Password?</h2>
                <p className="text-gray-500 text-sm mb-6">Enter email to get reset code.</p>
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <input
                        type="email"
                        required
                        placeholder="Your Email"
                        className="input input-bordered w-full rounded-2xl"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button disabled={loading} className="btn btn-primary w-full rounded-2xl text-white uppercase font-bold">
                        {loading ? "Sending..." : "Send Reset Code"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;