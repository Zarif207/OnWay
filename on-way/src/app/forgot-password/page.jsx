
"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

const ForgotPasswordContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const emailFromQuery = searchParams.get('email') || "";

    const [email, setEmail] = useState(emailFromQuery);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (emailFromQuery) {
            setEmail(emailFromQuery);
        }
    }, [emailFromQuery]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Checking user...");

        try {
            const checkUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger/find?email=${email}`);

            if (!checkUser.ok) {
                toast.error("User not found with this email!", { id: toastId });
                setLoading(false);
                return;
            }

            toast.loading("Sending OTP to your email...", { id: toastId });

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
            } else {
                throw new Error("Failed to send OTP");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again!", { id: toastId });
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
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold">Your Email</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            placeholder="Enter your email"
                            className="input input-bordered w-full rounded-2xl focus:border-primary"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full rounded-2xl text-white uppercase font-bold mt-2"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : "Send Reset Code"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => router.back()} className="text-sm font-bold text-gray-400 hover:text-primary transition-all">
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ForgotPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}