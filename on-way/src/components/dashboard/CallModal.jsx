"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Phone } from "lucide-react";

export default function CallModal({
    callActive,
    calling,
    localStreamRef,
    remoteStreamRef,
    endCall,
    callerName = "Unknown",
    callType   = "video",
}) {
    const localVideoRef  = useRef(null);
    const remoteVideoRef = useRef(null);

    const [micOn,        setMicOn]        = useState(true);
    const [camOn,        setCamOn]        = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [remoteReady,  setRemoteReady]  = useState(false);
    const timerRef = useRef(null);

    // ── Attach streams via polling ────────────────────────────────
    useEffect(() => {
        const iv = setInterval(() => {
            if (localVideoRef.current && localStreamRef?.current
                && !localVideoRef.current.srcObject) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }
            if (remoteVideoRef.current && remoteStreamRef?.current) {
                if (!remoteVideoRef.current.srcObject) {
                    remoteVideoRef.current.srcObject = remoteStreamRef.current;
                }
                setRemoteReady(true);
            }
        }, 300);
        return () => clearInterval(iv);
    }, [localStreamRef, remoteStreamRef]);

    // ── Reset when call ends ──────────────────────────────────────
    useEffect(() => {
        if (!callActive && !calling) {
            setRemoteReady(false);
            setCallDuration(0);
            setMicOn(true);
            setCamOn(true);
            if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        }
    }, [callActive, calling]);

    // ── Call timer ────────────────────────────────────────────────
    useEffect(() => {
        if (!callActive) { clearInterval(timerRef.current); return; }
        setCallDuration(0);
        timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        return () => clearInterval(timerRef.current);
    }, [callActive]);

    const toggleMic = () => {
        localStreamRef?.current?.getAudioTracks()
            .forEach(t => { t.enabled = !t.enabled; });
        setMicOn(p => !p);
    };

    const toggleCam = () => {
        localStreamRef?.current?.getVideoTracks()
            .forEach(t => { t.enabled = !t.enabled; });
        setCamOn(p => !p);
    };

    const fmt = (s) =>
        `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

    // ── Avatar letter ─────────────────────────────────────────────
    const avatarLetter = (callerName || "?")[0].toUpperCase();

    // ── Show avatar: always for audio, or when video not ready ────
    const showAvatar = callType === "audio" || !remoteReady;

    if (!callActive && !calling) return null;

    // ════════════════════════════════════════════════════════════
    return (
        <div
            className="fixed inset-0 z-999 overflow-hidden"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* ── Background ── */}
            <div className="absolute inset-0 bg-gray-950">

                {/* Remote video — video call only */}
                {callActive && callType === "video" && (
                    <video
                        ref={remoteVideoRef}
                        autoPlay playsInline
                        className="w-full h-full object-cover"
                        style={{ opacity: remoteReady ? 1 : 0, transition: "opacity 0.6s ease" }}
                    />
                )}

                {/* Avatar — audio call OR video not yet connected */}
                {showAvatar && (
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "radial-gradient(ellipse at center, #1a2744 0%, #0a0f1e 100%)" }}
                    >
                        <div className="relative flex items-center justify-center">
                            {/* Pulsing rings */}
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="absolute rounded-full border border-emerald-500/20"
                                    style={{
                                        inset: `-${i * 28}px`,
                                        animation: `pulse-ring 2.4s ease-out ${i * 0.4}s infinite`,
                                    }}
                                />
                            ))}
                            {/* Avatar circle */}
                            <div
                                className="w-28 h-28 rounded-full flex items-center justify-center
                                           text-white text-4xl font-black uppercase relative z-10
                                           shadow-2xl shadow-emerald-900/60"
                                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                            >
                                {avatarLetter}
                            </div>
                        </div>
                    </div>
                )}

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.85) 100%)",
                    }}
                />
            </div>

            {/* ── Top bar ── */}
            <div className="absolute top-0 left-0 right-0 px-6 pt-10 pb-4 flex items-start justify-between">
                <div>
                    {/* Call state label */}
                    <p className="text-white/50 text-xs tracking-[0.2em] uppercase font-medium mb-1">
                        {calling
                            ? "Calling..."
                            : callActive
                                ? callType === "audio" ? "Voice Call" : "Video Call"
                                : "Incoming Call"}
                    </p>
                    {/* ✅ Caller / callee name — always visible */}
                    <h2 className="text-white text-2xl font-black tracking-tight">
                        {callerName}
                    </h2>
                    {/* Subtitle */}
                    <p className="text-white/40 text-xs font-medium mt-0.5">
                        {calling
                            ? "Waiting for answer..."
                            : callActive
                                ? remoteReady ? "Connected" : "Connecting..."
                                : ""}
                    </p>
                </div>

                {/* Timer — only when connected */}
                {callActive && remoteReady && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/10
                                    rounded-2xl px-4 py-2 flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full bg-emerald-400"
                            style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
                        />
                        <span className="text-white text-sm font-bold tabular-nums">
                            {fmt(callDuration)}
                        </span>
                    </div>
                )}

                {/* Ringing indicator */}
                {calling && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/10
                                    rounded-2xl px-4 py-2 flex items-center gap-2">
                        <Phone size={14} className="text-emerald-400"
                            style={{ animation: "pulse-dot 1s ease-in-out infinite" }} />
                        <span className="text-white/70 text-xs font-bold">Ringing...</span>
                    </div>
                )}
            </div>

            {/* ── Connecting dots (video only, before stream) ── */}
            {callActive && !remoteReady && callType === "video" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <div className="flex gap-2 mt-40">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-emerald-400"
                                style={{ animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Local video PiP ── */}
            {(callActive || calling) && callType === "video" && (
                <div
                    className="absolute top-24 right-5 z-20"
                    style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))" }}
                >
                    <div
                        className="relative w-32 md:w-44 rounded-3xl overflow-hidden border-2 border-white/20"
                        style={{ aspectRatio: "9/16" }}
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay muted playsInline
                            className="w-full h-full object-cover"
                            style={{ transform: "scaleX(-1)" }}
                        />
                        {!camOn && (
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                <VideoOff size={24} className="text-white/40" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Controls ── */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 pt-6">

                {/* Signal bars — only when connected */}
                {callActive && remoteReady && (
                    <div className="flex justify-center mb-5">
                        <div className="flex items-end gap-0.75 opacity-40">
                            {[3, 5, 8, 11, 14].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-0.75 bg-emerald-400 rounded-full"
                                    style={{ height: `${h}px`, opacity: i < 4 ? 1 : 0.3 }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-center gap-4">

                    {/* Mic — only when connected */}
                    {callActive && (
                        <button onClick={toggleMic} className="flex flex-col items-center gap-1.5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                                ${micOn
                                    ? "bg-white/15 backdrop-blur-md border border-white/20"
                                    : "bg-red-500/80 border border-red-400/30"}`}>
                                {micOn
                                    ? <Mic size={22} className="text-white" />
                                    : <MicOff size={22} className="text-white" />}
                            </div>
                            <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                                {micOn ? "Mute" : "Unmute"}
                            </span>
                        </button>
                    )}

                    {/* End / Cancel call */}
                    <button onClick={endCall} className="flex flex-col items-center gap-1.5">
                        <div className="w-18 h-18 rounded-2xl flex items-center justify-center
                                        bg-red-600 hover:bg-red-500 active:scale-95 transition-all
                                        shadow-xl shadow-red-900/50 border border-red-400/20">
                            <PhoneOff size={26} className="text-white" />
                        </div>
                        <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                            {calling ? "Cancel" : "End"}
                        </span>
                    </button>

                    {/* Camera / Speaker — only when connected */}
                    {callActive && (
                        callType === "video" ? (
                            <button onClick={toggleCam} className="flex flex-col items-center gap-1.5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                                    ${camOn
                                        ? "bg-white/15 backdrop-blur-md border border-white/20"
                                        : "bg-red-500/80 border border-red-400/30"}`}>
                                    {camOn
                                        ? <Video size={22} className="text-white" />
                                        : <VideoOff size={22} className="text-white" />}
                                </div>
                                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                                    {camOn ? "Camera" : "No Cam"}
                                </span>
                            </button>
                        ) : (
                            <button className="flex flex-col items-center gap-1.5">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                                                bg-white/15 backdrop-blur-md border border-white/20">
                                    <Volume2 size={22} className="text-white" />
                                </div>
                                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                                    Speaker
                                </span>
                            </button>
                        )
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse-ring {
                    0%   { transform: scale(1);   opacity: 0.5; }
                    100% { transform: scale(1.6); opacity: 0;   }
                }
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1;   }
                    50%      { opacity: 0.3; }
                }
                @keyframes bounce-dot {
                    0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
                    40%           { transform: translateY(-8px); opacity: 1;   }
                }
            `}</style>
        </div>
    );
}