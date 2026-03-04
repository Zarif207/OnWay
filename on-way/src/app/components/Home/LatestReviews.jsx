"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Star, Quote, Clock, User, CheckCircle2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

/**
 * LatestReviews Component (V2)
 * Premium "2026 Fintech" style testimonials with glassmorphism and green accents.
 */
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
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 py-24">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[2.5rem]"></div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) return null;

    return (
        <section className="bg-[#F8FAFC] py-24 sm:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="text-[#22c55e] text-sm font-black uppercase tracking-[0.3em] block mb-4">
                        Community Voice
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-[#0A1F3D] mb-6 tracking-tight leading-[1.1]">
                        What Our <span className="text-[#22c55e]">Riders</span> Say
                    </h2>
                    <p className="text-[#0A1F3D]/60 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        Real experiences from real people across the city.
                        Join thousands of satisfied riders using OnWay daily.
                    </p>
                </motion.div>

                {/* Swiper Carousel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "circOut" }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <Swiper
                        effect={"coverflow"}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={"auto"}
                        loop={reviews.length > 2}
                        speed={1000}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 100,
                            modifier: 2.5,
                            slideShadows: false,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true
                        }}
                        modules={[EffectCoverflow, Autoplay, Pagination]}
                        className="pb-20!"
                    >
                        {reviews.map((review) => (
                            <SwiperSlide key={review._id} className="max-w-[340px] md:max-w-[480px]">
                                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white h-full flex flex-col relative group transition-all duration-500">

                                    {/* Quote Decoration */}
                                    <Quote className="absolute top-10 right-10 text-[#22c55e]/5 group-hover:text-[#22c55e]/10 transition-colors" size={80} strokeWidth={3} />

                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* User Identity Section */}
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-16 h-16 rounded-2xl bg-[#0A1F3D] flex items-center justify-center text-[#22c55e] shadow-lg shadow-[#0A1F3D]/10">
                                                <User size={28} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[#0A1F3D] text-lg leading-none mb-2 uppercase tracking-tight">
                                                    {review.name?.split(" ")[0] || "Verified"} Rider
                                                </h4>
                                                <div className="flex items-center gap-2 text-[#0A1F3D]/40 text-xs font-bold">
                                                    <Clock size={14} className="text-[#22c55e]" />
                                                    <span>{formatDate(review.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stars Rating */}
                                        <div className="flex gap-1.5 mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={18}
                                                    className={i < review.rating ? "fill-[#22c55e] text-[#22c55e]" : "text-gray-100"}
                                                />
                                            ))}
                                        </div>

                                        {/* Testimonial Message */}
                                        <div className="grow mb-8">
                                            <p className="text-[#0A1F3D]/70 text-xl leading-relaxed font-medium italic">
                                                {review.review && review.review !== "11"
                                                    ? `"${review.review}"`
                                                    : "The service was exceptional, reliable, and smooth."}
                                            </p>
                                        </div>

                                        {/* Verification Footer */}
                                        <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                                            <div className="flex items-center gap-2 bg-[#22c55e]/5 px-4 py-2 rounded-full border border-[#22c55e]/10">
                                                <CheckCircle2 size={14} className="text-[#22c55e]" />
                                                <span className="text-[11px] font-black text-[#22c55e] uppercase tracking-[0.1em]">
                                                    Verified Ride
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-[#0A1F3D]/20 font-black tracking-widest uppercase">
                                                ONWAY PRIVACY
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>
            </div>

            {/* Premium Carousel Logic Styles */}
            <style jsx global>{`
                .swiper-slide {
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    opacity: 0.4;
                    filter: blur(4px) scale(0.85);
                }
                .swiper-slide-active {
                    opacity: 1;
                    filter: blur(0) scale(1.05);
                    z-index: 10;
                }
                /* Custom Green Pagination */
                .swiper-pagination-bullet {
                    background: #CBD5E1 !important;
                    opacity: 0.5 !important;
                    transition: all 0.3s ease !important;
                    width: 8px !important;
                    height: 8px !important;
                }
                .swiper-pagination-bullet-active {
                    background: #22c55e !important;
                    opacity: 1 !important;
                    width: 32px !important;
                    border-radius: 10px !important;
                }
            `}</style>
        </section>
    );
}