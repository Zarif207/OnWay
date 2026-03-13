import { useEffect, useRef } from "react";

export default function CallModal({ call }) {

    const localVideo = useRef();
    const remoteVideo = useRef();

    useEffect(() => {

        if (localVideo.current && call.localStreamRef.current) {
            localVideo.current.srcObject = call.localStreamRef.current;
        }

        if (remoteVideo.current && call.remoteStreamRef.current) {
            remoteVideo.current.srcObject = call.remoteStreamRef.current;
        }

    });

    if (!call.callActive) return null;

    return (

        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">

            <video ref={remoteVideo} autoPlay playsInline className="w-96" />

            <video ref={localVideo} autoPlay muted playsInline className="w-32 absolute bottom-10 right-10" />

            <button
                onClick={call.endCall}
                className="bg-red-500 text-white px-6 py-2 mt-6"
            >
                End Call
            </button>

        </div>

    )

}