"use client";
<<<<<<< HEAD
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaChevronRight,
} from "react-icons/fa";
import toast from "react-hot-toast";
=======
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
>>>>>>> b0356446cc46b58100f96796db481de0082a0d6f
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUsers } from '@/hooks/useUsers';
import { useSession } from 'next-auth/react';

const Register = () => {
<<<<<<< HEAD
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
      setLoading(true);
      const toastId = toast.loading("Sending verification code...");

      try {
          const generatedOTP = Math.floor(100000 + Math.random() * 900000);

          const response = await fetch('/api/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: data.email, otp: generatedOTP }),
          });
     
          if(registerResponse){
              toast.success("Data stored to mongodb")
          }
          if (response.ok) {
              const tempUser = { ...data, otp: generatedOTP };
              localStorage.setItem("tempUser", JSON.stringify(tempUser));

              toast.success("OTP sent to your email!", { id: toastId });
              router.push("/verify-email");
              console.log(data);
          } else {
              throw new Error("Failed to send OTP");
          }
      } catch (error) {
          toast.error(error.message, { id: toastId });
      } finally {
          setLoading(false);
      }
  };


  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-white">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-white/20">
        {/* LEFT SIDE: Brand Identity */}
        <div className="md:w-[40%] bg-neutral p-10 flex flex-col justify-between text-white relative overflow-hidden group">
          <div
            className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="absolute inset-0 bg-linear-to-b from-neutral/90 via-neutral/60 to-primary/40 z-0"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-1">
              OnWay<span className="text-primary animate-bounce">.</span>
            </h1>
            <p className="mt-4 text-gray-300 text-sm font-medium leading-relaxed max-w-55 backdrop-blur-sm bg-black/10 p-2 rounded-lg">
              The next generation of commuting in Bangladesh.
            </p>
          </div>
          <div className="relative z-10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex justify-between items-center">
            <span>OnWay Inc • 2026</span>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="md:w-[60%] p-8 lg:p-14 bg-white">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-neutral uppercase tracking-tight">
              Create Account
            </h3>
            <a
              href="/login"
              className="text-xs font-bold text-gray-400 hover:text-primary transition-all flex items-center gap-1 group"
            >
              LOG IN{" "}
              <FaChevronRight
                className="group-hover:translate-x-1 transition-transform"
                size={10}
              />
            </a>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">
                Full Name
              </label>
              <div className="relative">
                <FaUser
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.name ? "text-error" : "text-gray-300"}`}
                />
                <input
                  {...register("name", { required: "Name is required" })}
                  className="input input-bordered w-full pl-12 rounded-2xl"
                  placeholder="Enter Your Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">
                  Email
                </label>
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="input input-bordered w-full rounded-2xl"
                  placeholder="Enter Your Email"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">
                  Phone
                </label>
                <input
                  {...register("phone", { required: "Phone is required" })}
                  className="input input-bordered w-full rounded-2xl"
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: 6,
                  })}
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full rounded-2xl"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn btn-primary w-full rounded-2xl text-white font-bold uppercase"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Get Verification Code"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
=======
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

      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          <div className="w-full max-w-md mt-4">
            <Link href="/" className="text-xs w-30 font-bold text-gray-400 hover:text-primary flex items-center gap-1 group">
              <FaChevronLeft className="group-hover:translate-x-1 transition-transform" size={10} /> BACK TO HOME
            </Link>
            <div className="mb-4 md:mt-10">
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
                className="btn btn-primary w-full text-white rounded-2xl h-14 uppercase tracking-[0.2em] font-black shadow shadow-primary/20 mt-4 border-none"
              >
                {loading ? <span className="loading text-primary loading-spinner"></span> : "Get OTP Code"}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Animated Image Section */}
        <motion.div
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, ease: "anticipate" }}
          className="md:w-[48%] bg-primary relative clip-diagonal-right hidden md:flex flex-col justify-between p-16 text-accent/80 min-h-screen order-1 md:order-2 text-right items-end"
        >
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 z-0 opacity-80"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></motion.div>
          <div className="absolute inset-0 bg-linear-to-t from-neutral via-neutral/10 to-transparent z-0"></div>

          <div className="relative z-10">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-6xl font-black italic tracking-tighter"
            >
              OnWay<span className="text-accent animate-pulse">.</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-white/70 text-lg max-w-sm font-medium leading-relaxed"
            >
              Join the fastest growing commuting network in the country.
            </motion.p>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="h-1.5 w-16 bg-secondary mb-6 rounded-full ml-auto origin-right"
            ></motion.div>
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-gray-400">OnWay Inc • 2026</p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return null;
>>>>>>> b0356446cc46b58100f96796db481de0082a0d6f
};

export default Register;
