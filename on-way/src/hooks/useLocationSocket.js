"use client";
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for real-time location updates via WebSocket
 * @param {Object} options - Configuration options
 * @returns {Object} Socket connection and methods
 */
export const useLocationSocket = (options = {}) => {
  const {
    socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4001',
    autoConnect = true,
    onLocationUpdate = null,
    onDriverLocationUpdate = null,
    onRideStatusUpdate = null
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    const initSocket = () => {
      try {
        socketRef.current = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 10000
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
          console.log('🔌 Location socket connected:', socket.id);
          setIsConnected(true);
          setConnectionError(null);
        });

        socket.on('disconnect', (reason) => {
          console.log('🔌 Location socket disconnected:', reason);
          setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
          console.error('❌ Location socket connection error:', error);
          setConnectionError(error.message);
          setIsConnected(false);
        });

        // Location update events
        socket.on('locationUpdate', (data) => {
          console.log('📍 Location update received:', data);
          onLocationUpdate?.(data);
        });

        socket.on('driverLocationUpdate', (data) => {
          console.log('🚗 Driver location update:', data);
          onDriverLocationUpdate?.(data);
        });

        socket.on('rideStatusUpdate', (data) => {
          console.log('🚖 Ride status update:', data);
          onRideStatusUpdate?.(data);
        });

        // Error handling
        socket.on('error', (error) => {
          console.error('❌ Socket error:', error);
          setConnectionError(error.message || 'Socket error occurred');
        });

      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setConnectionError(error.message);
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [socketUrl, autoConnect, onLocationUpdate, onDriverLocationUpdate, onRideStatusUpdate]);

  // Join a specific ride room for real-time updates
  const joinRideRoom = (rideId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('joinRide', rideId);
      console.log(`🏠 Joined ride room: ${rideId}`);
    }
  };

  // Leave a ride room
  const leaveRideRoom = (rideId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leaveRide', rideId);
      console.log(`🚪 Left ride room: ${rideId}`);
    }
  };

  // Send location update
  const sendLocationUpdate = (locationData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('locationUpdate', {
        ...locationData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  };

  // Send driver location update
  const sendDriverLocationUpdate = (driverData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('driverLocationUpdate', {
        ...driverData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  };

  // Send ride status update
  const sendRideStatusUpdate = (statusData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('rideStatusUpdate', {
        ...statusData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  };

  // Manually connect socket
  const connect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };

  // Manually disconnect socket
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return {
    isConnected,
    connectionError,
    socket: socketRef.current,
    joinRideRoom,
    leaveRideRoom,
    sendLocationUpdate,
    sendDriverLocationUpdate,
    sendRideStatusUpdate,
    connect,
    disconnect
  };
};

export default useLocationSocket;