"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Smartphone,
  MapPin,
  CreditCard,
  Shield,
  Star,
  Clock,
  MessageSquare,
  TicketPercent,
  LocateFixed,
} from "lucide-react";

const services = [
  {
    title: "Smart Ride Booking",
    desc: "Request a ride instantly through the app. No searching, no delays — get connected to a nearby driver in seconds.",
    icon: Smartphone,
    image: "/ride-booking.jpg",
  },
  {
    title: "Real-Time GPS Tracking",
    desc: "Track your driver live on the map and know exactly when they’ll arrive.",
    icon: MapPin,
    image: "/gps-tracking.jpg",
  },
  {
    title: "Fare Estimation",
    desc: "See the estimated fare before confirming your ride. No hidden charges.",
    icon: CreditCard,
    image: "/fare.jpg",
  },
  {
    title: "In-App Call & Chat",
    desc: "Communicate with drivers securely without sharing phone numbers.",
    icon: MessageSquare,
    image: "/chat.jpg",
  },
  {
    title: "Digital Payment (SSLCommerz)",
    desc: "Pay via cash, card, or mobile wallet. Fast and secure transactions.",
    icon: CreditCard,
    image: "/payment.jpg",
  },
  {
    title: "SOS Safety Feature",
    desc: "Emergency button and live trip sharing for maximum safety.",
    icon: Shield,
    image: "/safety.jpg",
  },
  {
    title: "Driver Rating & Review",
    desc: "Rate drivers after each trip and maintain service quality.",
    icon: Star,
    image: "/rating.jpg",
  },
  {
    title: "Ride History & Invoice",
    desc: "Access previous rides and download receipts anytime.",
    icon: Clock,
    image: "/history.jpg",
  },
  {
    title: "Real-Time Driver Matching",
    desc: "Instant driver match with OTP verification for secure trips.",
    icon: LocateFixed,
    image: "/matching.jpg",
  },
  {
    title: "Promo Code & Discounts",
    desc: "Apply promo codes and enjoy exclusive ride discounts.",
    icon: TicketPercent,
    image: "/promo.jpg",
  },
];

export default function OnWayServices() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir * 480,
      behavior: "smooth",
    });
  };

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;

      const container = scrollRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 480, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#f4f6f8] py-24 overflow-hidden">
      
      {/* HEADER (boxed container) */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-16">
          <div>
            <div className="flex items-center gap-4 text-primary text-sm font-semibold uppercase tracking-widest mb-4">
              ONWAY FEATURES
              <span className="w-10 h-[2px] bg-primary" />
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0d1b2a] leading-tight max-w-2xl">
              Dependable Ride Services for <br />
              Riders of All Types
            </h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => scroll(-1)}
              className="w-12 h-12 rounded-xl bg-primary hover:bg-black text-white flex items-center justify-center transition"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={() => scroll(1)}
              className="w-12 h-12 rounded-xl bg-primary hover:bg-black text-white flex items-center justify-center transition"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* FULL WIDTH SLIDER */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scroll-smooth pb-4 pr-[180px]"
          style={{ scrollbarWidth: "none" }}
        >
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[460px] bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* IMAGE HEADER */}
                <div className="relative h-[140px] overflow-hidden rounded-t-[40px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${service.image})`,
                    }}
                  />

                  {/* LEFT DARK PANEL */}
                  <div
                    className="absolute left-0 top-0 h-full w-[150px] bg-[#0d1b2a] flex items-center justify-center"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
                    }}
                  >
                    <Icon size={42} strokeWidth={1.2} className="text-white" />
                  </div>

                  {/* BOTTOM RIGHT CUT */}
                  <div
                    className="absolute bottom-0 right-0 w-[80px] h-[80px] bg-white"
                    style={{
                      clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                    }}
                  />
                </div>

                {/* BODY */}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-[#0d1b2a] mb-4">
                    {service.title}
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed">
                    {service.desc}
                  </p>

                  <div className="border-t border-gray-200 my-6" />

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0d1b2a] flex items-center justify-center">
                      <ArrowRight size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[#0d1b2a]">
                      View Details
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}