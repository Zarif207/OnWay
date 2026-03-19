"use client";

import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseDocument } from "@/utils/ocrParser";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";

export default function DocumentOCR({ onExtractionComplete }) {
    const { formData, setFormData } = useEarnRegistration();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [detectedType, setDetectedType] = useState(null);

    // Initialize local preview if a document exists in context (Persistence)
    useEffect(() => {
        const docs = formData.documents || {};
        if (docs.license?.uploaded) {
            setPreview(docs.license.image);
            setIsComplete(true);
            setDetectedType("Driving License");
        } else if (docs.nid?.uploaded) {
            setPreview(docs.nid.image);
            setIsComplete(true);
            setDetectedType("NID");
        } else if (docs.passport?.uploaded) {
            setPreview(docs.passport.image);
            setIsComplete(true);
            setDetectedType("Passport");
        }
    }, [formData.documents]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please upload an image file (JPG, PNG).");
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
            setIsComplete(false);
            setProgress(0);
            setDetectedType(null);
        }
    };

    const preprocessImage = async (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = typeof file === 'string' ? file : URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    const factor = 1.5;
                    gray = factor * (gray - 128) + 128;
                    gray = Math.max(0, Math.min(255, gray));
                    data[i] = data[i + 1] = data[i + 2] = gray;
                }
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL("image/jpeg", 0.9));
            };
        });
    };

    const runOCR = async () => {
        if (!image) return;
        setIsProcessing(true);
        setError(null);
        setProgress(0);

        try {
            console.log("PREPROCESSING IMAGE...");
            const processedBase64 = await preprocessImage(image);

            console.log("STARTING TESSERACT OCR...");
            const { data: { text } } = await Tesseract.recognize(
                processedBase64,
                "eng+ben",
                {
                    logger: (m) => {
                        if (m.status === "recognizing text") {
                            setProgress(Math.floor(m.progress * 100));
                        }
                    },
                    tessedit_pageseg_mode: "6"
                }
            );

            console.log("OCR TEXT:", text);
            const extracted = parseDocument("unknown", text);
            console.log("PARSED DATA:", extracted);

            setDetectedType(extracted.documentType);
            setIsComplete(true);

            onExtractionComplete({
                type: extracted.documentType,
                file: image,
                image: processedBase64,
                extractedData: extracted,
                rawText: text
            });
        } catch (err) {
            console.error("OCR Error:", err);
            setError("Failed to extract text. Please try a clearer image.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setImage(null);
        setPreview(null);
        setIsProcessing(false);
        setProgress(0);
        setError(null);
        setIsComplete(false);
        setDetectedType(null);
    };

    const handleReplace = () => {
        if (detectedType) {
            const typeKey = detectedType.toLowerCase().includes("license") ? "license"
                : detectedType.toLowerCase().includes("passport") ? "passport"
                    : "nid";

            // Clear from global context to allow re-upload
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [typeKey]: { uploaded: false, image: "" }
                }
            }));
        }
        reset();
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700 tracking-wide uppercase">
                        Identity Verification
                    </label>
                    <p className="text-xs text-gray-400">Scan NID, License, or Passport</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">Smart Secure</span>
                </div>
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    {isComplete && preview && !isProcessing ? (
                        <motion.div
                            key="completed-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative rounded-3xl overflow-hidden border-2 border-[#31ca71] bg-white p-5 shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-[#31ca71]">
                                    <div className="w-8 h-8 rounded-full bg-[#31ca71]/10 flex items-center justify-center">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <span className="font-bold text-sm uppercase tracking-wide">
                                        {detectedType || "Document"} Uploaded ✓
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleReplace}
                                    className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest px-3 py-1 hover:bg-red-50 rounded-lg"
                                >
                                    Replace
                                </button>
                            </div>

                            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-3">
                                <img
                                    src={preview}
                                    alt="Uploaded Document"
                                    className="w-full h-full object-contain p-2"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-12" />
                            </div>
                            <p className="text-[11px] text-center text-gray-400 font-medium">
                                This document has been verified and synced with your form.
                            </p>
                        </motion.div>
                    ) : !preview ? (
                        <motion.label
                            key="upload-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50/50 hover:bg-[#f0fdf6] hover:border-[#2FCA71] transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="w-12 h-12 mb-3 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#2FCA71]" />
                                </div>
                                <p className="mb-2 text-sm text-gray-700 font-bold">Click to scan document</p>
                                <p className="text-[10px] text-gray-400 text-center px-10 leading-relaxed uppercase tracking-widest font-black">
                                    NID • DRIVING LICENSE • PASSPORT
                                </p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </motion.label>
                    ) : (
                        <motion.div
                            key="processing-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative rounded-3xl overflow-hidden border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-100 mb-4">
                                <img src={preview} alt="Document Preview" className="w-full h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={reset}
                                    disabled={isProcessing}
                                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md"
                                >
                                    <X size={18} />
                                </button>
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                                        <Loader2 className="w-10 h-10 text-[#2FCA71] animate-spin mb-4" />
                                        <p className="text-white font-bold mb-1">Analyzing Document...</p>
                                        <div className="w-full max-w-xs bg-white/20 h-1.5 rounded-full overflow-hidden mt-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-[#2FCA71]"
                                            />
                                        </div>
                                        <p className="text-white/60 text-[10px] mt-2 font-black uppercase tracking-widest">{progress}% Scanned</p>
                                    </div>
                                )}
                            </div>
                            {!isProcessing && (
                                <button
                                    type="button"
                                    onClick={runOCR}
                                    className="w-full py-4 bg-[#2FCA71] text-white font-bold rounded-2xl hover:bg-[#28ad60] transition-all shadow-lg flex items-center justify-center gap-2 group"
                                >
                                    <FileText size={20} className="group-hover:scale-110 transition-transform" />
                                    Extract & Auto-Fill
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl font-medium text-xs border border-red-100">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-blue-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-[12px] font-bold text-blue-900 uppercase tracking-wide">AI Engine Status</p>
                    <p className="text-xs text-blue-700/80 leading-relaxed">
                        Strict extraction mode active. Names are cleaned of garbage keywords and documents are tracked for duplication.
                    </p>
                </div>
            </div>
        </div>
    );
}
