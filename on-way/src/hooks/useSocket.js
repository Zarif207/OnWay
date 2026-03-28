import { useEffect, useState, useCallback } from 'react';
import { getPassengerSocket, getRiderSocket } from '@/lib/socket';
import { useSession } from 'next-auth/react';

/**
 * Custom hook for unified Socket.io management.
 * @param {string} role - 'user'/'passenger' or 'rider'
 * @returns {Object} { socket, connected, emit, on, off }
 */
export const useSocket = (role) => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!session?.user?.id || !role) return;

        const userId = session.user.id;
        const currentSocket = (role === 'passenger' || role === 'user') ? getPassengerSocket(userId) : getRiderSocket(userId);

        setSocket(currentSocket);

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        currentSocket.on('connect', onConnect);
        currentSocket.on('disconnect', onDisconnect);

        if (currentSocket.connected) setConnected(true);

        return () => {
            currentSocket.off('connect', onConnect);
            currentSocket.off('disconnect', onDisconnect);
        };
    }, [session, role]);

    const emit = useCallback((event, data) => {
        if (socket) socket.emit(event, data);
    }, [socket]);

    const on = useCallback((event, callback) => {
        if (socket) socket.on(event, callback);
    }, [socket]);

    const off = useCallback((event, callback) => {
        if (socket) socket.off(event, callback);
    }, [socket]);

    return { socket, connected, emit, on, off };
};
