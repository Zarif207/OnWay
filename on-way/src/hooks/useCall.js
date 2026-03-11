import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export default function useWebRTCCall(userId) {

    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);

    const [incomingCall, setIncomingCall] = useState(null);
    const [callActive, setCallActive] = useState(false);

    useEffect(() => {

        socket.emit("registerUser", { userId });

        socket.on("incomingCall", (data) => {
            setIncomingCall(data);
        });

        socket.on("callAccepted", async ({ answer }) => {
            await peerRef.current.setRemoteDescription(answer);
            setCallActive(true);
        });

        socket.on("iceCandidate", async ({ candidate }) => {
            try {
                await peerRef.current.addIceCandidate(candidate);
            } catch (err) { }
        });

        socket.on("callEnded", () => {
            endCall();
        });

    }, []);

    const createPeer = (targetUserId) => {

        peerRef.current = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        peerRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", {
                    toUserId: targetUserId,
                    candidate: event.candidate
                });
            }
        };

        peerRef.current.ontrack = (event) => {
            remoteStreamRef.current = event.streams[0];
        };

    };

    const startCall = async (targetUserId) => {

        createPeer(targetUserId);

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        localStreamRef.current.getTracks().forEach(track => {
            peerRef.current.addTrack(track, localStreamRef.current);
        });

        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);

        socket.emit("callUser", {
            toUserId: targetUserId,
            fromUserId: userId,
            offer
        });

    };

    const acceptCall = async () => {

        const { fromUserId, offer } = incomingCall;

        createPeer(fromUserId);

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        localStreamRef.current.getTracks().forEach(track => {
            peerRef.current.addTrack(track, localStreamRef.current);
        });

        await peerRef.current.setRemoteDescription(offer);

        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);

        socket.emit("answerCall", {
            toUserId: fromUserId,
            answer
        });

        setIncomingCall(null);
        setCallActive(true);

    };

    const endCall = () => {

        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
        }

        setCallActive(false);
    };

    return {
        startCall,
        acceptCall,
        endCall,
        incomingCall,
        callActive,
        localStreamRef,
        remoteStreamRef
    };

}