import { io, Socket } from 'socket.io-client';

interface MediaState {
  url: string;
  timestamp: number;
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  volume: number;
}

interface SyncMessage {
  type: 'media_state' | 'seek' | 'play' | 'pause' | 'volume' | 'playback_rate';
  data: Partial<MediaState>;
  senderId: string;
  roomId: string;
  timestamp: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private userId: string;
  private handlers: { [key: string]: ((data: any) => void)[] } = {};

  constructor(userId: string) {
    this.userId = userId;
  }

  connect(serverUrl: string = process.env.REACT_APP_WS_URL || 'ws://localhost:3001'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          transports: ['websocket'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          reject(error);
        });

        this.setupEventListeners();
      } catch (error) {
        console.error('WebSocket initialization error:', error);
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('media_sync', (message: SyncMessage) => {
      if (message.senderId !== this.userId) {
        this.emit('media_sync', message);
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  joinRoom(roomId: string): void {
    if (!this.socket || !roomId) return;
    
    this.roomId = roomId;
    this.socket.emit('join_room', { roomId, userId: this.userId });
  }

  leaveRoom(): void {
    if (!this.socket || !this.roomId) return;
    
    this.socket.emit('leave_room', { roomId: this.roomId, userId: this.userId });
    this.roomId = null;
  }

  syncMediaState(state: Partial<MediaState>): void {
    if (!this.socket || !this.roomId) return;

    const message: SyncMessage = {
      type: 'media_state',
      data: state,
      senderId: this.userId,
      roomId: this.roomId,
      timestamp: Date.now(),
    };

    this.socket.emit('media_sync', message);
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

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default WebSocketService; 