import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastError: string | null;
  reconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastError: null,
  reconnect: () => {},
  emit: () => {},
  on: () => {},
  off: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { user } = useAuth();

  const initializeSocket = useCallback(() => {
    if (!user) return;

    const socketInstance = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: {
        userId: user.id,
      },
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setLastError(null);
      
      // Emit presence
      socketInstance.emit('presence', { 
        userId: user.id, 
        status: 'online' 
      });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setLastError(`Connection error: ${error.message}`);
      setIsConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt reconnection
        socketInstance.connect();
      }
    });

    socketInstance.on('error', (error: Error) => {
      console.error('Socket error:', error);
      setLastError(`Socket error: ${error.message}`);
    });

    // Handle reconnection attempts
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
    });

    socketInstance.on('reconnect_failed', () => {
      setLastError('Failed to reconnect after maximum attempts');
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setLastError(null);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        // Emit offline status before disconnecting
        socketInstance.emit('presence', { 
          userId: user.id, 
          status: 'offline' 
        });
        socketInstance.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initializeSocket]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    initializeSocket();
  }, [socket, initializeSocket]);

  const emit = useCallback((event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }, [socket, isConnected]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  return (
    <SocketContext.Provider 
      value={{ 
        socket, 
        isConnected, 
        lastError,
        reconnect,
        emit,
        on,
        off,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}; 