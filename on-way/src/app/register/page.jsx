
"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUsers } from '@/hooks/useUsers';
import { useSession } from 'next-auth/react';

const Register = () => {
    const { data: session, status } = useSession();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { findUser } = useUsers();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading("Checking details...");
        try {
            const userExists = await findUser(data.email);

            if (userExists) {
                toast.error("Email already registered! Please login.", { id: toastId });
                setLoading(false);
                return;
            }

            const generatedOTP = Math.floor(100000 + Math.random() * 900000);

            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, otp: generatedOTP }),
            });

            if (response.ok) {
                localStorage.setItem("tempUser", JSON.stringify({ ...data, otp: generatedOTP }));
                toast.success("OTP Sent to Email!", { id: toastId });
                router.push("/verify-email");
            } else {
                throw new Error("Failed to send OTP");
            }
        } catch (error) {
            toast.error(error.message || "Error sending OTP", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center bg-white">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>;
    }

    if (status === "unauthenticated") {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-screen container mx-auto flex flex-col md:flex-row bg-white overflow-hidden"
            >
                {/* LEFT SIDE: Form Section */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex-1 flex items-center justify-center p-6 bg-white order-2 md:order-1"
                >
                    <div className="w-full max-w-md">
                        <div className="mb-4 md:-mt-20">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-4xl font-black text-neutral uppercase tracking-tighter">Register</h3>
                                <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-primary flex items-center gap-1 group">
                                    ALREADY MEMBER? <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={10} />
                                </Link>
                            </div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "3rem" }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="h-2 bg-primary mt-2 rounded-full"
                            ></motion.div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Full Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input {...register("name", { required: true })} className="input input-bordered w-full h-14 pl-12 rounded-2xl focus:border-primary focus:ring-0 transition-all bg-gray-50/50" placeholder="Enter Your Name" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Email</label>
                                    <input {...register("email", { required: true })} type="email" className="input input-bordered w-full h-14 rounded-2xl focus:border-primary bg-gray-50/50" placeholder="Enter Your Email" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Phone</label>
                                    <input {...register("phone", { required: true })} className="input input-bordered w-full h-14 rounded-2xl focus:border-primary bg-gray-50/50" placeholder="017XXXXXXXX" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Create Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input {...register("password", { required: true, minLength: 6 })} type={showPassword ? "text" : "password"} placeholder="••••••••" className="input input-bordered w-full h-14 pl-12 rounded-2xl focus:border-primary bg-gray-50/50" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                className="btn btn-primary w-full text-white rounded-2xl h-14 uppercase tracking-[0.2em] font-black shadow-2xl shadow-primary/30 mt-4 border-none"
                            >
                                {loading ? <span className="loading loading-spinner"></span> : "Get OTP Code"}
                            </motion.button>
                        </form>
                    </div>
                </motion.div>

                {/* RIGHT SIDE: Animated Image Section */}
                <motion.div
                    initial={{ x: 100 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.8, ease: "anticipate" }}
                    className="md:w-[48%] bg-neutral relative clip-diagonal-right hidden md:flex flex-col justify-between p-16 text-white min-h-screen order-1 md:order-2 text-right items-end"
                >
                    <motion.div
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.5 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 z-0"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    ></motion.div>
                    <div className="absolute inset-0 bg-linear-to-b from-neutral/80 via-neutral/40 to-primary/30 z-0"></div>

                    <div className="relative z-10">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-6xl font-black italic tracking-tighter"
                        >
                            OnWay<span className="text-primary animate-pulse">.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 text-gray-300 text-lg max-w-sm font-medium leading-relaxed"
                        >
                            Join the fastest growing commuting network in the country.
                        </motion.p>
                    </div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="h-1.5 w-16 bg-primary mb-6 rounded-full ml-auto origin-right"
                        ></motion.div>
                        <p className="text-xs font-bold tracking-[0.4em] uppercase text-gray-400">OnWay Inc • 2026</p>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return null;
};

export default Register;