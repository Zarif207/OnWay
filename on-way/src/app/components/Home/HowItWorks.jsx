"use client";

import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import Image from "next/image";

import step1Img from "../../../../public/passenger.jpg";
import step2Img from "../../../../public/car.jpg";
import step3Img from "../../../../public/location-mark.jpg";

const steps = [
  {
    id: "01",
    title: "Book in Seconds",
    description:
      "Enter your pickup and destination to find the nearest available ride.",
    image: step1Img,
  },
  {
    id: "02",
    title: "Choose Your Ride",
    description:
      "Select from a variety of vehicles that fit your style and budget.",
    image: step2Img,
  },
  {
    id: "03",
    title: "Arrive Safely",
    description:
      "Track your driver in real-time and enjoy a comfortable journey.",
    image: step3Img,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#f2f3f5] py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Top Label */}
        <p className="text-sm font-semibold tracking-widest text-[#2FCA71] uppercase flex items-center justify-center gap-2 mb-6">
          <Plane className="w-4 h-4" />
          WORKING PROCESS
        </p>

        {/* Main Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-[#303841] leading-tight mb-20">
          Logistics Solutions to Help <br />
          Businesses
        </h2>

        {/* Timeline Line */}
        <div className="relative mb-24 hidden md:block">
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300"></div>

          <div className="flex justify-between relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center w-full">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold shadow-sm">
                  {step.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {/* Circle Image */}
              <div className="mx-auto relative w-[300px] h-[300px] rounded-full bg-white p-3 shadow-xl">
                {/* Outer Dark Border */}
                <div className="absolute inset-0 rounded-full" />

                {/* Image Wrapper */}
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Faded Arrow Decoration */}
              {index !== 2 && (
                <div className="hidden md:block absolute right-[-60px] top-1/2 -translate-y-1/2 text-accent text-6xl font-bold">
                  »
                </div>
              )}

              {/* Title */}
              <h3 className="mt-8 text-xl font-semibold text-[#303841]">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
