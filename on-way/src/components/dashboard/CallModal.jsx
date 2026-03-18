"use client";

import { useEffect, useRef } from "react";
import { PhoneOff } from "lucide-react";

export default function CallModal({
    callActive,
    localStreamRef,
    remoteStreamRef,
    endCall
}) {

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // attach local stream
    useEffect(() => {
        if (localVideoRef.current && localStreamRef?.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [localStreamRef]);

    // attach remote stream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStreamRef?.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
    }, [remoteStreamRef]);

    if (!callActive) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">

            {/* Remote Video */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />

            {/* Local Video (small preview) */}
            <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute bottom-6 right-6 w-40 md:w-52 rounded-2xl border-2 border-white shadow-xl"
            />

            {/* Call Controls */}
            <div className="absolute bottom-10 flex items-center gap-4">

                <button
                    onClick={endCall}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg transition"
                >
                    <PhoneOff size={18} />
                    End Call
                </button>

            </div>

        </div>
    );
}