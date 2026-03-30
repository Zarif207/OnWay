"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Loader2, Camera, ShieldCheck, AlertCircle, Users, Focus } from "lucide-react";

/**
 * FaceVerificationCamera Component
 * Handles face detection with 400ms interval, centering logic, 
 * and provides a capture trigger when all conditions are met.
 */
const FaceVerificationCamera = ({ onFaceDetected, onCapture }) => {
    const videoRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [detectionStatus, setDetectionStatus] = useState("Initializing...");
    const [isValidFace, setIsValidFace] = useState(false);
    const [faceCount, setFaceCount] = useState(0);
    const [error, setError] = useState(null);
    const [isLoadingModels, setIsLoadingModels] = useState(true);

    // Load Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                setIsLoadingModels(true);
                setDetectionStatus("Loading face recognition models...");
                const MODEL_URL = "/models";

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);

                setModelsLoaded(true);
                setIsLoadingModels(false);
                setDetectionStatus("Models loaded. Starting camera...");
            } catch (err) {
                console.error("Error loading models:", err);
                setError("Failed to load models. Check your connection.");
                setIsLoadingModels(false);
            }
        };
        loadModels();
    }, []);

    // Start Camera
    const startVideo = useCallback(async () => {
        if (!videoRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 720 },
                    height: { ideal: 720 },
                    aspectRatio: 1,
                    facingMode: "user"
                }
            });
            videoRef.current.srcObject = stream;
            setIsCameraReady(true);
            setDetectionStatus("Align your face in the center");
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Camera permission denied. Please allow access.");
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraReady(false);
    }, []);

    useEffect(() => {
        if (modelsLoaded) {
            startVideo();
        }

        return () => {
            stopCamera();
        };
    }, [modelsLoaded, startVideo, stopCamera]);

    // Detection Loop (Interval: 400ms)
    useEffect(() => {
        if (!modelsLoaded || !isCameraReady) return;

        const intervalId = setInterval(async () => {
            if (!videoRef.current || !isCameraReady) return;

            try {
                const detections = await faceapi.detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                );
                const count = detections.length;
                setFaceCount(count);

                if (count === 0) {
                    setDetectionStatus("No face detected");
                    setIsValidFace(false);
                } else if (count > 1) {
                    setDetectionStatus("Multiple faces detected");
                    setIsValidFace(false);
                } else {
                    // Exactly one face
                    const detection = detections[0];
                    const box = detection.box;

                    // 🔹 Debugging Logs
                    console.log("Face box:", box);

                    const videoWidth = videoRef.current.videoWidth || 720;
                    const videoHeight = videoRef.current.videoHeight || 720;

                    // Calculate face center
                    const faceCenterX = box.x + box.width / 2;
                    const faceCenterY = box.y + box.height / 2;

                    // Video center
                    const videoCenterX = videoWidth / 2;
                    const videoCenterY = videoHeight / 2;

                    // 🔹 Centering Logic (120px tolerance)
                    const tolerance = 130;
                    const isCenteredX = Math.abs(faceCenterX - videoCenterX) < tolerance;
                    const isCenteredY = Math.abs(faceCenterY - videoCenterY) < tolerance;
                    const isCentered = isCenteredX && isCenteredY;

                    // 🔹 Size Condition
                    const isSizeValid = box.width > 100;

                    console.log("Centered:", isCentered, "Offsets:", {
                        dx: Math.round(faceCenterX - videoCenterX),
                        dy: Math.round(faceCenterY - videoCenterY)
                    });

                    if (!isCentered) {
                        setDetectionStatus("Align face in center");
                        setIsValidFace(false);
                    } else if (!isSizeValid) {
                        setDetectionStatus("Move closer");
                        setIsValidFace(false);
                    } else {
                        setDetectionStatus("Face detected – Ready to capture");
                        setIsValidFace(true);
                    }
                }
            } catch (err) {
                console.error("Detection error:", err);
            }
        }, 400);

        return () => clearInterval(intervalId);
    }, [modelsLoaded, isCameraReady]);

    // Update parent
    useEffect(() => {
        if (onFaceDetected) {
            onFaceDetected(isValidFace);
        }
    }, [isValidFace, onFaceDetected]);

    const handleCapture = async () => {
        if (!videoRef.current || !isValidFace) return;

        try {
            setDetectionStatus("Securing identity...");

            // 🔹 Capture frame to canvas for storage
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth || 720;
            canvas.height = videoRef.current.videoHeight || 720;
            const ctx = canvas.getContext("2d");

            // Handle horizontal flip since video is scale-x-[-1]
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const base64Image = canvas.toDataURL("image/jpeg");

            const fullDetection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (fullDetection) {
                // 🔹 Stop camera and detection immediately after successful capture
                stopCamera();
                setDetectionStatus("Face verified successfully");

                onCapture({
                    descriptor: Array.from(fullDetection.descriptor),
                    image: base64Image
                });
            } else {
                setDetectionStatus("Capture failed. Try again.");
            }
        } catch (err) {
            console.error("Capture error:", err);
            setDetectionStatus("Error during capture.");
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto aspect-square rounded-[3rem] overflow-hidden border-[6px] border-white shadow-2xl bg-black group transition-all duration-500">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* 🔹 Overlay Guide Circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-[60%] aspect-square rounded-full border-4 border-dashed transition-all duration-500 
          ${isValidFace ? 'border-[#31ca71] scale-105' : 'border-white/30'}`}>
                    <div className={`absolute inset-0 rounded-full ${isValidFace ? 'bg-[#31ca71]/10' : ''}`} />
                </div>
            </div>

            {/* 🔹 Border Feedback (Green/Red) */}
            <div className={`absolute inset-0 pointer-events-none border-[12px] transition-all duration-500 rounded-[2.6rem]
        ${isValidFace ? 'border-[#31ca71]/20' : faceCount > 0 ? 'border-red-500/10' : 'border-transparent'}`} />

            {/* Status Indicators */}
            <div className="absolute top-8 left-0 right-0 flex flex-col items-center pointer-events-none">
                {!error && !isLoadingModels && (
                    <div className={`px-6 py-2.5 rounded-full backdrop-blur-md flex items-center gap-3 text-xs font-black shadow-xl border transition-all
            ${isValidFace
                            ? 'bg-[#31ca71] text-[#001820] border-[#31ca71]'
                            : 'bg-black/70 text-white border-white/10'}`}>
                        {isValidFace ? <ShieldCheck className="w-5 h-5" /> : faceCount > 1 ? <Users className="w-5 h-5" /> : <Focus className="w-5 h-5 animate-pulse" />}
                        <span className="tracking-widest uppercase">
                            {isValidFace ? "ALIGNED" : faceCount > 1 ? "Too many faces" : "Scanning"}
                        </span>
                    </div>
                )}
            </div>

            {/* Status Message */}
            <div className="absolute bottom-20 left-0 right-0 px-8 pointer-events-none">
                <div className={`mx-auto w-fit px-6 py-2.5 rounded-2xl backdrop-blur-xl text-sm font-bold shadow-2xl transition-all border
          ${isValidFace ? 'bg-[#31ca71]/20 text-[#31ca71] border-[#31ca71]/30' : 'bg-black/60 text-white'}`}>
                    {detectionStatus}
                </div>
            </div>

            {/* Hidden trigger for parent button */}
            <button id="hidden-capture-trigger" type="button" onClick={handleCapture} className="hidden" />

            {isLoadingModels && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-10 text-center gap-6 z-50">
                    <div className="w-16 h-16 border-4 border-[#31ca71]/20 border-t-[#31ca71] rounded-full animate-spin" />
                    <p className="text-[#31ca71] font-bold">Loading face recognition models...</p>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-12 text-center gap-6 z-50">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                    <p className="text-white font-bold">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-xl font-bold">Retry</button>
                </div>
            )}
        </div>
    );
};

export default FaceVerificationCamera;
