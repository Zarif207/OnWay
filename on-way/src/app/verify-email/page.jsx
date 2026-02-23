"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [tempUser, setTempUser] = useState(null);
    const inputRefs = useRef([]);
    const router = useRouter();

    useEffect(() => {
        const storedData = localStorage.getItem("tempUser");
        if (!storedData) {
            toast.error("No pending registration found!");
            router.push("/register");
        } else {
            setTempUser(JSON.parse(storedData));
        }
    }, [router]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const enteredOtp = otp.join("");
        if (enteredOtp.length < 6) return toast.error("Enter 6 digits");

        setLoading(true);
        const toastId = toast.loading("Verifying...");

        try {
            if (parseInt(enteredOtp) === tempUser.otp) {

                const existingUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
                const newUser = { ...tempUser };
                delete newUser.otp;
                existingUsers.push(newUser);

                localStorage.setItem("allUsers", JSON.stringify(existingUsers));

                toast.success("Registration Successful!", { id: toastId });
                localStorage.removeItem("tempUser");
                router.push("/login");
            } else {
                toast.error("Invalid OTP!", { id: toastId });
            }
        } catch (error) {
            toast.error("Error occurred!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white shadow-2xl rounded-[2.5rem] p-8 lg:p-12 border border-gray-100">

                <button
                    onClick={() => router.push('/register')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors mb-8"
                >
                    <FaArrowLeft /> BACK TO REGISTER
                </button>

                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <FaShieldAlt size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-neutral uppercase tracking-tight">Verify Email</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        We've sent a 6-digit code to <br />
                        <span className="text-neutral font-bold">{tempUser?.email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                ref={(el) => (inputRefs.current[index] = el)}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-base-100 border-2 border-gray-100 rounded-2xl focus:border-primary focus:outline-none transition-all text-neutral"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full border-none text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs h-14"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : "Verify & Complete"}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-gray-400">
                    didn't receive the code?
                    <button
                        onClick={() => window.location.reload()}
                        className="text-secondary font-bold ml-1 hover:underline"
                    >
                        Resend Code
                    </button>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;