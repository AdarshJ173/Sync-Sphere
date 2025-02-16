import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  List, 
  ListItem, 
  Typography, 
  IconButton, 
  Avatar, 
  Stack,
  Tooltip,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import { 
  IoSend, 
  IoClose,
  IoExpand,
  IoPlay,
  IoPause,
  IoAdd,
  IoCall,
  IoVideocamOutline,
  IoDocument,
} from 'react-icons/io5';
import { MediaSelector } from '../MediaSelector';
import { MediaPreviewDialog } from '../MediaPreviewDialog';
import { CallModal } from './CallModal';
// ZegoCloud integration for real-time communication features
// This service handles audio/video calls and real-time messaging
import ZegoChatService from '../../services/ZegoChatService';
import { useAuth } from '../../contexts/AuthContext';
import { ZEGO_CONFIG } from '../../config/zegoConfig';
import { StartChatDialog } from './StartChatDialog';
import { useTheme } from '../../theme/ThemeContext';
import { format, isToday, isYesterday } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';
import { useFriend } from '../../contexts/FriendContext';

// Add typing animation styles
const typingAnimationKeyframes = `
@keyframes typingDot {
  0% { opacity: 0.3; transform: translateY(0px); }
  50% { opacity: 1; transform: translateY(-2px); }
  100% { opacity: 0.3; transform: translateY(0px); }
}
`;

const typingAnimationStyles = {
  '.typing-animation': {
    display: 'inline-flex',
    gap: '2px',
    marginLeft: '4px',
    '& span': {
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor: 'text.secondary',
      display: 'inline-block',
      animation: 'typingDot 1s infinite',
      '&:nth-of-type(2)': {
        animationDelay: '0.2s',
      },
      '&:nth-of-type(3)': {
        animationDelay: '0.4s',
      },
    },
  },
};

// Insert a style tag for the keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = typingAnimationKeyframes;
  document.head.appendChild(style);
}

// Message types and interfaces
type MessageType = 'text' | 'image' | 'gif' | 'audio' | 'video' | 'document' | 'system';
type SystemActionType = 'delete_message' | 'typing_status';
type MediaType = 'image' | 'video' | 'document' | 'audio';

interface BaseMessage {
  id: string;
  user: string;
  type: MessageType;
  timestamp: Date;
  content: string;
  avatar?: string;
  reaction?: string;
}

interface MediaMetadata {
  type: 'media';
  mediaType: MediaType;
  originalSize?: { width: number; height: number };
  thumbnailUrl?: string;
  duration?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

interface SystemMetadata {
  type: 'system';
  messageId: string;
  isTyping?: boolean;
  userId?: string;
  action: SystemActionType;
}

type MessageMetadata = MediaMetadata | SystemMetadata;

interface Message extends BaseMessage {
  metadata?: MessageMetadata;
}

interface ParsedMessage extends Omit<Message, 'timestamp'> {
  timestamp: string;
}

// Mock data - replace with real data later
const mockMessages: Message[] = [];

// Add UserPresence component
const UserPresence: React.FC<{ userId: string }> = ({ userId }) => {
  const { friends } = useFriend();
  const friend = friends.find(f => f.id === userId);
  
  if (!friend) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: friend.status === 'online' ? 'success.main' : 
                   friend.status === 'away' ? 'warning.main' : 'grey.500',
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {friend.status === 'online' ? 'Online' :
         friend.status === 'away' ? 'Away' :
         friend.lastSeen ? `Last seen ${format(new Date(friend.lastSeen), 'PP')}` : 'Offline'}
      </Typography>
    </Box>
  );
};

// Add TypingIndicator component
const TypingIndicator: React.FC<{ typingUsers: Set<string> }> = ({ typingUsers }) => {
  const { friends } = useFriend();
  const typingUserNames = Array.from(typingUsers)
    .map(id => friends.find(f => f.id === id)?.name || 'Someone')
    .filter(Boolean);

  if (typingUserNames.length === 0) return null;

  const text = typingUserNames.length === 1 
    ? `${typingUserNames[0]} is typing` 
    : typingUserNames.length === 2
    ? `${typingUserNames[0]} and ${typingUserNames[1]} are typing`
    : 'Several people are typing';

  return (
    <Box sx={{ 
      position: 'absolute', 
      bottom: 70, 
      left: 16, 
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      bgcolor: 'background.paper',
      px: 2,
      py: 0.5,
      borderRadius: 1,
      boxShadow: 1,
    }}>
      <Typography variant="caption" color="text.secondary">
        {text}
      </Typography>
      <div className="typing-animation">
        <span />
        <span />
        <span />
      </div>
    </Box>
  );
};

export const Chat = () => {
  const { themeMode } = useTheme();
  const { socket, isConnected, emit, on, off } = useSocket();
  const { user: authUser } = useAuth();
  
  // State declarations
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      return parsedMessages.map((msg: ParsedMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return mockMessages;
  });
  
  const [newMessage, setNewMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [currentTime, setCurrentTime] = useState<{ [key: string]: number }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const messagesEndRef = useRef<HTMLDivElement & HTMLUListElement>(null);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    duration?: number;
  } | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [currentCallRoomId, setCurrentCallRoomId] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const zegoChatServiceRef = useRef<ZegoChatService | null>(null);
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    messageId: string;
  } | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const lastTypingEmitRef = useRef<number>(0);

  // Function declarations
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageData: Message = {
      id: crypto.randomUUID(),
      user: authUser?.id || 'You',
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date(),
      avatar: authUser?.avatar,
    };

    // Emit message if socket is connected
    if (socket && isConnected && authUser) {
      emit('message', messageData);
    }
    
    // Add message to local state regardless of socket connection
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    // Clear typing status
    if (socket && isConnected && authUser) {
      emit('typing_end', { userId: authUser.id });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    if (!audioRefs.current[messageId]) {
      audioRefs.current[messageId] = new Audio(audioUrl);
      audioRefs.current[messageId].addEventListener('timeupdate', () => {
        setCurrentTime(prev => ({
          ...prev,
          [messageId]: audioRefs.current[messageId].currentTime
        }));
      });
      audioRefs.current[messageId].addEventListener('ended', () => {
        setIsPlaying(prev => ({ ...prev, [messageId]: false }));
        setCurrentTime(prev => ({ ...prev, [messageId]: 0 }));
      });
    }

    if (isPlaying[messageId]) {
      audioRefs.current[messageId].pause();
    } else {
      audioRefs.current[messageId].play();
    }
    setIsPlaying(prev => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // Update container dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.getBoundingClientRect();
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const initializeZegoChat = async () => {
      if (!authUser) return;

      try {
        setIsConnecting(true);
        setConnectionError(null);

        // Initialize Zego Chat Service
        const chatService = new ZegoChatService(ZEGO_CONFIG.appID);
        zegoChatServiceRef.current = chatService;
        
        // Connect to Zego Cloud
        if (!authUser.zegoToken) {
          throw new Error('No Zego token available');
        }

        await chatService.connect(
          authUser.id,
          authUser.name || 'Anonymous',
          authUser.zegoToken
        );

        // Set up message listeners
        chatService.on('message', handleZegoMessage);
        chatService.on('connectionStateChanged', handleConnectionStateChange);

        // Start conversation with the current room/peer
        if (currentCallRoomId) {
          await chatService.startConversation(currentCallRoomId);
        }
      } catch (error) {
        console.error('Failed to initialize Zego Chat:', error);
        setConnectionError('Failed to connect to chat service. Please try again.');
      } finally {
        setIsConnecting(false);
      }
    };

    initializeZegoChat();

    return () => {
      if (zegoChatServiceRef.current) {
        zegoChatServiceRef.current.disconnect();
      }
    };
  }, [authUser, currentCallRoomId]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle incoming messages
    const handleIncomingMessage = (message: Message) => {
      setMessages(prev => [...prev, { ...message, timestamp: new Date(message.timestamp) }]);
    };

    // Handle typing indicators
    const handleTypingStart = ({ userId }: { userId: string }) => {
      setTypingUsers(prev => new Set([...prev, userId]));
      
      // Clear existing timeout for this user if it exists
      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }
      
      // Set new timeout to clear typing status after 3 seconds
      typingTimeoutRef.current[userId] = setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }, 3000);
    };

    const handleTypingEnd = ({ userId }: { userId: string }) => {
      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    // Handle message deletion
    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    // Subscribe to events
    on('message', handleIncomingMessage);
    on('typing_start', handleTypingStart);
    on('typing_end', handleTypingEnd);
    on('message_deleted', handleMessageDeleted);

    return () => {
      // Cleanup event listeners
      off('message', handleIncomingMessage);
      off('typing_start', handleTypingStart);
      off('typing_end', handleTypingEnd);
      off('message_deleted', handleMessageDeleted);
      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [socket, isConnected, on, off]);

  const handleZegoMessage = useCallback((message: any) => {
    if (message.type === 'system') {
      if (message.content === 'delete_message') {
        // Handle delete message from other users
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== message.metadata.messageId)
        );
      } else if (message.content === 'typing_status') {
        // Handle typing status
        if (message.metadata.isTyping) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.add(message.senderName);
            return newSet;
          });
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(message.senderName);
            return newSet;
          });
        }
      }
    } else {
      // Handle regular messages
      setMessages(prevMessages => [...prevMessages, message]);
    }
  }, []);

  const handleConnectionStateChange = useCallback((state: any) => {
    if (state.state === 'DISCONNECTED') {
      setConnectionError('Connection lost. Attempting to reconnect...');
    } else if (state.state === 'CONNECTED') {
      setConnectionError(null);
    }
  }, []);

  const handleMediaClick = (message: Message) => {
    if (message.type === 'image' || message.type === 'video') {
      const metadata = message.metadata as MediaMetadata;
      setPreviewMedia({ 
        url: message.content,
        type: message.type,
        duration: metadata?.duration
      });
    }
  };

  // Handle starting a call
  const handleStartCall = (video: boolean) => {
    const roomID = `syncsphere-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const callUrl = `${window.location.origin}/zegocloud-call.html?roomId=${roomID}&video=${video}&userName=User`;
    const windowWidth = 1200;
    const windowHeight = 800;
    const left = (window.screen.width - windowWidth) / 2;
    const top = (window.screen.height - windowHeight) / 2;
    
    window.open(
      callUrl,
      'SyncSphere Call',
      `width=${windowWidth},height=${windowHeight},top=${top},left=${left}`
    );
  };

  // Handle ending a call
  const handleEndCall = () => {
    setIsCallModalOpen(false);
    setCurrentCallRoomId('');
  };

  const handleMediaSelect = (file: File, type: 'image' | 'video' | 'document', metadata?: { duration?: number }) => {
    try {
      const url = URL.createObjectURL(file);
      const message: Message = {
        id: Date.now().toString(),
        user: 'You',
        content: url,
        type: type,
        timestamp: new Date(),
        metadata: {
          type: 'media',
          mediaType: type,
          thumbnailUrl: type === 'image' ? url : undefined,
          duration: metadata?.duration,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }
      };

      setMessages([...messages, message]);
      localStorage.setItem('chatMessages', JSON.stringify([...messages, message]));
      setIsMediaDialogOpen(false);
    } catch (error) {
      console.error(`Failed to handle ${type} selection:`, error);
    }
  };

  const handleStartChat = async (targetUserId: string) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      if (!zegoChatServiceRef.current) {
        // Initialize Zego Chat Service if not already initialized
        const chatService = new ZegoChatService(ZEGO_CONFIG.appID);
        zegoChatServiceRef.current = chatService;

        if (!authUser?.zegoToken) {
          throw new Error('No Zego token available');
        }

        await chatService.connect(
          authUser.id,
          authUser.name || 'Anonymous',
          authUser.zegoToken
        );

        // Set up message listeners
        chatService.on('message', handleZegoMessage);
        chatService.on('connectionStateChanged', handleConnectionStateChange);
      }

      await zegoChatServiceRef.current.startConversation(targetUserId);
      setCurrentCallRoomId(targetUserId);
      setIsStartChatOpen(false);
    } catch (error) {
      console.error('Failed to start chat:', error);
      setConnectionError('Failed to start chat. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            messageId,
          }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteMessage = async (deleteForEveryone: boolean) => {
    if (!contextMenu || !authUser) return;

    if (deleteForEveryone) {
      // Send delete message event to other users
      const deleteMessage: Message = {
        id: Date.now().toString(),
        user: authUser.id,
        type: 'system',
        content: 'delete_message',
        timestamp: new Date(),
        metadata: {
          type: 'system',
          messageId: contextMenu.messageId,
          userId: authUser.id,
          action: 'delete_message'
        }
      };

      emit('message_deleted', deleteMessage);
    }

    // Remove message from local state
    setMessages(prev => prev.filter(msg => msg.id !== contextMenu.messageId));
    handleCloseContextMenu();
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      let dateKey;
      if (isToday(message.timestamp)) {
        dateKey = 'Today';
      } else if (isYesterday(message.timestamp)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(message.timestamp, 'MMMM d, yyyy');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    const now = Date.now();
    if (now - lastTypingEmitRef.current > 1000) { // Throttle typing events to once per second
      if (socket && isConnected && authUser) {
        emit('typing_start', { userId: authUser.id });
        lastTypingEmitRef.current = now;
      }
    }
  }, [socket, isConnected, authUser, emit]);

  return (
    <Box
      ref={chatContainerRef}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        ...typingAnimationStyles,
      }}
    >
      {/* Add UserPresence component at the top */}
      {messages.length > 0 && messages[0].user && (
        <UserPresence userId={messages[0].user} />
      )}

      {/* Messages List */}
      <List
        ref={messagesEndRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
          <React.Fragment key={date}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                my: 2,
                position: 'relative',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  px: 2,
                  py: 0.5,
                  borderRadius: 4,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {date}
              </Typography>
            </Box>
            {dateMessages.map((message) => (
              <ListItem
                key={message.id}
                onContextMenu={(e) => handleContextMenu(e, message.id)}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.user === 'You' ? 'flex-end' : 'flex-start',
                  p: 1,
                  mb: 1.5,
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    maxWidth: '70%',
                    width: 'fit-content',
                  }}
                >
                  {message.user !== 'You' && (
                    <Avatar 
                      src={message.avatar}
                      sx={{ 
                        width: 28,
                        height: 28,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        flexShrink: 0,
                      }}
                    >
                      {message.user[0]}
                    </Avatar>
                  )}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                    maxWidth: '100%',
                  }}>
                    {message.user !== 'You' && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          ml: 0.5,
                        }}
                      >
                        {message.user}
                      </Typography>
                    )}
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 0.5,
                      maxWidth: '100%',
                    }}>
                      <Paper
                        elevation={0}
                        onClick={() => {
                          if (message.type === 'image' || message.type === 'video') {
                            handleMediaClick(message);
                          }
                        }}
                        sx={{
                          p: message.type === 'audio' ? 0.5 : message.type === 'text' ? { xs: 1.5, md: 2 } : 1,
                          bgcolor: message.user === 'You' 
                            ? themeMode === 'light' ? 'rgba(173, 73, 225, 0.1)' : 'rgba(40, 42, 54, 0.8)'
                            : themeMode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(32, 33, 44, 0.8)',
                          borderRadius: message.type === 'audio'
                            ? '24px'
                            : message.user === 'You'
                              ? '24px 4px 24px 24px'
                              : '4px 24px 24px 24px',
                          width: 'auto',
                          minWidth: message.type === 'audio' ? 280 : 'auto',
                          maxWidth: '100%',
                          wordBreak: 'break-word',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: message.user === 'You'
                            ? themeMode === 'light' ? 'var(--primary-transparent)' : 'var(--divider-color)'
                            : themeMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)',
                          position: 'relative',
                          overflow: 'hidden',
                          animation: 'messageAppear 0.3s ease-out',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.01)',
                            bgcolor: message.user === 'You' 
                              ? themeMode === 'light' ? 'rgba(173, 73, 225, 0.15)' : 'rgba(45, 47, 61, 0.95)'
                              : themeMode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(37, 38, 51, 0.95)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          },
                        }}
                      >
                        {message.type === 'text' ? (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: message.user === 'You' ? '#7743DB' : '#2A2A2A',
                              lineHeight: 1.6,
                              fontSize: { xs: '0.9rem', md: '0.95rem' },
                              fontWeight: 500,
                              letterSpacing: '0.01em',
                              position: 'relative',
                              zIndex: 1,
                              '& strong': {
                                color: message.user === 'You' ? '#7743DB' : '#2A2A2A',
                                fontWeight: 600,
                              },
                              '& em': {
                                fontStyle: 'italic',
                                opacity: 0.9,
                              },
                            }}
                          >
                            {message.content}
                          </Typography>
                        ) : message.type === 'image' ? (
                          <Box
                            sx={{
                              position: 'relative',
                              cursor: 'pointer',
                              borderRadius: 2,
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                zIndex: 1,
                              },
                              '&:hover': {
                                '&::before': {
                                  opacity: 1,
                                },
                                '& .image-overlay': {
                                  opacity: 1,
                                  transform: 'translateY(0)',
                                },
                                '& img': {
                                  transform: 'scale(1.05)',
                                },
                              },
                            }}
                          >
                            <img 
                              src={message.content}
                              alt="Shared media"
                              style={{
                                maxWidth: '100%',
                                maxHeight: 300,
                                borderRadius: 8,
                                display: 'block',
                                transition: 'transform 0.3s ease',
                              }}
                            />
                            <Box
                              className="image-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0,0,0,0.3)',
                                opacity: 0,
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: 'translateY(10px)',
                                zIndex: 2,
                              }}
                            >
                              <IconButton
                                size="small"
                                sx={{ 
                                  color: 'white',
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                  },
                                }}
                                onClick={() => window.open(message.content, '_blank')}
                              >
                                <IoExpand />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : message.type === 'video' ? (
                          <Box
                            sx={{
                              position: 'relative',
                              cursor: 'pointer',
                              borderRadius: 2,
                              overflow: 'hidden',
                              maxWidth: 320,
                              '&:hover': {
                                '& .video-overlay': {
                                  opacity: 1,
                                },
                              },
                            }}
                          >
                            <video
                              src={message.content}
                              style={{
                                maxWidth: '100%',
                                borderRadius: 8,
                                display: 'block',
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMediaClick(message);
                              }}
                              controls
                              controlsList="nodownload noremoteplayback"
                              preload="metadata"
                            />
                            <Box
                              className="video-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0,0,0,0.2)',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <IconButton
                                size="large"
                                sx={{
                                  color: 'white',
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMediaClick(message);
                                }}
                              >
                                <IoExpand />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : message.type === 'audio' ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1,
                              width: '100%',
                              minWidth: 'inherit',
                              maxWidth: 'inherit',
                              borderRadius: '16px',
                              bgcolor: 'transparent',
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                flexShrink: 0,
                                borderRadius: '50%',
                                bgcolor: '#FF5722',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  bgcolor: '#FF7043',
                                  transform: 'scale(1.05)',
                                },
                              }}
                              onClick={() => toggleAudioPlayback(message.id, message.content)}
                            >
                              {isPlaying[message.id] ? 
                                <IoPause size={20} style={{ color: 'white' }} /> : 
                                <IoPlay size={20} style={{ color: 'white', marginLeft: 2 }} />
                              }
                            </Box>

                            <Box sx={{ 
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                              minWidth: 0,
                              width: '100%',
                            }}>
                              <Box sx={{ 
                                width: '100%',
                                height: 4,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 2,
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${((currentTime[message.id] || 0) / ((message.metadata as MediaMetadata)?.duration || 1)) * 100}%`,
                                    bgcolor: '#FF5722',
                                    borderRadius: 2,
                                    transition: 'width 0.1s linear',
                                  }}
                                />
                                <Slider
                                  size="small"
                                  value={currentTime[message.id] || 0}
                                  max={(message.metadata as MediaMetadata)?.duration || 0}
                                  onChange={(_, value) => {
                                    if (audioRefs.current[message.id]) {
                                      audioRefs.current[message.id].currentTime = value as number;
                                      setCurrentTime(prev => ({
                                        ...prev,
                                        [message.id]: value as number
                                      }));
                                    }
                                  }}
                                  sx={{
                                    p: 0,
                                    m: 0,
                                    height: '100%',
                                    width: '100%',
                                    '& .MuiSlider-thumb': {
                                      width: 0,
                                      height: 0,
                                      '&:hover, &.Mui-focusVisible': {
                                        boxShadow: 'none',
                                      },
                                    },
                                    '& .MuiSlider-rail, & .MuiSlider-track': {
                                      display: 'none',
                                    },
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{ 
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.75rem',
                                  minWidth: 35,
                                  textAlign: 'right',
                                  ml: 'auto',
                                }}
                              >
                                {formatDuration(currentTime[message.id] || 0)}
                              </Typography>
                            </Box>
                          </Box>
                        ) : message.type === 'document' ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 2,
                              cursor: 'pointer',
                              '&:hover': {
                                '& .document-icon': {
                                  transform: 'scale(1.05)',
                                },
                              },
                            }}
                            onClick={() => window.open(message.content, '_blank')}
                          >
                            <Box
                              className="document-icon"
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.2s ease-in-out',
                              }}
                            >
                              <IoDocument size={24} color="white" />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: message.user === 'You' ? '#7743DB' : '#2A2A2A',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {(message.metadata as MediaMetadata)?.fileName || 'Document'}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  display: 'block',
                                }}
                              >
                                {(message.metadata as MediaMetadata)?.fileSize
                                  ? `${Math.round((message.metadata as MediaMetadata).fileSize! / 1024)} KB`
                                  : ''}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: message.user === 'You' ? '#7743DB' : '#2A2A2A',
                              lineHeight: 1.6,
                              fontSize: { xs: '0.9rem', md: '0.95rem' },
                              fontWeight: 500,
                              letterSpacing: '0.01em',
                              position: 'relative',
                              zIndex: 1,
                              '& strong': {
                                color: message.user === 'You' ? '#7743DB' : '#2A2A2A',
                                fontWeight: 600,
                              },
                              '& em': {
                                fontStyle: 'italic',
                                opacity: 0.9,
                              },
                            }}
                          >
                            {message.content}
                          </Typography>
                        )}
                      </Paper>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                          opacity: 0.8,
                          alignSelf: 'flex-end',
                          mb: 0.25,
                        }}
                      >
                        {format(message.timestamp, 'h:mm a')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>

      {/* Add TypingIndicator before the input field */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input Area */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Media Button */}
          <Tooltip title="Add Media">
            <IconButton
              color="primary"
              onClick={() => setIsMediaDialogOpen(true)}
              size="large"
            >
              <IoAdd />
            </IconButton>
          </Tooltip>

          {/* Voice Call Button */}
          <Tooltip title="Voice Call">
            <IconButton
              color="primary"
              onClick={() => handleStartCall(false)}
              size="large"
            >
              <IoCall />
            </IconButton>
          </Tooltip>

          {/* Video Call Button */}
          <Tooltip title="Video Call">
            <IconButton
              color="primary"
              onClick={() => handleStartCall(true)}
              size="large"
            >
              <IoVideocamOutline />
            </IconButton>
          </Tooltip>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />

          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            size="large"
          >
            <IoSend />
          </IconButton>
        </Stack>
      </Paper>

      {/* Media Selector Dialog */}
      <Dialog
        open={isMediaDialogOpen}
        onClose={() => setIsMediaDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Media
          <IconButton
            onClick={() => setIsMediaDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <IoClose />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <MediaSelector onMediaSelect={handleMediaSelect} />
        </DialogContent>
      </Dialog>

      {/* Media Preview Dialog */}
      {previewMedia && (
        <MediaPreviewDialog
          open={!!previewMedia}
          onClose={() => setPreviewMedia(null)}
          media={previewMedia}
          onPlay={(videoElement) => {
            if (videoElement && previewMedia?.type === 'video') {
              videoElement.play().catch(error => {
                console.error('Error playing video:', error);
              });
            }
          }}
        />
      )}

      {/* Call Modal */}
      <CallModal
        open={isCallModalOpen}
        onClose={handleEndCall}
        roomId={currentCallRoomId}
        isVideoEnabled={true}
      />

      {/* Start Chat Dialog */}
      <StartChatDialog
        open={isStartChatOpen}
        onClose={() => setIsStartChatOpen(false)}
        onStartChat={handleStartChat}
      />

      {isConnecting && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {connectionError && (
        <Box sx={{ 
          bgcolor: 'error.light', 
          color: 'error.contrastText', 
          p: 1, 
          textAlign: 'center' 
        }}>
          {connectionError}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleDeleteMessage(false)}>
          Delete for me
        </MenuItem>
        <MenuItem onClick={() => handleDeleteMessage(true)}>
          Delete for everyone
        </MenuItem>
      </Menu>
    </Box>
  );
};