import React, { createContext, useContext, useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import ChatService from '../services/ChatService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chatService: ChatService | null;
  userId: string;
}

export const ChatContext = createContext<ChatContextType>({
  chatService: null,
  userId: '',
});

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [chatService, setChatService] = useState<ChatService | null>(null);

  useEffect(() => {
    if (socket && user?.id) {
      const service = new ChatService(socket, user.id);
      setChatService(service);

      return () => {
        // Cleanup if needed
        service.leaveRoom();
      };
    }
  }, [socket, user]);

  return (
    <ChatContext.Provider
      value={{
        chatService,
        userId: user?.id || '',
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext); 