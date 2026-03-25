
"use client";
import { motion } from "framer-motion";
import { Car, Construction, MapPin } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white overflow-hidden px-6">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-20 left-[10%]"><MapPin size={40} /></motion.div>
         <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }} className="absolute bottom-40 right-[15%]"><Construction size={50} /></motion.div>
      </div>

      {/* Main Content */}
      <div className="z-10 text-center">
        <motion.div
          initial={{ rotate: -10, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          className="relative inline-block"
        >
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-yellow-400 to-yellow-700 select-none">
            404
          </h1>
          <motion.div 
            animate={{ x: [-10, 10, -10] }} 
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute -bottom-4 right-0"
          >
             <Car size={100} className="text-white fill-yellow-500" />
          </motion.div>
        </motion.div>

        <h2 className="mt-12 text-3xl font-bold uppercase tracking-widest">Wrong Lane, Buddy!</h2>
        <p className="text-gray-500 mt-4 max-w-sm mx-auto">
          The destination you&apos;re looking for has been moved or deleted. Let&apos;s get you back on track.
        </p>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 px-10 py-4 bg-yellow-400 text-black font-black rounded-sm -skew-x-12 hover:bg-white transition-colors"
          >
            RE-ROUTE HOME
          </motion.button>
        </Link>
      </div>

      {/* Animated Road Line */}
      <div className="absolute bottom-0 w-full h-24 bg-[#111] border-t-4 border-gray-900 flex items-center">
        <div className="w-full h-0.5 bg-dashed flex justify-around">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ x: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-16 h-2 bg-yellow-900 opacity-30"
            />
          ))}
        </div>
      </div>
    </div>
  );
}