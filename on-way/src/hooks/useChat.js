"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

let socket;

export const useChat = (roomId, chatType, userId, userName, role) => {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [loading, setLoading] = useState(true);

  const typingTimeout = useRef(null);

  // ================= SOCKET INIT =================

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        transports: ["websocket"],
      });
    }

    return () => { };
  }, []);

  // ================= FETCH HISTORY =================

  const fetchMessages = useCallback(
    async (currentRoomId = roomId) => {
      if (!currentRoomId || !userId) return;

      try {
        setLoading(true);

        const res = await fetch(
          `${SOCKET_URL}/api/chat/history/${currentRoomId}?userId=${userId}`
        );

        if (!res.ok) throw new Error("History fetch failed");

        const data = await res.json();

        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("History error:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [roomId, userId]
  );

  // ================= JOIN ROOM =================

  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    socket.emit("registerUser", { userId });

    socket.emit("joinRoom", {
      roomId,
      userId,
      role,
    });

    fetchMessages(roomId);

    return () => {
      socket.emit("leaveRoom", { roomId, userId });
    };
  }, [roomId, userId, role, fetchMessages]);

  // ================= SOCKET EVENTS =================

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleReceiveMessage = (msg) => {
      if (msg.roomId !== roomId) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    };

    const handleTyping = ({ roomId: typingRoom, userName }) => {
      if (typingRoom !== roomId) return;

      setTypingUser(userName);

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      typingTimeout.current = setTimeout(() => {
        setTypingUser(null);
      }, 3000);
    };

    const handleStopTyping = ({ roomId: typingRoom }) => {
      if (typingRoom === roomId) {
        setTypingUser(null);
      }
    };

    const handleSeen = ({ roomId: seenRoom }) => {
      if (seenRoom !== roomId) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === userId ? { ...msg, isRead: true } : msg
        )
      );
    };

    const handleUserStatus = ({ userId: uId, status }) => {
      setOnlineStatus((prev) => ({
        ...prev,
        [uId]: status,
      }));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);
    socket.on("messagesSeen", handleSeen);
    socket.on("userStatus", handleUserStatus);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
      socket.off("messagesSeen", handleSeen);
      socket.off("userStatus", handleUserStatus);
    };
  }, [roomId, userId]);

  // ================= SEND MESSAGE =================

  const sendMessage = useCallback(
    async (text, fileUrl = null, messageType = "text") => {
      if ((!text || !text.trim()) && !fileUrl) return;

      const payload = {
        roomId,
        senderId: userId,
        senderName: userName,
        senderRole: role,
        message: text || "",
        messageType,
        fileUrl,
        chatType,

        passengerId:
          role === "passenger"
            ? userId
            : roomId?.includes("support_")
              ? roomId.replace("support_", "")
              : null,

        riderId: role === "rider" ? userId : null,
      };

      try {
        const res = await fetch(`${SOCKET_URL}/api/chat/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Send failed");

        const savedMessage = await res.json();

        setMessages((prev) => {
          const exists = prev.some((m) => m._id === savedMessage._id);
          if (exists) return prev;
          return [...prev, savedMessage];
        });
      } catch (err) {
        console.error("Send message error:", err);
      }
    },
    [roomId, userId, userName, role, chatType]
  );

  // ================= TYPING =================

  const sendTyping = () => {
    if (!socket || !roomId) return;

    socket.emit("typing", {
      roomId,
      userId,
      userName,
    });
  };

  const stopTyping = () => {
    if (!socket || !roomId) return;

    socket.emit("stopTyping", {
      roomId,
      userId,
    });
  };

  // ================= READ =================

  const markAsRead = () => {
    if (!socket || !roomId) return;

    socket.emit("markAsRead", {
      roomId,
      userId,
    });
  };

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
  };
};