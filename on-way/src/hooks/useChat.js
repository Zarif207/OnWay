import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

/* Singleton Socket */
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export const useChat = (roomId, chatType) => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!roomId) return;

    /* Socket Connect */
    if (!socket.connected) socket.connect();

    /* Fetch Chat History */
    const fetchHistory = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${SOCKET_URL}/api/chat/history/${roomId}`
        );

        const data = await response.json();

        if (mountedRef.current && Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error("❌ History load error:", error);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchHistory();

    /* Join Room */
    if (chatType === "ride") {
      socket.emit("joinRide", roomId);
    } else {
      socket.emit("joinSupport", roomId.replace("support_", ""));
    }

    /* Event Handlers */
    const handleMessage = (data) => {
      if (data?.roomId === roomId && data?.chatType === chatType) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleTyping = (data) => {
      if (data?.roomId === roomId && data?.chatType === chatType) {
        setTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data?.roomId === roomId && data?.chatType === chatType) {
        setTyping(false);
      }
    };

    /* Register Events */
    socket.on("receiveMessage", handleMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    /* Cleanup */
    return () => {
      mountedRef.current = false;

      socket.off("receiveMessage", handleMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, [roomId, chatType]);

  /* Actions */

  const sendMessage = (senderId, senderName, senderRole, text) => {
    if (!roomId || !text.trim()) return;

    socket.emit("sendMessage", {
      roomId,
      senderId,
      senderName: senderName || "User",
      senderRole,
      message: text,
      chatType,
    });
  };

  const sendTyping = () => {
    if (roomId) {
      socket.emit("typing", { roomId, chatType });
    }
  };

  const stopTyping = () => {
    if (roomId) {
      socket.emit("stopTyping", { roomId, chatType });
    }
  };

  return {
    messages,
    sendMessage,
    typing,
    sendTyping,
    stopTyping,
    loading,
  };
};