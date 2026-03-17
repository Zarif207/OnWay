"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Camera, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";
import FaceVerificationCamera from "@/components/FaceVerificationCamera";
import useRiders from "@/hooks/useRiders";
import toast from "react-hot-toast";

/**
 * FaceVerificationPage
 * Manages the UI flow for scanning a rider's face.
 * Steps: 
 * 1. Load component and models.
 * 2. User aligns face (component provides isValidFace signal).
 * 3. User clicks Capture.
 * 4. Verify with backend.
 * 5. Redirect on success.
 */
export default function FaceVerificationPage() {
    const router = useRouter();
    const { formData, updateFormData } = useEarnRegistration();
    const { verifyFace } = useRiders();

    const [isFaceValid, setIsFaceValid] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCapture = async ({ descriptor, image }) => {
        setIsVerifying(true);
        try {
            // Send the full payload to the backend for storage
            const result = await verifyFace({
                riderId: formData.id || formData._id, // Use ID if available
                faceDescriptor: descriptor,
                image: image,
                email: formData.email
            });

            if (result.success) {
                setIsSuccess(true);
                updateFormData({
                    faceVerification: result.data?.faceVerification || {
                        isVerified: true,
                        verificationStatus: "verified",
                        verifiedAt: new Date(),
                        verificationMethod: "face_match",
                        confidenceScore: 0.98,
                        verificationImage: result.data?.faceVerification?.verificationImage || "",
                        faceEmbedding: descriptor,
                        lastVerificationAttempt: new Date(),
                        verificationAttempts: (formData.faceVerification?.verificationAttempts || 0) + 1
                    },
                    isFaceVerified: true
                });

                toast.success("Face verified successfully!");

                setTimeout(() => {
                    router.push("/earn-with-onway/vehicle-info");
                }, 2000);
            } else {
                toast.error(result.message || "Face Verification failed.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("Internal verification error. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const triggerCapture = () => {
        // Proxy the click to the hidden button inside the camera component
        const internalBtn = document.getElementById('hidden-capture-trigger');
        if (internalBtn) internalBtn.click();
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden font-sans pb-24">
            {/* Dynamic Background */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#31ca7115,transparent_40%)] pointer-events-none" />

            <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-32 relative z-10 flex flex-col items-center">

                {/* Step Indicator */}
                <div className="w-full max-w-2xl mb-12 flex items-center justify-between px-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#31ca71] text-white flex items-center justify-center shadow-lg shadow-[#31ca71]/20">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 tracking-tighter uppercase">Step 1</span>
                    </div>

                    <div className="flex-1 h-1 bg-[#31ca71] mx-4 rounded-full opacity-20" />

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#31ca71] text-[#001820] flex items-center justify-center shadow-xl shadow-[#31ca71]/40 border-4 border-white">
                            <span className="font-black text-xl">2</span>
                        </div>
                        <span className="text-xs font-bold text-[#31ca71] tracking-tighter uppercase border-[#31ca71] border-b-2">Step 2: Security</span>
                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-4 rounded-full" />

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-100 text-gray-300 flex items-center justify-center">
                            <span className="font-bold text-xl text-gray-200">3</span>
                        </div>
                        <span className="text-xs font-bold text-gray-300 tracking-tighter uppercase">Step 3</span>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-10 md:p-14 w-full max-w-2xl text-center relative border border-gray-50 overflow-hidden"
                >
                    {/* Header Card UI */}
                    <div className="mb-10 flex flex-col items-center">
                        <div className="p-4 bg-[#31ca71]/10 rounded-3xl mb-6">
                            <ShieldCheck className="w-12 h-12 text-[#31ca71]" />
                        </div>
                        <h2 className="text-4xl font-black text-[#001820] tracking-tight mb-3">Identity Verification</h2>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                            We use secure biometric scanning to ensure you are a genuine human rider.
                        </p>
                    </div>

                    {/* Camera Region */}
                    <div className="mb-12">
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full max-w-md mx-auto aspect-square rounded-[2rem] bg-[#31ca71]/5 flex flex-col items-center justify-center gap-6 border-[6px] border-[#31ca71]"
                                >
                                    <div className="w-28 h-28 rounded-full bg-[#31ca71] text-white flex items-center justify-center shadow-2xl shadow-[#31ca71]/40">
                                        <CheckCircle2 className="w-14 h-14" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black text-[#31ca71]">Verified!</h3>
                                        <p className="text-[#001820]/40 font-bold uppercase tracking-widest text-xs">Security Check Complete</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="camera" exit={{ scale: 0.9, opacity: 0 }}>
                                    <FaceVerificationCamera
                                        onFaceDetected={setIsFaceValid}
                                        onCapture={handleCapture}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="relative z-10 space-y-8">
                        {!isSuccess ? (
                            <button
                                disabled={!isFaceValid || isVerifying}
                                onClick={triggerCapture}
                                className={`w-full py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl active:scale-95
                  ${isFaceValid
                                        ? "bg-[#31ca71] text-[#001820] shadow-[#31ca71]/40 hover:-translate-y-1 hover:bg-[#28ad60]"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed grayscale"
                                    }`}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-7 h-7 animate-spin" />
                                        Validating Bio-Data...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-7 h-7" />
                                        {isFaceValid ? "Capture & Verify Face" : "Position Face Properly"}
                                    </>
                                )}
                            </button>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => router.push("/earn-with-onway/vehicle-info")}
                                className="w-full py-6 bg-[#001820] text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl"
                            >
                                Continue to Final Step
                                <ChevronRight className="w-6 h-6" />
                            </motion.button>
                        )}

                        {/* Bottom Badges */}
                        {!isSuccess && (
                            <div className="flex items-center justify-center gap-10">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#31ca71]" />
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">End-to-End Encrypted</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Detection</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Footer Meta */}
                <p className="mt-12 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#31ca71]" />
                    Secured by OnWay Biometric Protocol v2.0
                </p>
            </div>

            <style jsx global>{`
        @keyframes enter {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-enter { animation: enter 0.3s ease-out; }
      `}</style>
        </div>
    );
}
