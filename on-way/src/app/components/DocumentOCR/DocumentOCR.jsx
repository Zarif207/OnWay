"use client";

import React, { useState, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectDocumentType, processOCR } from "@/utils/ocrParser";
import { useEarnRegistration } from "@/context/EarnRegistrationContext";

export default function DocumentOCR({ onExtractionComplete }) {
    const { formData, setFormData } = useEarnRegistration();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
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

    // Removed manual documentTypes array

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please upload an image file (JPG, PNG).");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
               console.log("File > 2MB, will auto-compress during preprocessing.");
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
            setIsComplete(false);
            setProgress(0);
            setStatusText("Uploading...");
            setDetectedType(null);
        }
    };

    const preprocessImage = async (file) => {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error("No file provided"));
            if (!(file instanceof File) && !(file instanceof Blob) && typeof file !== "string") {
                return reject(new Error("Invalid file type passed to preprocessImage"));
            }

            const img = new Image();
            img.src = typeof file === 'string' ? file : URL.createObjectURL(file);
            img.onerror = () => reject(new Error("Failed to load image for preprocessing"));
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    
                    // Simple thresholding (black and white) to force contrast
                    gray = gray < 130 ? 0 : 255;
                    
                    data[i] = data[i + 1] = data[i + 2] = gray;
                }
                ctx.putImageData(imageData, 0, 0);

                // Return BOTH a safe Blob URL (for Tesseract) and Base64 (for UI preview)
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error("Failed to create blob from canvas"));
                        const blobUrl = URL.createObjectURL(blob);
                        const base64 = canvas.toDataURL("image/jpeg", 0.6);
                        resolve({ blobUrl, base64 });
                    },
                    "image/jpeg",
                    0.6 // Compress quality
                );
            };
        });
    };

    const runOCR = async (e) => {
        // Prevent accidental event passing (Fix for DataCloneError)
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        const fileToOcr = image; // ALWAYS use the state File, never the event
        if (!fileToOcr) return;

        setIsProcessing(true);
        setError(null);
        setProgress(0);
        setStatusText("Preprocessing...");

        let worker = null;
        let timeoutId;
        let failsafeInterval;
        let OCRBlobUrl = null;

        try {
            console.log("PREPROCESSING IMAGE...");
            const { blobUrl, base64 } = await preprocessImage(fileToOcr);
            OCRBlobUrl = blobUrl;
            
            setStatusText("Loading engine...");
            
            let lastProgressTime = Date.now();

            worker = await createWorker('eng+ben', 3, {
                logger: (m) => {
                    // console.log removed to prevent DataCloneError logging overhead
                    if (m && m.status === "recognizing text") {
                        setProgress(Math.floor(m.progress * 100));
                        lastProgressTime = Date.now();
                        setStatusText("Extracting text...");
                    } else if (m && m.status) {
                        setStatusText(m.status);
                    }
                }
            });
            
            await worker.setParameters({
                preserve_interword_spaces: '1',
                tessedit_pageseg_mode: '6'
                // Removed raw A-Z whitelist to preserve Bengali & Numbers
            });

            // FAILSAFE: Restart worker if stuck for 5 seconds
            failsafeInterval = setInterval(() => {
                if (Date.now() - lastProgressTime > 5000) {
                    console.warn("OCR stalled. Aborting.");
                    clearInterval(failsafeInterval);
                    if (worker) worker.terminate();
                    throw new Error("OCR stalled");
                }
            }, 1000);

            // HARD TIMEOUT: 15 seconds max as requested
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error("OCR timeout, try clearer image"));
                }, 15000); 
            });

            // STRICTLY PASS THE string URL to avert DataCloneError!
            const { data: { text } } = await Promise.race([
                worker.recognize(blobUrl), 
                timeoutPromise
            ]);

            clearInterval(failsafeInterval);
            clearTimeout(timeoutId);
            await worker.terminate();
            worker = null;
            if (OCRBlobUrl) {
                URL.revokeObjectURL(OCRBlobUrl);
                OCRBlobUrl = null;
            }

            const result = processOCR(text);

            console.log("----- ADVANCED OCR EXTRACTION SYSTEM -----");
            console.log("RAW TEXT:\n", text);
            console.log("CLEANED TEXT:\n", result.cleanedText);
            console.log("CANDIDATES & SCORES:", result.debug);
            console.log("CONFIDENCE:", result.confidenceScore);
            
            const finalPayload = {
                fullName: result.fullName,
                firstName: result.firstName,
                lastName: result.lastName,
                dateOfBirth: result.dateOfBirth,
                bloodGroup: result.bloodGroup
            };
            
            console.log("FINAL EXTRACTED DATA:", finalPayload);
            console.log("------------------------------------------");

            const { fullName, firstName, lastName, dateOfBirth, bloodGroup } = finalPayload;

            setFormData(prev => ({
                ...prev,
                fullName: fullName || [firstName, lastName].filter(Boolean).join(" ").trim(),
                firstName,
                lastName,
                dateOfBirth,
                bloodGroup
            }));

            // Fallback for doc type
            const docType = detectDocumentType(text) || "nid";

            setDetectedType(docType);
            setIsComplete(true);
            setProgress(100);
            setStatusText("Data extracted successfully"); // UX Success Message requested

            onExtractionComplete({
                type: docType,
                file: fileToOcr,
                image: base64,
                extractedData: {
                    fullName,
                    firstName,
                    lastName,
                    dateOfBirth,
                    bloodGroup,
                    documentType: docType
                },
                rawText: text || ""
            });

        } catch (err) {
            clearInterval(failsafeInterval);
            clearTimeout(timeoutId);
            if (worker) await worker.terminate();
            if (OCRBlobUrl) URL.revokeObjectURL(OCRBlobUrl);
            
            console.error("OCR Error:", err);
            setStatusText("Failed ❌");
            
            if (err.message.includes("stalled") || err.message.includes("timeout")) {
                setError("OCR timeout, try clearer image");
            } else {
                setError(err.message || "Failed to extract text. Please try again.");
            }
            setProgress(0);
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setImage(null);
        setPreview(null);
        setIsProcessing(false);
        setProgress(0);
        setStatusText("");
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

            {/* Upload Area / Completed States */}
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
                <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50/50 hover:bg-[#f0fdf6] hover:border-[#2FCA71] transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-12 h-12 mb-3 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#2FCA71]" />
                        </div>
                        <p className="mb-2 text-sm text-gray-700 font-bold">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 uppercase font-black tracking-widest mt-1">
                            NID • Driving License • Passport
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
            ) : (
                <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-100 mb-4">
                        <img
                            src={preview}
                            alt="Document Preview"
                            className="w-full h-full object-contain"
                        />

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
                                <p className="text-white font-bold mb-2">{statusText || "Analyzing Document..."}</p>
                                <div className="w-full max-w-xs bg-white/20 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-[#2FCA71]"
                                    />
                                </div>
                                <p className="text-white/80 text-xs mt-2 font-medium">{progress}% Complete</p>
                            </div>
                        )}
                    </div>

                    {!isComplete && !isProcessing && (
                        <button
                            type="button"
                            onClick={runOCR}
                            disabled={isProcessing}
                            className={`w-full py-4 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                                isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-[#2FCA71] hover:bg-[#28ad60] shadow-[0_10px_20px_-10px_rgba(49,202,113,0.5)]"
                            }`}
                        >
                            <FileText size={20} />
                            Extract & Verify Data Automatically
                        </button>
                    )}

                    {isComplete && (
                        <div className="flex items-center justify-center gap-2 text-[#31ca71] py-2 font-bold animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 size={24} />
                            Data Extracted Successfully!
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 py-2 font-medium text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* Info Tip */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-blue-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-[12px] font-bold text-blue-900 uppercase tracking-wide">Pro Tip</p>
                    <p className="text-xs text-blue-700/80 leading-relaxed">
                        Ensure the document is well-lit and all text is clearly visible for better extraction accuracy.
                    </p>
                </div>
            </div>
        </div>
    );
}
