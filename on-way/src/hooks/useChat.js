"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:4002";

// ── Shared socket instance ───────────────────────────────────
let sharedSocket = null;
let socketRefCount = 0;

function getSocket() {
  if (!sharedSocket || !sharedSocket.connected) {
    sharedSocket = io(CHAT_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    });
  }
  socketRefCount++;
  return sharedSocket;
}

function releaseSocket() {
  socketRefCount--;
  if (socketRefCount <= 0 && sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
    socketRefCount = 0;
  }
}

// ── TURN / STUN servers ──────────────────────────────────────
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

// ════════════════════════════════════════════════════════════
export const useChat = (
  roomId,
  chatType,
  userId,
  userName,
  role,
  otherUserId = null,
  chatSubRole = null   // "rider" | "passenger" — support agent reply routing
) => {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [socket, setSocket] = useState(null);

  // ── WebRTC state ─────────────────────────────────────────────
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callError, setCallError] = useState(null);

  // ── Refs (stable, no stale closures) ─────────────────────────
  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);
  const roleRef = useRef(role);
  const otherUserIdRef = useRef(otherUserId);
  const userNameRef = useRef(userName);
  const chatTypeRef = useRef(chatType);
  const chatSubRoleRef = useRef(chatSubRole);
  const prevRoomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTm = useRef(null);
  // ✅ store call target after accept so endCall works correctly
  const callTargetRef = useRef(null);

  useEffect(() => {
    roomIdRef.current = roomId;
    userIdRef.current = userId;
    roleRef.current = role;
    otherUserIdRef.current = otherUserId;
    userNameRef.current = userName;
    chatTypeRef.current = chatType;
    chatSubRoleRef.current = chatSubRole;
  }, [roomId, userId, role, otherUserId, userName, chatType, chatSubRole]);

  // ══════════════════════════════════════════════════════════════
  //  1. FETCH HISTORY
  // ══════════════════════════════════════════════════════════════
  const fetchMessages = useCallback(async (targetRoomId) => {
    const rid = targetRoomId || roomIdRef.current;
    const uid = userIdRef.current;
    const r = roleRef.current;
    if (!rid || !uid) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${CHAT_URL}/api/chat/history/${rid}?userId=${uid}&role=${r}`
      );
      if (!res.ok) { setMessages([]); return; }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[useChat] fetchMessages:", err);
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

  // ══════════════════════════════════════════════════════════════
  //  2. SOCKET INIT
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    const sock = getSocket();
    setSocket(sock);
    socketRef.current = sock;
    return () => releaseSocket();
  }, []);

  // ══════════════════════════════════════════════════════════════
  //  3. REGISTER + JOIN ROOM
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!socket || !userId) return;
    socket.emit("registerUser", { userId: String(userId), role });
    if (role === "support") socket.emit("joinSupport");
  }, [socket, userId, role]);

  useEffect(() => {
    if (!socket || !roomId) return;
    if (prevRoomRef.current && prevRoomRef.current !== roomId) {
      socket.emit("leaveRoom", {
        roomId: prevRoomRef.current,
        userId: userIdRef.current,
      });
    }
    prevRoomRef.current = roomId;
    socket.emit("joinRoom", { roomId });
  }, [socket, roomId]);

  // ══════════════════════════════════════════════════════════════
  //  4. WEBRTC — define BEFORE socket listeners
  // ══════════════════════════════════════════════════════════════

  // ── Cleanup ───────────────────────────────────────────────────
  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    remoteStreamRef.current = null;
    callTargetRef.current = null;
    setIncomingCall(null);
    setCallActive(false);
    setCalling(false);
  }, []);

  // ── Create peer ───────────────────────────────────────────────
  const createPeer = useCallback((targetUserId) => {
    if (peerRef.current) { peerRef.current.close(); peerRef.current = null; }

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    peer.onicecandidate = (e) => {
      if (!e.candidate) return;
      socketRef.current?.emit("iceCandidate", {
        toUserId: String(targetUserId),
        candidate: e.candidate,
      });
    };

    peer.oniceconnectionstatechange = () => {
      const s = peer.iceConnectionState;
      console.log("[WebRTC] ICE:", s);
      if (s === "disconnected" || s === "failed" || s === "closed") {
        cleanupCall();
      }
    };

    peer.ontrack = (e) => {
      console.log("[WebRTC] ontrack");
      if (e.streams?.[0]) {
        remoteStreamRef.current = e.streams[0];
        setCalling(false);
        setCallActive(true);
      }
    };

    peerRef.current = peer;
    return peer;
  }, [cleanupCall]);

  // ── Get media ─────────────────────────────────────────────────
  const getMedia = async (options) => {
    const constraints = options?.video === false
      ? { video: false, audio: true }
      : { video: { facingMode: "user" }, audio: true };
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch {
      console.warn("[WebRTC] camera failed, trying audio only");
      return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    }
  };

  // ── Start call ────────────────────────────────────────────────
  const startCall = useCallback(async (
    targetUserId,
    options = { video: true, audio: true }
  ) => {
    const sock = socketRef.current;
    if (!sock || !targetUserId) return;
    console.log("[useChat] startCall →", targetUserId, options);
    try {
      setCalling(true);
      callTargetRef.current = String(targetUserId);

      const peer = createPeer(targetUserId);
      const stream = await getMedia(options);
      localStreamRef.current = stream;
      stream.getTracks().forEach(t => peer.addTrack(t, stream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      sock.emit("callUser", {
        toUserId: String(targetUserId),
        fromUserId: String(userIdRef.current),
        fromUserName: userNameRef.current,   // ✅ caller-এর নাম পাঠাও
        offer,
        callType: options?.video === false ? "audio" : "video",
      });
    } catch (err) {
      console.error("[useChat] startCall error:", err);
      setCalling(false);
      cleanupCall();
    }
  }, [createPeer, cleanupCall]);

  // ── Accept call ───────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    const sock = socketRef.current;
    if (!incomingCall || !sock) return;
    const { fromUserId, offer, callType } = incomingCall;
    console.log("[useChat] acceptCall from:", fromUserId);
    try {
      // ✅ store target BEFORE clearing incomingCall
      callTargetRef.current = String(fromUserId);

      const peer = createPeer(fromUserId);
      const options = callType === "audio"
        ? { video: false, audio: true }
        : { video: true, audio: true };

      const stream = await getMedia(options);
      localStreamRef.current = stream;
      stream.getTracks().forEach(t => peer.addTrack(t, stream));

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      sock.emit("answerCall", { toUserId: String(fromUserId), answer });

      setIncomingCall(null);
      setCallActive(true);
    } catch (err) {
      console.error("[useChat] acceptCall error:", err);
      cleanupCall();
    }
  }, [incomingCall, createPeer, cleanupCall]);

  // ── End call ──────────────────────────────────────────────────
  const endCall = useCallback(() => {
    const sock = socketRef.current;
    // ✅ use callTargetRef — works even after incomingCall is cleared
    const targetId = callTargetRef.current || otherUserIdRef.current;
    if (sock && targetId) {
      sock.emit("endCall", { toUserId: String(targetId) });
    }
    cleanupCall();
  }, [cleanupCall]);

  // ══════════════════════════════════════════════════════════════
  //  5. SOCKET EVENT LISTENERS (after WebRTC defined)
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      if (String(msg.roomId) !== String(roomIdRef.current)) return;
      setMessages(prev => {
        const safe = Array.isArray(prev) ? prev : [];
        if (safe.some(m => String(m._id) === String(msg._id))) return safe;
        return [...safe, msg];
      });
    };

    const onTyping = ({ roomId: r, userName: n, userId: uid }) => {
      if (r !== roomIdRef.current) return;
      if (String(uid) === String(userIdRef.current)) return;
      setTypingUser(n || "Someone");
      if (typingTm.current) clearTimeout(typingTm.current);
      typingTm.current = setTimeout(() => setTypingUser(null), 3000);
    };

    const onStopTyping = ({ roomId: r }) => {
      if (r === roomIdRef.current) setTypingUser(null);
    };

    const onSeen = ({ roomId: r }) => {
      if (r !== roomIdRef.current) return;
      setMessages(prev =>
        prev.map(m =>
          String(m.senderId) === String(userIdRef.current)
            ? { ...m, isRead: true } : m
        )
      );
    };

    const onUserStatus = ({ userId: uid, status }) => {
      setOnlineStatus(prev => ({ ...prev, [String(uid)]: status }));
    };

    const onOnlineUsersList = (list) => {
      if (!Array.isArray(list)) return;
      const map = {};
      list.forEach(({ userId: uid, status }) => { map[String(uid)] = status; });
      setOnlineStatus(prev => ({ ...prev, ...map }));
    };

    const onIncomingCall = ({ fromUserId, fromUserName, offer, callType }) => {
      console.log("[useChat] incomingCall from:", fromUserId, fromUserName);
      setIncomingCall({ fromUserId, fromUserName, offer, callType });
    };

    const onCallAccepted = async ({ answer }) => {
      console.log("[useChat] callAccepted");
      if (!peerRef.current) return;
      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        setCalling(false);
        setCallActive(true);
      } catch (err) {
        console.error("[useChat] setRemoteDescription:", err);
      }
    };

    // ✅ cleanupCall is defined before this useEffect
    const onCallFailed = ({ reason }) => {
      console.warn("[useChat] callFailed:", reason);
      setCalling(false);
      cleanupCall();
      setCallError(reason || "Call failed");
    };

    const onCallEnded = () => {
      console.log("[useChat] callEnded");
      cleanupCall();
    };

    const onIce = async ({ candidate }) => {
      if (!peerRef.current || !candidate) return;
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("[useChat] addIceCandidate:", err);
      }
    };

    // ✅ Message edited
    const onMessageEdited = (updated) => {
      setMessages(prev =>
        prev.map(m => String(m._id) === String(updated._id) ? { ...m, ...updated } : m)
      );
    };

    // ✅ Message deleted
    const onMessageDeleted = ({ _id }) => {
      setMessages(prev =>
        prev.map(m => String(m._id) === String(_id) ? { ...m, deleted: true, message: "" } : m)
      );
    };

    socket.on("receiveMessage", onMessage);
    socket.on("userTyping", onTyping);
    socket.on("userStopTyping", onStopTyping);
    socket.on("messagesSeen", onSeen);
    socket.on("userStatus", onUserStatus);
    socket.on("onlineUsersList", onOnlineUsersList);
    socket.on("incomingCall", onIncomingCall);
    socket.on("callAccepted", onCallAccepted);
    socket.on("callFailed", onCallFailed);
    socket.on("callEnded", onCallEnded);
    socket.on("iceCandidate", onIce);
    socket.on("messageEdited", onMessageEdited);
    socket.on("messageDeleted", onMessageDeleted);

    return () => {
      socket.off("receiveMessage", onMessage);
      socket.off("userTyping", onTyping);
      socket.off("userStopTyping", onStopTyping);
      socket.off("messagesSeen", onSeen);
      socket.off("userStatus", onUserStatus);
      socket.off("onlineUsersList", onOnlineUsersList);
      socket.off("incomingCall", onIncomingCall);
      socket.off("callAccepted", onCallAccepted);
      socket.off("callFailed", onCallFailed);
      socket.off("callEnded", onCallEnded);
      socket.off("iceCandidate", onIce);
      socket.off("messageEdited", onMessageEdited);
      socket.off("messageDeleted", onMessageDeleted);
    };
  }, [socket, cleanupCall]);

  // ══════════════════════════════════════════════════════════════
  //  6. SEND MESSAGE
  // ══════════════════════════════════════════════════════════════
  const sendMessage = useCallback(async (
    text,
    fileUrl = null,
    messageType = "text"
  ) => {
    if (!text?.trim() && !fileUrl) return;

    const currentRole = roleRef.current;
    const currentType = chatTypeRef.current;
    const currentRoomId = roomIdRef.current;
    const currentUserId = String(userIdRef.current);
    const currentOther = otherUserIdRef.current;
    const subRole = chatSubRoleRef.current; // "rider"|"passenger"|null

    let passengerId = null;
    let riderId = null;

    if (currentType === "ride") {
      if (currentRole === "passenger") {
        passengerId = currentUserId;
        riderId = currentOther;
      } else if (currentRole === "rider") {
        riderId = currentUserId;
        passengerId = currentOther;
      }
    }

    if (currentType === "support") {
      if (currentRole === "support") {
        // ✅ Use chatSubRole to correctly set passengerId vs riderId
        const targetId = currentOther || currentRoomId?.replace("support_", "") || null;
        if (subRole === "rider") {
          riderId = targetId;
          passengerId = null;
        } else {
          // "passenger" or null — default to passenger
          passengerId = targetId;
          riderId = null;
        }
      } else if (currentRole === "rider") {
        riderId = currentUserId;
        passengerId = null;
      } else {
        passengerId = currentUserId;
        riderId = null;
      }
    }

    const payload = {
      roomId: currentRoomId,
      senderId: currentUserId,
      senderName: userNameRef.current,
      senderRole: currentRole,
      message: text || "",
      messageType,
      fileUrl,
      chatType: currentType,
      passengerId,
      riderId,
    };

    try {
      setSendError(null);
      const res = await fetch(`${CHAT_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const saved = await res.json();
      if (String(saved.roomId) === String(currentRoomId)) {
        setMessages(prev => {
          const safe = Array.isArray(prev) ? prev : [];
          if (safe.some(m => String(m._id) === String(saved._id))) return safe;
          return [...safe, saved];
        });
      }
    } catch (err) {
      console.error("[useChat] sendMessage:", err);
      setSendError(err.message);
    }
  }, []);

  // ══════════════════════════════════════════════════════════════
  //  7. UTILITIES
  // ══════════════════════════════════════════════════════════════
  const sendTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("typing", {
      roomId: roomIdRef.current,
      userId: userIdRef.current,
      userName: userNameRef.current,
    });
  }, [socket]);

  const stopTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("stopTyping", {
      roomId: roomIdRef.current,
      userId: userIdRef.current,
    });
  }, [socket]);

  const markAsRead = useCallback(() => {
    if (!socket || !roomIdRef.current || !userIdRef.current) return;
    socket.emit("markAsRead", {
      roomId: roomIdRef.current,
      userId: userIdRef.current,
    });
  }, [socket]);

  const clearSendError = useCallback(() => setSendError(null), []);
  const clearCallError = useCallback(() => setCallError(null), []);

  // ── Edit message ──────────────────────────────────────────────
  const editMessage = useCallback(async (messageId, newText) => {
    if (!newText?.trim() || !userIdRef.current) return;
    try {
      const res = await fetch(`${CHAT_URL}/api/chat/message/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newText.trim(), userId: userIdRef.current }),
      });
      if (!res.ok) throw new Error("Edit failed");
    } catch (err) {
      console.error("[useChat] editMessage:", err);
    }
  }, []);

  // ── Delete message ────────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId) => {
    if (!userIdRef.current) return;
    try {
      const res = await fetch(`${CHAT_URL}/api/chat/message/${messageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userIdRef.current }),
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("[useChat] deleteMessage:", err);
    }
  }, []);

  // ══════════════════════════════════════════════════════════════
  //  RETURN
  // ══════════════════════════════════════════════════════════════
  return {
    messages,
    sendMessage,
    fetchMessages,
    loading,

    typingUser,
    sendTyping,
    stopTyping,

    markAsRead,

    startCall,
    acceptCall,
    endCall,
    incomingCall,
    callActive,
    calling,
    localStreamRef,
    remoteStreamRef,

    onlineStatus,
    socket,

    sendError,
    clearSendError,
    callError,
    clearCallError,

    editMessage,
    deleteMessage,
  };
};
