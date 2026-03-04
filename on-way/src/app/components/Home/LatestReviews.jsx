"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Star, Quote, Clock } from "lucide-react";
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
        <section className="py-5 overflow-hidden ">
            <div className="max-w-7xl mx-auto px-6 bg-white/50">

                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight">
                        What Our <span className="text-blue-600">Riders</span> Say
                    </h2>
                    <p className="text-[#0A1F3D]/60 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        Real experiences from real people across the city.
                        Join thousands of satisfied riders using OnWay daily.
                    </p>
                </div>

                <div className="relative">
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

                                    <Quote className="absolute top-8 right-8 text-slate-100" size={60} strokeWidth={3} />

                                    <div className="relative z-10 flex flex-col h-full">

                                        {/* User Info */}
                                        <div className="flex items-center gap-4 mb-6">

                                            {/* Passenger Image */}
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-blue-200">
                                                <img
                                                    src={review.passengerImage || "https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg"}
                                                    alt={review.passengerName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div>
                                                {/* Passenger Name */}
                                                <h4 className="font-bold text-slate-900 leading-none mb-1">
                                                    {review.passengerName}
                                                </h4>

                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                                    <Clock size={12} />
                                                    <span>{formatDate(review.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stars Rating */}
                                        <div className="flex gap-1.5 mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={
                                                        i < review.rating
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-slate-200"
                                                    }
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