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

  const typingTimeout = useRef(null);
  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);
  const roleRef = useRef(role);
  const otherUserIdRef = useRef(otherUserId);

  // Keep refs in sync for use in stable callbacks
  useEffect(() => {
    roomIdRef.current = roomId;
    userIdRef.current = userId;
    roleRef.current = role;
    otherUserIdRef.current = otherUserId;
  }, [roomId, userId, role, otherUserId]);

  // Independent of socket connection for better reliability
  const fetchMessages = useCallback(async (targetRoomId) => {
    const rid = targetRoomId || roomIdRef.current;
    const uid = userIdRef.current;
    const r = roleRef.current;

    if (!rid || !uid) {
      console.log("[useChat] Skipping fetch - missing rid or uid:", { rid, uid });
      return;
    }

    try {
      setLoading(true);
      const url = `${SOCKET_URL}/api/chat/history/${rid}?userId=${uid}&role=${r}`;
      console.log("[useChat] Fetching history:", url);

      const res = await fetch(url);
      if (!res.ok) {
        console.error("[useChat] History fetch failed:", res.status);
        setMessages([]);
        return;
      }

      const data = await res.json();
      console.log("[useChat] History received:", data?.length, "messages");

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error("[useChat] History data is not an array:", data);
        setMessages([]);
      }
    } catch (err) {
      console.error("[useChat] Fetch error:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when room or user changes
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

  // ====== 3. RECEIVE MESSAGE HANDLER ====================
  const handleReceiveMessage = useCallback((msg) => {
    // Only add if it belongs to the current room
    if (String(msg.roomId) === String(roomIdRef.current)) {
      setMessages((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        if (safePrev.some((m) => String(m._id) === String(msg._id))) return safePrev;
        return [...safePrev, msg];
      });
    }
  }, []);

  // ======= 4. ROOM MANAGEMENT & EVENTS ====================
  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    // Join room
    socket.emit("registerUser", { userId, role });
    socket.emit("joinRoom", { roomId, userId, role });

    if (role === "support") {
      socket.emit("joinSupport");
    }

    // Event Listeners
    const handleTyping = ({ roomId: tRoom, userName: tName }) => {
      if (tRoom === roomIdRef.current) {
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

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);
    socket.on("messagesSeen", handleSeen);
    socket.on("userStatus", handleUserStatus);

    return () => {
      socket.emit("leaveRoom", { roomId, userId });
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
      socket.off("messagesSeen", handleSeen);
      socket.off("userStatus", handleUserStatus);
    };
  }, [roomId, userId, role, socket, handleReceiveMessage]);

  // ==================== 5. SEND MESSAGE ====================
  const sendMessage = useCallback(async (text, fileUrl = null, messageType = "text") => {
    if (!text?.trim() && !fileUrl) return;

    const currentUid = String(userIdRef.current);
    const currentRoom = roomIdRef.current;
    const currentOtherId = otherUserIdRef.current;

    const payload = {
      roomId: currentRoom,
      senderId: currentUid,
      senderName: userName,
      senderRole: role,
      message: text || "",
      messageType,
      fileUrl,
      chatType,
      passengerId: chatType === "support"
        ? (role === "support" ? (currentOtherId || currentRoom.replace("support_", "")) : currentUid)
        : (role === "passenger" ? currentUid : currentOtherId),
      riderId: chatType === "ride"
        ? (role === "rider" ? currentUid : currentOtherId)
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

      // Optimistic update (guarded by roomId check)
      if (String(savedMsg.roomId) === String(roomIdRef.current)) {
        setMessages((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          if (safePrev.some((m) => String(m._id) === String(savedMsg._id))) return safePrev;
          return [...safePrev, savedMsg];
        });
      }
    } catch (err) {
      setSendError(err.message);
      console.error("[useChat] Send error:", err);
    }
  }, [chatType, role, userName]);

  // ==================== 6. UTILITIES ====================
  const sendTyping = () => socket?.emit("typing", { roomId: roomIdRef.current, userId: userIdRef.current, userName });
  const stopTyping = () => socket?.emit("stopTyping", { roomId: roomIdRef.current, userId: userIdRef.current });
  const markAsRead = useCallback(() => {
    socket?.emit("markAsRead", { roomId: roomIdRef.current, userId: userIdRef.current });
  }, [socket]);

  return {
    messages,
    sendMessage,
    fetchMessages,
    typingUser,
    sendTyping,
    stopTyping,
    markAsRead,
    onlineStatus,
    loading,
    socket,
    sendError,
    clearSendError: () => setSendError(null),
  };
};
