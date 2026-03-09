"use client";

import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
});

export const useChat = (roomId, chatType, userId, userName, role) => {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState({});

  // ======================
  // FETCH MESSAGES
  // ======================

  const fetchMessages = useCallback(async (rId = roomId) => {
    if (!rId) return;

    try {
      setLoading(true);

      const res = await fetch(`${SOCKET_URL}/api/chat/history/${rId}`);
      const data = await res.json();

      setMessages(data || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // ======================
  // SOCKET CONNECT
  // ======================

  useEffect(() => {
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("registerUser", { userId });

  }, [userId]);

  // ======================
  // ROOM JOIN
  // ======================

  useEffect(() => {
    if (!roomId || !userId) return;

    socket.emit("joinRoom", { roomId, userId, role });

    fetchMessages(roomId);

    return () => {
      socket.emit("leaveRoom", { roomId });
    };

  }, [roomId, userId, role, fetchMessages]);

  // ======================
  // SOCKET LISTENERS
  // ======================

  useEffect(() => {
    if (!roomId) return;

    const handleReceiveMessage = (msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);

        if (msg.senderId !== userId) {
          markAsRead();
        }
      }
    };

    const handleTyping = ({ userName: typingName }) => {
      setTypingUser(typingName);
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    const handleSeen = ({ userId: seenBy }) => {
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

  // ======================
  // SEND MESSAGE
  // ======================

  const sendMessage = useCallback(
    async (text, fileUrl = null, messageType = "text") => {

      if (!text?.trim() && !fileUrl) return;

      const payload = {
        roomId,
        senderId: userId,
        senderName: userName,
        senderRole: role,
        message: text,
        messageType,
        fileUrl,
        chatType,
      };

      try {
        const res = await fetch(`${SOCKET_URL}/api/chat/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const savedMessage = await res.json();

        setMessages((prev) => [...prev, savedMessage]);

      } catch (err) {
        console.error("Message send failed:", err);
      }
    },
    [roomId, userId, userName, role, chatType]
  );

  // ======================
  // TYPING
  // ======================

  const sendTyping = () => {
    if (roomId) {
      socket.emit("typing", { roomId, userId, userName });
    }
  };

  const stopTyping = () => {
    if (roomId) {
      socket.emit("stopTyping", { roomId });
    }
  };

  // ======================
  // READ STATUS
  // ======================

  const markAsRead = () => {
    if (roomId) {
      socket.emit("markAsRead", { roomId, userId });
    }
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

