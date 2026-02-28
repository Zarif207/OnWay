"use client";
import { useState } from "react";
import axios from "axios";
import { Star, Send } from "lucide-react";

export default function AddReviewForm({ rideId, driverId, passengerId }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rideId || !driverId || !passengerId) {
            toast.error("Error: Ride information is missing!");
            return;
        }

        if (rating === 0) return toast.error("Please select a rating!");;

        setSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await axios.post(`${apiUrl}/reviews`, {
                rideId,
                driverId,
                passengerId,
                rating: Number(rating),
                review: reviewText
            });

            if (res.data.success) {
                toast.success(" Thank you! Review submitted.", { id: loadingToast });
                setRating(0);
                setReviewText("");
            }
        } catch (err) {
            console.error("Error:", err.response?.data);
            toast.error(err.response?.data?.message || "Failed to submit review", { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-emerald-300/40 text-white p-8 rounded-4xl shadow-2xl border border-zinc-800/10">
            <h3 className="text-2xl font-bold mb-1 text-center">Rate Your Driver</h3>
            <p className="text-accent text-center text-sm mb-6">Your feedback improves our service</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="transition-transform hover:scale-125 active:scale-90"
                        >
                            <Star
                                className={`w-10 h-10 ${(hover || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-accent"}`}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    className="w-full bg-cyan-200/30 border border-zinc-700/20 rounded-xl p-4 text-sm text-accent focus:ring-1 focus:ring-accent outline-none resize-none"
                    placeholder="Write a professional review..."
                    rows="3"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                ></textarea>

                <button
                    disabled={submitting}
                    className="w-full bg-yellow-400 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                    {submitting ? "Sending..." : <><Send className="w-4 h-4" /> Submit Review</>}
                </button>
            </form>
        </div>
    );
}