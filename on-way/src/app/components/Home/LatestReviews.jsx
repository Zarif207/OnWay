// "use client";

// import { useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   ArrowRight,
//   ArrowLeft,
//   Smartphone,
//   MapPin,
//   CreditCard,
//   Shield,
//   Star,
//   Clock,
//   MessageSquare,
//   TicketPercent,
//   LocateFixed,
// } from "lucide-react";

// const services = [
//   {
//     title: "Smart Ride Booking",
//     desc: "Request a ride instantly through the app. No searching, no delays — get connected to a nearby driver in seconds.",
//     icon: Smartphone,
//     image: "/ride-booking.jpg",
//   },
//   {
//     title: "Real-Time GPS Tracking",
//     desc: "Track your driver live on the map and know exactly when they’ll arrive.",
//     icon: MapPin,
//     image: "/gps-tracking.jpg",
//   },
//   {
//     title: "Fare Estimation",
//     desc: "See the estimated fare before confirming your ride. No hidden charges.",
//     icon: CreditCard,
//     image: "/fare.jpg",
//   },
//   {
//     title: "In-App Call & Chat",
//     desc: "Communicate with drivers securely without sharing phone numbers.",
//     icon: MessageSquare,
//     image: "/chat.jpg",
//   },
//   {
//     title: "Digital Payment (SSLCommerz)",
//     desc: "Pay via cash, card, or mobile wallet. Fast and secure transactions.",
//     icon: CreditCard,
//     image: "/payment.jpg",
//   },
//   {
//     title: "SOS Safety Feature",
//     desc: "Emergency button and live trip sharing for maximum safety.",
//     icon: Shield,
//     image: "/safety.jpg",
//   },
//   {
//     title: "Driver Rating & Review",
//     desc: "Rate drivers after each trip and maintain service quality.",
//     icon: Star,
//     image: "/rating.jpg",
//   },
//   {
//     title: "Ride History & Invoice",
//     desc: "Access previous rides and download receipts anytime.",
//     icon: Clock,
//     image: "/history.jpg",
//   },
//   {
//     title: "Real-Time Driver Matching",
//     desc: "Instant driver match with OTP verification for secure trips.",
//     icon: LocateFixed,
//     image: "/matching.jpg",
//   },
//   {
//     title: "Promo Code & Discounts",
//     desc: "Apply promo codes and enjoy exclusive ride discounts.",
//     icon: TicketPercent,
//     image: "/promo.jpg",
//   },
// ];

// export default function OnWayServices() {
//   const scrollRef = useRef(null);

//   const scroll = (dir) => {
//     if (!scrollRef.current) return;

//     scrollRef.current.scrollBy({
//       left: dir * 480,
//       behavior: "smooth",
//     });
//   };

//   // Auto slide
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!scrollRef.current) return;

//       const container = scrollRef.current;
//       const maxScroll = container.scrollWidth - container.clientWidth;

//       if (container.scrollLeft >= maxScroll - 5) {
//         container.scrollTo({ left: 0, behavior: "smooth" });
//       } else {
//         container.scrollBy({ left: 480, behavior: "smooth" });
//       }
//     }, 4000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <section className="bg-[#f4f6f8] py-24 overflow-hidden">
      
//       {/* HEADER (boxed container) */}
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="flex items-end justify-between mb-16">
//           <div>
//             <div className="flex items-center gap-4 text-primary text-sm font-semibold uppercase tracking-widest mb-4">
//               ONWAY FEATURES
//               <span className="w-10 h-[2px] bg-primary" />
//             </div>

//             <h2 className="text-4xl md:text-5xl font-extrabold text-[#0d1b2a] leading-tight max-w-2xl">
//               Dependable Ride Services for <br />
//               Riders of All Types
//             </h2>
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={() => scroll(-1)}
//               className="w-12 h-12 rounded-xl bg-primary hover:bg-black text-white flex items-center justify-center transition"
//             >
//               <ArrowLeft size={18} />
//             </button>

//             <button
//               onClick={() => scroll(1)}
//               className="w-12 h-12 rounded-xl bg-primary hover:bg-black text-white flex items-center justify-center transition"
//             >
//               <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* FULL WIDTH SLIDER */}
//       <div className="relative">
//         <div
//           ref={scrollRef}
//           className="flex gap-8 overflow-x-auto scroll-smooth pb-4 pr-[180px]"
//           style={{ scrollbarWidth: "none" }}
//         >
//           {services.map((service, index) => {
//             const Icon = service.icon;

//             return (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 40 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.05 }}
//                 viewport={{ once: true }}
//                 className="flex-shrink-0 w-[460px] bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
//               >
//                 {/* IMAGE HEADER */}
//                 <div className="relative h-[140px] overflow-hidden rounded-t-[40px]">
//                   <div
//                     className="absolute inset-0 bg-cover bg-center"
//                     style={{
//                       backgroundImage: `url(${service.image})`,
//                     }}
//                   />

//                   {/* LEFT DARK PANEL */}
//                   <div
//                     className="absolute left-0 top-0 h-full w-[150px] bg-[#0d1b2a] flex items-center justify-center"
//                     style={{
//                       clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
//                     }}
//                   >
//                     <Icon size={42} strokeWidth={1.2} className="text-white" />
//                   </div>

//                   {/* BOTTOM RIGHT CUT */}
//                   <div
//                     className="absolute bottom-0 right-0 w-[80px] h-[80px] bg-white"
//                     style={{
//                       clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
//                     }}
//                   />
//                 </div>

//                 {/* BODY */}
//                 <div className="p-8">
//                   <h3 className="text-xl font-bold text-[#0d1b2a] mb-4">
//                     {service.title}
//                   </h3>

//                   <p className="text-gray-500 text-sm leading-relaxed">
//                     {service.desc}
//                   </p>

//                   <div className="border-t border-gray-200 my-6" />

//                   <div className="flex items-center gap-4">
//                     <div className="w-10 h-10 rounded-lg bg-[#0d1b2a] flex items-center justify-center">
//                       <ArrowRight size={16} className="text-white" />
//                     </div>
//                     <span className="text-sm font-semibold text-[#0d1b2a]">
//                       View Details
//                     </span>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Star, Quote, Clock, User, MessageSquare } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

export default function HomeLatestReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.get(`${apiUrl}/reviews/latest`);
                setReviews(res.data.data || []);
            } catch (error) {
                console.error("Failed to load reviews", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-4xl"></div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) return null;

    return (
        <section className="py-5 overflow-hidden ">
            <div className="max-w-7xl mx-auto px-6 bg-white/50">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight">
                        What Our <span className="text-blue-600">Riders</span> Say
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        Real experiences from real people. Join our community for a safer commute.
                    </p>
                </div>

                {/* Swiper */}
                <div className="relative">
                    <Swiper
                        effect={"coverflow"}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={"auto"}
                        loop={reviews.length > 2}
                        speed={1000}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        coverflowEffect={{
                            rotate: 5,
                            stretch: 0,
                            depth: 100,
                            modifier: 2,
                            slideShadows: false,
                        }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        modules={[EffectCoverflow, Autoplay, Pagination]}
                        className="pb-12!"
                    >
                        {reviews.map((review) => (
                            <SwiperSlide key={review._id} className="max-w-87.5 md:max-w-112.5">
                                <div className="bg-white rounded-2xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100 h-full flex flex-col relative transition-all duration-300">

                                    {/* Quote Icon Background */}
                                    <Quote className="absolute top-8 right-8 text-slate-100" size={60} strokeWidth={3} />

                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* User Info */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 leading-none mb-1">
                                                    {review.name?.slice(-4).toUpperCase()}
                                                    Shourav Hasan
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                                    <Clock size={12} />
                                                    <span>{formatDate(review.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stars */}
                                        <div className="flex gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                                                />
                                            ))}
                                        </div>

                                        {/* Review Message */}
                                        <p className="text-slate-600 text-lg leading-relaxed italic mb-4 grow">
                                            {review.review && review.review !== "11"
                                                ? `"${review.review}"`
                                                : "The service was exceptional."}
                                        </p>

                                        {/* Bottom Badge */}
                                        <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                                                Verified Ride
                                            </span>
                                            <span className="text-[10px] text-slate-300 font-mono italic">
                                                OnWay
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            <style jsx global>{`
                .swiper-slide {
                    transition: all 0.5s ease;
                    opacity: 0.5;
                    filter: blur(1px) scale(0.9);
                }
                .swiper-slide-active {
                    opacity: 1;
                    filter: blur(0) scale(1.05);
                }
                .swiper-pagination-bullet-active {
                    background: #2563eb !important;
                    width: 20px !important;
                    border-radius: 5px !important;
                }
            `}</style>
        </section>
    );
}