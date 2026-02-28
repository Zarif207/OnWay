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