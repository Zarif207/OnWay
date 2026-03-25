"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

let globalSocket;

export const useChat = (roomId, chatType, userId, userName, role, otherUserId = null) => {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [socket, setSocket] = useState(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const typingTimeout = useRef(null);
  const prevRoomRef = useRef(null);

  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);
  const roleRef = useRef(role);
  const otherUserIdRef = useRef(otherUserId);

  useEffect(() => {
    roomIdRef.current = roomId;
    userIdRef.current = userId;
    roleRef.current = role;
    otherUserIdRef.current = otherUserId;
  }, [roomId, userId, role, otherUserId]);

  // ==================== 1. FETCH HISTORY ====================
  const fetchMessages = useCallback(async (targetRoomId) => {
    const rid = targetRoomId || roomIdRef.current;
    const uid = userIdRef.current;
    const r = roleRef.current;
    if (!rid || !uid) return;
    try {
      setLoading(true);
      const res = await fetch(`${SOCKET_URL}/api/chat/history/${rid}?userId=${uid}&role=${r}`);
      if (!res.ok) { setMessages([]); return; }
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
      else setMessages([]);
    } catch (err) {
      console.error("[useChat] Fetch error:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roomId && userId) {
      setMessages([]);
      fetchMessages(roomId);
    }
  }, [roomId, userId, fetchMessages]);

  // ==================== 2. SOCKET INITIALIZATION ====================
  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        transports: ["websocket"],
      });
    }
    setSocket(globalSocket);
  }, []);

  // ==================== 3. SOCKET EVENT HANDLERS ====================
  const handleReceiveMessage = useCallback((msg) => {
    if (String(msg.roomId) === String(roomIdRef.current)) {
      setMessages((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        if (safePrev.some((m) => String(m._id) === String(msg._id))) return safePrev;
        return [...safePrev, msg];
      });
    }
  }, []);

  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    // leave previous room before joining new one
    if (prevRoomRef.current && prevRoomRef.current !== roomId) {
      socket.emit("leaveRoom", { roomId: prevRoomRef.current, userId });
    }
    prevRoomRef.current = roomId;

    socket.emit("registerUser", { userId, role });
    socket.emit("joinRoom", { roomId, userId, role });
    if (role === "support") socket.emit("joinSupport");

    const handleTyping = ({ roomId: tRoom, userName: tName, userId: tId }) => {
      if (tRoom === roomIdRef.current && tId !== userIdRef.current) {
        setTypingUser(tName || "Someone");
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTypingUser(null), 3000);
      }
    };

    const handleStopTyping = ({ roomId: tRoom }) => {
      if (tRoom === roomIdRef.current) setTypingUser(null);
    };

    const handleSeen = ({ roomId: sRoom }) => {
      if (sRoom === roomIdRef.current) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === String(userIdRef.current) ? { ...m, isRead: true } : m
          )
        );
      }
    };

    const handleUserStatus = ({ userId: uId, status }) => {
      setOnlineStatus((prev) => ({ ...prev, [uId]: status }));
    };

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
      setMessages(prev => [...prev, {
        _id: "call_" + Date.now(), roomId: roomIdRef.current,
        senderId: data.fromUserId, senderName: "Caller", senderRole: "call",
        message: "Incoming Call", messageType: "call", isRead: false, createdAt: new Date()
      }]);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);
    socket.on("messagesSeen", handleSeen);
    socket.on("userStatus", handleUserStatus);
    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(answer);
        setCallActive(true);
      }
    });
    socket.on("callEnded", () => endCall());
    socket.on("iceCandidate", async ({ candidate }) => {
      if (peerRef.current) await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
      socket.off("messagesSeen", handleSeen);
      socket.off("userStatus", handleUserStatus);
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("iceCandidate");
    };
  }, [roomId, userId, role, socket, handleReceiveMessage]);

  // ==================== 4. SEND MESSAGE ====================
  const sendMessage = useCallback(async (text, fileUrl = null, messageType = "text") => {
    if (!text?.trim() && !fileUrl) return;
    const payload = {
      roomId: roomIdRef.current,
      senderId: String(userIdRef.current),
      senderName: userName,
      senderRole: roleRef.current,
      message: text || "",
      messageType,
      fileUrl,
      chatType,
      passengerId: chatType === "support"
        ? (roleRef.current === "support"
          ? (otherUserIdRef.current || roomIdRef.current?.replace("support_", ""))
          : String(userIdRef.current))
        : (roleRef.current === "passenger" ? String(userIdRef.current) : otherUserIdRef.current),
      riderId: chatType === "ride"
        ? (roleRef.current === "rider" ? String(userIdRef.current) : otherUserIdRef.current)
        : null,
    };
    try {
      setSendError(null);
      const res = await fetch(`${SOCKET_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const savedMsg = await res.json();
      if (String(savedMsg.roomId) === String(roomIdRef.current)) {
        setMessages((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          if (safePrev.some((m) => String(m._id) === String(savedMsg._id))) return safePrev;
          return [...safePrev, savedMsg];
        });
      }
    } catch (err) {
      setSendError(err.message);
    }
  }, [chatType, userName]);

  // ==================== 5. CALL LOGIC ====================
  const createPeer = (targetUserId) => {
    peerRef.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) globalSocket?.emit("iceCandidate", { toUserId: targetUserId, candidate: e.candidate });
    };
    peerRef.current.ontrack = (e) => { remoteStreamRef.current = e.streams[0]; setCallActive(true); };
  };

  const startCall = async (targetUserId) => {
    createPeer(targetUserId);
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current.getTracks().forEach(t => peerRef.current.addTrack(t, localStreamRef.current));
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    globalSocket?.emit("callUser", { toUserId: targetUserId, fromUserId: userIdRef.current, offer });
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    const { fromUserId, offer } = incomingCall;
    createPeer(fromUserId);
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current.getTracks().forEach(t => peerRef.current.addTrack(t, localStreamRef.current));
    await peerRef.current.setRemoteDescription(offer);
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);
    globalSocket?.emit("answerCall", { toUserId: fromUserId, answer });
    setIncomingCall(null);
    setCallActive(true);
  };

  const endCall = () => {
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    remoteStreamRef.current = null;
    setIncomingCall(null);
    setCallActive(false);
  };

  // ==================== 6. UTILITIES ====================
  const sendTyping = () => socket?.emit("typing", { roomId: roomIdRef.current, userId: userIdRef.current, userName });
  const stopTyping = () => socket?.emit("stopTyping", { roomId: roomIdRef.current, userId: userIdRef.current });
  const markAsRead = useCallback(() => {
    socket?.emit("markAsRead", { roomId: roomIdRef.current, userId: userIdRef.current });
  }, [socket]);
  const clearSendError = () => setSendError(null);

  return {
    messages,
    sendMessage,
    fetchMessages,
    typingUser,
    sendTyping,
    stopTyping,
    markAsRead,
    startCall,
    acceptCall,
    endCall,
    incomingCall,
    callActive,
    localStreamRef,
    remoteStreamRef,
    onlineStatus,
    loading,
    socket,
    sendError,
    clearSendError,
  };
};
