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

  // WebRTC Refs
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);

  const typingTimeout = useRef(null);

  // Refs for stable callbacks (Avoids stale closures)
  const refs = useRef({ roomId, userId, role, otherUserId });
  useEffect(() => {
    refs.current = { roomId, userId, role, otherUserId };
  }, [roomId, userId, role, otherUserId]);

  // ==================== 1. FETCH HISTORY ====================
  const fetchMessages = useCallback(async (targetRoomId) => {
    const rid = targetRoomId || refs.current.roomId;
    if (!rid || !refs.current.userId) return;

    try {
      setLoading(true);
      const res = await fetch(`${SOCKET_URL}/api/chat/history/${rid}?userId=${refs.current.userId}&role=${refs.current.role}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (err) {
      console.error("[useChat] Fetch error:", err);
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
        transports: ["websocket"],
        reconnection: true,
      });
    }
    setSocket(globalSocket);
  }, []);

  // ==================== 3. SOCKET EVENT HANDLERS ====================
  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    socket.emit("registerUser", { userId, role });
    socket.emit("joinRoom", { roomId });

    const handleReceiveMessage = (msg) => {
      if (String(msg.roomId) === String(refs.current.roomId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleTyping = ({ roomId: tRoom, userName: tName, userId: tId }) => {
      if (tRoom === refs.current.roomId && tId !== refs.current.userId) {
        setTypingUser(tName);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTypingUser(null), 3000);
      }
    };

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
      // Auto-message for call log
      const callLog = { _id: Date.now(), message: "Incoming call...", messageType: "call", senderName: "System", createdAt: new Date() };
      setMessages(prev => [...prev, callLog]);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", () => setTypingUser(null));
    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", async ({ answer }) => {
      if (peerRef.current) await peerRef.current.setRemoteDescription(answer);
      setCallActive(true);
    });
    socket.on("callEnded", () => endCall());
    socket.on("iceCandidate", async ({ candidate }) => {
      if (peerRef.current) await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStopTyping");
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("iceCandidate");
    };
  }, [socket, roomId, userId, role]);

  // ==================== 4. ACTIONS (Send, Call, etc.) ====================

  const sendMessage = useCallback(async (text, fileUrl = null, messageType = "text") => {
    if (!text?.trim() && !fileUrl) return;

    const payload = {
      roomId: refs.current.roomId,
      senderId: refs.current.userId,
      senderName: userName,
      senderRole: refs.current.role,
      message: text || "",
      messageType,
      fileUrl,
      chatType,
      receiverId: otherUserId // গুরুত্বপূর্ণ: নোটিফিকেশনের জন্য
    };

    try {
      const res = await fetch(`${SOCKET_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Send failed");
    } catch (err) {
      setSendError(err.message);
    }
  }, [userName, chatType, otherUserId]);

  // WebRTC Logic (Basic)
  const startCall = async (targetUserId) => {
    peerRef.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current.getTracks().forEach(track => peerRef.current.addTrack(track, localStreamRef.current));

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("iceCandidate", { toUserId: targetUserId, candidate: e.candidate });
    };

    peerRef.current.ontrack = (e) => { remoteStreamRef.current = e.streams[0]; setCallActive(true); };

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit("callUser", { toUserId: targetUserId, fromUserId: refs.current.userId, offer });
  };

  const endCall = () => {
    if (peerRef.current) peerRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    setCallActive(false);
    setIncomingCall(null);
  };

  const sendTyping = () => socket?.emit("typing", { roomId: refs.current.roomId, userId: refs.current.userId, userName });

  return {
    messages,
    sendMessage,
    typingUser,
    sendTyping,
    startCall,
    endCall,
    incomingCall,
    callActive,
    loading,
    sendError,
    localStreamRef,
    remoteStreamRef
  };
};

// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import io from "socket.io-client";

// const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

// let globalSocket;

// export const useChat = (roomId, chatType, userId, userName, role, otherUserId = null) => {
//   const [messages, setMessages] = useState([]);
//   const [typingUser, setTypingUser] = useState(null);
//   const [onlineStatus, setOnlineStatus] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [sendError, setSendError] = useState(null);
//   const [socket, setSocket] = useState(null);

//   // -------
//   const peerRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const remoteStreamRef = useRef(null);
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [callActive, setCallActive] = useState(false);
//   // --------
//   const typingTimeout = useRef(null);
//   const roomIdRef = useRef(roomId);
//   const userIdRef = useRef(userId);
//   const roleRef = useRef(role);
//   const otherUserIdRef = useRef(otherUserId);

//   // Keep refs in sync for use in stable callbacks
//   useEffect(() => {
//     roomIdRef.current = roomId;
//     userIdRef.current = userId;
//     roleRef.current = role;
//     otherUserIdRef.current = otherUserId;
//   }, [roomId, userId, role, otherUserId]);

//   // Independent of socket connection for better reliability
//   const fetchMessages = useCallback(async (targetRoomId) => {
//     const rid = targetRoomId || roomIdRef.current;
//     const uid = userIdRef.current;
//     const r = roleRef.current;

//     if (!rid || !uid) {
//       console.log("[useChat] Skipping fetch - missing rid or uid:", { rid, uid });
//       return;
//     }

//     try {
//       setLoading(true);
//       const url = `${SOCKET_URL}/api/chat/history/${rid}?userId=${uid}&role=${r}`;
//       console.log("[useChat] Fetching history:", url);

//       const res = await fetch(url);
//       if (!res.ok) {
//         console.error("[useChat] History fetch failed:", res.status);
//         setMessages([]);
//         return;
//       }

//       const data = await res.json();
//       console.log("[useChat] History received:", data?.length, "messages");

//       if (Array.isArray(data)) {
//         setMessages(data);
//       } else {
//         console.error("[useChat] History data is not an array:", data);
//         setMessages([]);
//       }
//     } catch (err) {
//       console.error("[useChat] Fetch error:", err);
//       setMessages([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Fetch when room or user changes
//   useEffect(() => {
//     if (roomId && userId) {
//       setMessages([]);
//       fetchMessages(roomId);
//     }
//   }, [roomId, userId, fetchMessages]);

//   // ==================== 2. SOCKET INITIALIZATION ====================
//   useEffect(() => {
//     if (!globalSocket) {
//       globalSocket = io(SOCKET_URL, {
//         autoConnect: true,
//         reconnection: true,
//         transports: ["websocket"],
//       });
//     }
//     setSocket(globalSocket);
//   }, []);

//   // ====== 3. RECEIVE MESSAGE HANDLER ====================
//   const handleReceiveMessage = useCallback((msg) => {
//     // Only add if it belongs to the current room
//     if (String(msg.roomId) === String(roomIdRef.current)) {
//       setMessages((prev) => {
//         const safePrev = Array.isArray(prev) ? prev : [];
//         if (safePrev.some((m) => String(m._id) === String(msg._id))) return safePrev;
//         return [...safePrev, msg];
//       });
//     }
//   }, []);

//   // ======= 4. ROOM MANAGEMENT & EVENTS ====================
//   useEffect(() => {
//     if (!socket || !roomId || !userId) return;

//     // Join room
//     socket.emit("registerUser", { userId, role });
//     socket.emit("joinRoom", { roomId, userId, role });

//     if (role === "support") {
//       socket.emit("joinSupport");
//     }

//     // Event Listeners
//     const handleTyping = ({ roomId: tRoom, userName: tName }) => {
//       if (tRoom === roomIdRef.current) {
//         setTypingUser(tName || "Someone");
//         if (typingTimeout.current) clearTimeout(typingTimeout.current);
//         typingTimeout.current = setTimeout(() => setTypingUser(null), 3000);
//       }
//     };



//     const handleStopTyping = ({ roomId: tRoom }) => {
//       if (tRoom === roomIdRef.current) setTypingUser(null);
//     };

//     const handleSeen = ({ roomId: sRoom }) => {
//       if (sRoom === roomIdRef.current) {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.senderId === String(userIdRef.current) ? { ...m, isRead: true } : m
//           )
//         );
//       }
//     };

//     const handleUserStatus = ({ userId: uId, status }) => {
//       setOnlineStatus((prev) => ({ ...prev, [uId]: status }));
//     };

//     // ================= CALL EVENTS =================

//     socket.on("incomingCall", (data) => {
//       setIncomingCall(data);

//       // chat list এ incoming call add
//       const callMsg = {
//         _id: "call_" + Date.now(),
//         roomId: roomIdRef.current,
//         senderId: data.fromUserId,
//         senderName: "Caller",
//         senderRole: "call",
//         message: "Incoming Call",
//         messageType: "call",
//         isRead: false,
//         createdAt: new Date()
//       };

//       setMessages(prev => [...prev, callMsg]);
//     });

//     socket.on("callAccepted", async ({ answer }) => {
//       if (peerRef.current) {
//         await peerRef.current.setRemoteDescription(answer);
//         setCallActive(true);

//         const callMsg = {
//           _id: "call_" + Date.now(),
//           roomId: roomIdRef.current,
//           senderId: userIdRef.current,
//           senderRole: "call",
//           message: "Call Connected",
//           messageType: "call",
//           createdAt: new Date()
//         };

//         setMessages(prev => [...prev, callMsg]);
//       }
//     });

//     socket.on("callEnded", () => {

//       const callMsg = {
//         _id: "call_" + Date.now(),
//         roomId: roomIdRef.current,
//         senderId: userIdRef.current,
//         senderRole: "call",
//         message: "Call Ended",
//         messageType: "call",
//         createdAt: new Date()
//       };

//       setMessages(prev => [...prev, callMsg]);

//       endCall();
//     });

//     socket.on("receiveMessage", handleReceiveMessage);
//     socket.on("userTyping", handleTyping);
//     socket.on("userStopTyping", handleStopTyping);
//     socket.on("messagesSeen", handleSeen);
//     socket.on("userStatus", handleUserStatus);

//     return () => {
//       socket.emit("leaveRoom", { roomId, userId });

//       socket.off("receiveMessage", handleReceiveMessage);
//       socket.off("userTyping", handleTyping);
//       socket.off("userStopTyping", handleStopTyping);
//       socket.off("messagesSeen", handleSeen);
//       socket.off("userStatus", handleUserStatus);

//       socket.off("incomingCall");
//       socket.off("callAccepted");
//       socket.off("callEnded");
//     };
//   }, [roomId, userId, role, socket, handleReceiveMessage]);

//   // ==================== 5. SEND MESSAGE ====================
//   const sendMessage = useCallback(async (text, fileUrl = null, messageType = "text") => {
//     if (!text?.trim() && !fileUrl) return;

//     const currentUid = String(userIdRef.current);
//     const currentRoom = roomIdRef.current;
//     const currentOtherId = otherUserIdRef.current;

//     const payload = {
//       roomId: currentRoom,
//       senderId: currentUid,
//       senderName: userName,
//       senderRole: role,
//       message: text || "",
//       messageType,
//       fileUrl,
//       chatType,
//       passengerId: chatType === "support"
//         ? (role === "support" ? (currentOtherId || currentRoom.replace("support_", "")) : currentUid)
//         : (role === "passenger" ? currentUid : currentOtherId),
//       riderId: chatType === "ride"
//         ? (role === "rider" ? currentUid : currentOtherId)
//         : null,
//     };

//     try {
//       setSendError(null);
//       const res = await fetch(`${SOCKET_URL}/api/chat/send`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Failed to send message");
//       const savedMsg = await res.json();

//       // Optimistic update (guarded by roomId check)
//       if (String(savedMsg.roomId) === String(roomIdRef.current)) {
//         setMessages((prev) => {
//           const safePrev = Array.isArray(prev) ? prev : [];
//           if (safePrev.some((m) => String(m._id) === String(savedMsg._id))) return safePrev;
//           return [...safePrev, savedMsg];
//         });
//       }
//     } catch (err) {
//       setSendError(err.message);
//       console.error("[useChat] Send error:", err);
//     }
//   }, [chatType, role, userName]);

//   // ==================== PEER CREATION ====================

//   const createPeer = (targetUserId) => {

//     peerRef.current = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
//     });

//     peerRef.current.onicecandidate = (event) => {

//       if (event.candidate) {

//         // socket.emit("iceCandidate", {
//         //   toUserId: targetUserId,
//         //   candidate: event.candidate
//         // });
//         globalSocket.emit("iceCandidate", {
//           toUserId: targetUserId,
//           candidate: event.candidate
//         });

//       }

//     };

//     peerRef.current.ontrack = (event) => {

//       remoteStreamRef.current = event.streams[0];
//       setCallActive(true);

//     };

//   };

//   // ==================== START CALL ====================

//   const startCall = async (targetUserId) => {

//     createPeer(targetUserId);

//     localStreamRef.current = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true
//     });

//     localStreamRef.current.getTracks().forEach(track => {
//       peerRef.current.addTrack(track, localStreamRef.current);
//     });

//     const offer = await peerRef.current.createOffer();
//     await peerRef.current.setLocalDescription(offer);

//     socket.emit("callUser", {
//       toUserId: targetUserId,
//       fromUserId: userIdRef.current,
//       offer
//     });

//     // chat list এ call start message
//     const callMsg = {
//       _id: "call_" + Date.now(),
//       roomId: roomIdRef.current,
//       senderId: userIdRef.current,
//       senderRole: "call",
//       message: "Outgoing Call",
//       messageType: "call",
//       createdAt: new Date()
//     };

//     setMessages(prev => [...(Array.isArray(prev) ? prev : []), callMsg]);
//   };

//   // ==================== ACCEPT CALL ====================

//   const acceptCall = async () => {

//     if (!incomingCall) return;

//     const { fromUserId, offer } = incomingCall;

//     createPeer(fromUserId);

//     localStreamRef.current = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true
//     });

//     localStreamRef.current.getTracks().forEach(track => {
//       peerRef.current.addTrack(track, localStreamRef.current);
//     });

//     await peerRef.current.setRemoteDescription(offer);

//     const answer = await peerRef.current.createAnswer();
//     await peerRef.current.setLocalDescription(answer);

//     socket.emit("answerCall", {
//       toUserId: fromUserId,
//       answer
//     });

//     setIncomingCall(null);
//     setCallActive(true);

//   };

//   // ==================== END CALL ====================

//   const endCall = () => {

//     if (peerRef.current) {
//       peerRef.current.close();
//       peerRef.current = null;
//     }

//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(track => track.stop());
//       localStreamRef.current = null;
//     }

//     remoteStreamRef.current = null;

//     setIncomingCall(null);
//     setCallActive(false);

//   };
//   // ==================== 6. UTILITIES ====================
//   const sendTyping = () => socket?.emit("typing", { roomId: roomIdRef.current, userId: userIdRef.current, userName });
//   const stopTyping = () => socket?.emit("stopTyping", { roomId: roomIdRef.current, userId: userIdRef.current });
//   const markAsRead = useCallback(() => {
//     socket?.emit("markAsRead", { roomId: roomIdRef.current, userId: userIdRef.current });
//   }, [socket]);

//   return {
//     messages,
//     sendMessage,
//     fetchMessages,
//     typingUser,
//     sendTyping,
//     stopTyping,
//     markAsRead,
//     startCall,
//     acceptCall,
//     endCall,
//     incomingCall,
//     callActive,
//     localStreamRef,
//     remoteStreamRef,
//     onlineStatus,
//     loading,
//     socket,
//     sendError,
//     clearSendError: () => setSendError(null),
//   };
// };
