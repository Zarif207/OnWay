"use client";

import { useState, Suspense } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Star, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function ReviewFormContent() {
    const { user, isLoading: userLoading } = useCurrentUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlRideId = searchParams.get("rideId") || "RIDE_" + Math.random().toString(36).substring(7);
    const urlDriverId = searchParams.get("driverId") || "DRIVER_UNKNOWN";
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API = process.env.NEXT_PUBLIC_API_URL;
    const DASHBOARD_URL = "/dashboard/passenger";
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) return toast.error("Please login to submit a review");

        if (!urlRideId || !urlDriverId) {
            return toast.error("Ride or Driver information missing!");
        }

        if (rating === 0) return toast.error("Please select a star rating");

        setIsSubmitting(true);
        const toastId = toast.loading("Processing your feedback...");

        try {
            const reviewPayload = {
                rideId: urlRideId,
                driverId: urlDriverId,
                passengerId: user._id,
                passengerName: user.name,
                passengerImage: user.image,
                rating: Number(rating),
                review: reviewText,
            };

            const res = await fetch(`${API}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewPayload),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Review submitted! Redirecting...", { id: toastId });
                setTimeout(() => {
                    router.push(DASHBOARD_URL);
                }, 1500);
            } else {
                throw new Error(data.message || "Failed to submit review");
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
            setIsSubmitting(false);
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-100 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-500 font-medium animate-pulse">Syncing details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto my-8 px-4">
            <Toaster position="top-center" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/50 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white relative overflow-hidden"
            >
                <div className="relative z-10">
                    <div className="text-center mb-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex p-4 bg-primary/20 text-primary rounded-2xl mb-4"
                        >
                            <CheckCircle2 size={32} />
                        </motion.div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Rate Your Ride</h2>
                        <p className="text-slate-500 font-medium italic">Help us improve by sharing your experience</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Star Rating Section */}
                        <div className="flex flex-col items-center space-y-4 py-6 bg-white/20 rounded-4xl border border-slate-100/10 shadow-inner">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-all transform hover:scale-125 active:scale-95"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star
                                            size={44}
                                            className={`${star <= (hover || rating)
                                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                                : "text-slate-200"
                                                } transition-all duration-300`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence mode="wait">
                                {rating > 0 && (
                                    <motion.p
                                        key={rating}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="text-amber-600 font-black text-xs uppercase tracking-[0.3em]"
                                    >
                                        {rating === 5 ? "Excellent!" : rating === 4 ? "Great Job" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Textarea */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">Write a Review</label>
                            <textarea
                                className="w-full p-6 bg-white/20 border border-slate-200/20 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-25 resize-none text-slate-600 shadow-inner"
                                placeholder="Tell us about the driver, the car, or the route..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            />
                        </div>

                        {/* Action Button */}
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-secondary/40 hover:bg-primary/40 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10 group"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span>Submit Your Feedback</span>
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default function SubmitReview() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-100"><Loader2 className="animate-spin text-blue-600" /></div>}>
            <ReviewFormContent />
        </Suspense>
    );
}