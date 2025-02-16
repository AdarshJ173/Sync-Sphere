import { Socket } from 'socket.io-client';
import WebRTCService from './WebRTCService';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  roomId: string;
  timestamp: number;
  type: 'text' | 'system' | 'media';
  metadata?: {
    mediaType?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
  };
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  retryCount?: number;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isTyping?: boolean;
  status?: 'online' | 'away' | 'offline';
  lastSeen?: Date;
}

export interface MediaState {
  url: string;
  title: string;
  isPlaying: boolean;
  progress: number;
  timestamp: number;
  senderId: string;
}

class ChatService {
  private socket: Socket;
  private roomId: string | null = null;
  private userId: string;
  private handlers: { [key: string]: ((data: any) => void)[] } = {};
  private webRTCService: WebRTCService;
  private messageQueue: ChatMessage[] = [];
  private retryInterval: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 3000;
  private isOnline = navigator.onLine;

  constructor(socket: Socket, userId: string) {
    this.socket = socket;
    this.userId = userId;
    this.webRTCService = new WebRTCService(socket, userId);
    this.setupEventListeners();
    this.setupWebRTCListeners();
    this.setupNetworkListeners();
    this.loadQueuedMessages();
    this.startRetryProcess();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.processMessageQueue();
  };

  private handleOffline = () => {
    this.isOnline = false;
  };

  private loadQueuedMessages() {
    const queuedMessages = localStorage.getItem('queuedMessages');
    if (queuedMessages) {
      this.messageQueue = JSON.parse(queuedMessages);
    }
  }

  private saveQueuedMessages() {
    localStorage.setItem('queuedMessages', JSON.stringify(this.messageQueue));
  }

  private startRetryProcess() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
    this.retryInterval = setInterval(() => this.processMessageQueue(), this.retryDelay);
  }

  private async processMessageQueue() {
    if (!this.isOnline || this.messageQueue.length === 0) return;

    const messagesToRetry = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messagesToRetry) {
      if (!message.retryCount) message.retryCount = 0;
      
      if (message.retryCount >= this.maxRetries) {
        message.status = 'failed';
        this.emit('message_status_update', message);
        continue;
      }

      try {
        message.status = 'sending';
        this.emit('message_status_update', message);
        
        await new Promise<void>((resolve, reject) => {
          this.socket.emit('chat_message', message, (ack: { success: boolean }) => {
            if (ack.success) {
              message.status = 'sent';
              this.emit('message_status_update', message);
              resolve();
            } else {
              reject(new Error('Message not acknowledged'));
            }
          });

          // Timeout if no response received
          setTimeout(() => reject(new Error('Message timeout')), 5000);
        });
      } catch (error) {
        message.retryCount++;
        message.status = 'failed';
        this.messageQueue.push(message);
        this.emit('message_status_update', message);
      }
    }

    this.saveQueuedMessages();
  }

  private setupEventListeners() {
    this.socket.on('chat_message', (message: ChatMessage) => {
      this.emit('message', message);
    });

    this.socket.on('user_joined', (user: ChatUser) => {
      this.emit('user_joined', user);
    });

    this.socket.on('user_left', (userId: string) => {
      this.emit('user_left', userId);
    });

    this.socket.on('typing_start', (data: { userId: string, roomId: string }) => {
      if (data.roomId === this.roomId) {
        this.emit('typing_start', data);
      }
    });

    this.socket.on('typing_end', (data: { userId: string, roomId: string }) => {
      if (data.roomId === this.roomId) {
        this.emit('typing_end', data);
      }
    });

    this.socket.on('presence_update', (data: { userId: string, status: ChatUser['status'], lastSeen?: Date }) => {
      this.emit('presence_update', data);
    });

    this.socket.on('media_state_update', (state: MediaState) => {
      this.emit('media_state_update', state);
    });

    this.socket.on('media_seek', (data: { progress: number, timestamp: number, senderId: string }) => {
      this.emit('media_seek', data);
    });

    this.socket.on('media_play_pause', (data: { isPlaying: boolean, timestamp: number, senderId: string }) => {
      this.emit('media_play_pause', data);
    });

    this.socket.on('message_delivered', (data: { messageId: string, userId: string }) => {
      this.emit('message_status_update', {
        id: data.messageId,
        status: 'delivered'
      });
    });

    this.socket.on('message_read', (data: { messageId: string, userId: string }) => {
      this.emit('message_status_update', {
        id: data.messageId,
        status: 'read'
      });
    });

    this.socket.on('reconnect', () => {
      this.processMessageQueue();
    });
  }

  private setupWebRTCListeners() {
    this.webRTCService.onMessage((message: ChatMessage) => {
      this.emit('message', message);
    });
  }

  joinRoom(roomId: string): void {
    if (!roomId) return;
    
    this.roomId = roomId;
    this.socket.emit('join_chat', { roomId, userId: this.userId });
  }

  leaveRoom(): void {
    if (!this.roomId) return;
    
    this.socket.emit('leave_chat', { roomId: this.roomId, userId: this.userId });
    this.webRTCService.closeAllConnections();
    this.roomId = null;
  }

  async sendMessage(content: string, type: ChatMessage['type'] = 'text', metadata?: ChatMessage['metadata']): Promise<void> {
    if (!this.roomId) return;

    const message: ChatMessage = {
      id: `${this.userId}-${Date.now()}`,
      content,
      senderId: this.userId,
      senderName: 'User',
      roomId: this.roomId,
      timestamp: Date.now(),
      type,
      metadata,
      status: 'sending'
    };

    this.emit('message', message);

    if (!this.isOnline) {
      message.status = 'failed';
      this.messageQueue.push(message);
      this.saveQueuedMessages();
      this.emit('message_status_update', message);
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        this.socket.emit('chat_message', message, (ack: { success: boolean }) => {
          if (ack.success) {
            message.status = 'sent';
            this.emit('message_status_update', message);
            resolve();
          } else {
            reject(new Error('Message not acknowledged'));
          }
        });

        setTimeout(() => reject(new Error('Message timeout')), 5000);
      });

      // Also send through WebRTC for reliability
      this.webRTCService.sendMessage(message);
    } catch (error) {
      message.status = 'failed';
      this.messageQueue.push(message);
      this.saveQueuedMessages();
      this.emit('message_status_update', message);
    }
  }

  startTyping(): void {
    if (!this.roomId) return;
    this.socket.emit('typing_start', { roomId: this.roomId, userId: this.userId });
  }

  stopTyping(): void {
    if (!this.roomId) return;
    this.socket.emit('typing_end', { roomId: this.roomId, userId: this.userId });
  }

  updatePresence(status: ChatUser['status']): void {
    this.socket.emit('presence_update', { 
      userId: this.userId, 
      status,
      lastSeen: status === 'offline' ? new Date() : undefined
    });
  }

  updateMediaState(state: MediaState): void {
    if (!this.roomId) return;
    this.socket.emit('media_state_update', { ...state, roomId: this.roomId });
  }

  seekMedia(progress: number): void {
    if (!this.roomId) return;
    this.socket.emit('media_seek', {
      progress,
      timestamp: Date.now(),
      roomId: this.roomId,
      senderId: this.userId
    });
  }

  toggleMediaPlayPause(isPlaying: boolean): void {
    if (!this.roomId) return;
    this.socket.emit('media_play_pause', {
      isPlaying,
      timestamp: Date.now(),
      roomId: this.roomId,
      senderId: this.userId
    });
  }

  markMessageAsRead(messageId: string): void {
    if (!this.roomId) return;
    this.socket.emit('message_read', {
      messageId,
      roomId: this.roomId,
      userId: this.userId
    });
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter(h => h !== handler);
  }

  private emit(event: string, data: any): void {
    if (!this.handlers[event]) return;
    this.handlers[event].forEach(handler => handler(data));
  }

  cleanup() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

export default ChatService; 