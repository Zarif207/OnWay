
"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGithub, FaGoogle, FaChevronLeft } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUsers } from '@/hooks/useUsers';

const Login = () => {
  const { data: session, status } = useSession();
  const { findUser } = useUsers();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const currentEmail = watch("email");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const onSubmit = async (data) => {
    setLoading(true);
    const toastId = toast.loading("Verifying credentials...");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (result?.error) {
        toast.error("Invalid login credentials", { id: toastId });
      } else {
        toast.success("Welcome back!", { id: toastId });
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen container mx-auto flex flex-col md:flex-row bg-white overflow-hidden"
      >
        {/* LEFT SIDE: Animated Image Section */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "anticipate" }}
          className="md:w-[48%] bg-primary relative clip-diagonal-left hidden md:flex flex-col justify-between p-16 text-accent/90 min-h-screen"
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
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-black italic tracking-tighter"
            >
              OnWay<span className="text-accent">.</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-accent/70 text-lg max-w-sm font-medium leading-relaxed"
            >
              The most reliable commuting partner for your daily life.
            </motion.p>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="h-1.5 bg-secondary mb-6 rounded-full"
            ></motion.div>
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-gray-400">Premium Mobility Service</p>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Animated Form Section */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 flex items-center justify-center p-8 bg-white"
        >
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2"
            >
              <Link href="/" className="text-xs mb-8 w-30 font-bold text-gray-400 hover:text-primary flex items-center gap-1 group">
                <FaChevronLeft className="group-hover:translate-x-1 transition-transform" size={10} /> BACK TO HOME
              </Link>

              <h3 className="text-4xl font-black text-neutral uppercase tracking-tighter">Login</h3>
              <div className="h-2 w-12 bg-primary mt-2 rounded-full"></div>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input {...register("email", { required: "Email is required" })} type="email" placeholder="Enter Your Email" className="input input-bordered w-full h-14 pl-12 rounded-2xl focus:border-secondary focus:ring-0 transition-all bg-gray-50/50" />
                </div>
                {errors.email && <span className="text-red-500 text-xs ml-1">{errors.email.message}</span>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-black uppercase text-gray-400">Password</label>
                  <Link href={`/forgot-password?email=${currentEmail || ""}`}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >  Forgot? </Link>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input {...register("password", { required: "Password is required" })} type={showPassword ? "text" : "password"} placeholder="••••••••" className="input input-bordered w-full h-14 pl-12 rounded-2xl focus:border-secondary focus:ring-0 transition-all bg-gray-50/50" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="text-red-500 text-xs ml-1">{errors.password.message}</span>}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="btn btn-primary w-full text-white rounded-2xl h-12 uppercase tracking-[0.2em] font-black  mt-4 border-none transition-all"
              >
                {loading ? <span className="loading loading-spinner"></span> : "Sign In"}
              </motion.button>
            </form>

            <div className="relative my-4 text-center">
              <span className="bg-white px-4 text-gray-400 text-[10px] font-black relative z-10 rounded-2xl uppercase tracking-widest">Or Continue With</span>
              <div className="absolute top-1/2 w-full h-px bg-gray-100 left-0"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                onClick={() => signIn("google")}
                className="btn flex-1 bg-white border-gray-100 rounded-2xl py-2 hover:bg-gray-50 h-12 shadow-sm uppercase text-[11px] font-bold transition-all justify-center items-center"
              >
                <FcGoogle className="mr-1 text-cyan-600/95 h-4 w-4 -mt-1" /> Google
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                onClick={() => signIn("github")}
                className="btn flex-1 bg-black/80 text-white border-none rounded-2xl py-2  h-12 shadow-sm uppercase text-[11px] font-bold transition-all"
              >
                <FaGithub className="mr-2" /> GitHub
              </motion.button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center text-sm font-medium text-gray-500"
            >
              New here? <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4 ml-1">Create Account?</Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return null;
};

export default Login;
