"use client";

import { useState } from "react";
import { Star, Send, Loader2, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";

export default function ReviewModal({ isOpen, onClose, rideId, driverId, onSubmitSuccess }) {
    const { user } = useCurrentUser();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) return toast.error("Please login to submit a review");
        if (!rideId) return toast.error("Ride information missing!");
        if (rating === 0) return toast.error("Please select a star rating");

        setIsSubmitting(true);
        const toastId = toast.loading("Processing your feedback...");

        try {
            const reviewPayload = {
                rideId,
                driverId: driverId || "unknown",
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
                toast.success("Review submitted!", { id: toastId });
                setRating(0);
                setReviewText("");
                setTimeout(() => onSubmitSuccess(), 1000);
            } else {
                throw new Error(data.message || "Failed to submit review");
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
            setIsSubmitting(false);
        }
    };

    const ratingLabel = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Great Job",
        5: "Excellent!"
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4"
                    style={{ background: "rgba(1, 20, 33, 0.75)", backdropFilter: "blur(6px)" }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 h-10 w-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all"
                        >
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex p-4 bg-[#2FCA71]/10 text-[#2FCA71] rounded-2xl mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-secondary mb-2 tracking-tighter">Ride Complete!</h2>
                            <p className="text-gray-500 font-medium">Rate your experience with the driver</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-4 py-6 bg-gray-50 rounded-[1.5rem]">
                                <div className="flex justify-center gap-3">
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
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-gray-200"
                                                    } transition-all duration-200`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {(hover || rating) > 0 && (
                                        <motion.p
                                            key={hover || rating}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            className="text-amber-600 font-black text-xs uppercase tracking-[0.3em]"
                                        >
                                            {ratingLabel[hover || rating]}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Review Textarea */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
                                    Write a Review (Optional)
                                </label>
                                <textarea
                                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#2FCA71]/10 focus:border-[#2FCA71] transition-all resize-none text-sm font-medium text-secondary placeholder:text-gray-300"
                                    placeholder="Tell us about the driver, the car, or the route..."
                                    rows={3}
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || rating === 0}
                                className={`w-full h-16 rounded-2xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${isSubmitting || rating === 0
                                        ? "bg-gray-200 cursor-not-allowed"
                                        : "bg-[#2FCA71] hover:bg-[#28b563] active:scale-[0.98]"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Submit Feedback</span>
                                        <Send size={16} />
                                    </>
                                )}
                            </button>

                            {/* Skip */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full text-center text-xs font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors py-2"
                            >
                                Skip & Close
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}