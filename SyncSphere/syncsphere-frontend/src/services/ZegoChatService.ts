import type { ZIM } from 'zego-zim-web';
import { ChatMessage, ChatUser } from './ChatService';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

type MessageType = 'text' | 'media' | 'system';
type MediaType = 'image' | 'video' | 'document' | 'audio';

interface SystemMessage {
  type: 'system';
  content: string;
  metadata: {
    messageId: string;
  };
}

interface MediaMessage {
  type: 'media';
  content: Blob;
  mediaType: MediaType;
  duration?: number;
}

type Message = string | SystemMessage | MediaMessage;

export class ZegoChatService {
  private zim: ZIM | null = null;
  private appID: number;
  private handlers: { [key: string]: ((data: any) => void)[] } = {};
  private currentConversationID: string | null = null;
  private initializationPromise: Promise<void> | null = null;
  private zegoInstance: any;

  constructor(appID: number) {
    this.appID = appID;
    this.initializationPromise = this.initialize();
  }

  private async initialize() {
    try {
      const { ZIM } = await import('zego-zim-web');
      this.zim = ZIM.create({ appID: this.appID });
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize Zego Cloud:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    if (!this.zim) return;

    this.zim.on('receivePeerMessage', (zegoChatMessage) => {
      const message = this.convertZegoMessageToChatMessage(zegoChatMessage);
      this.emit('message', message);
    });

    this.zim.on('connectionStateChanged', (state) => {
      this.emit('connectionStateChanged', state);
    });
  }

  private async ensureInitialized() {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }
    await this.initializationPromise;
    if (!this.zim) {
      throw new Error('Zego Cloud not initialized');
    }
  }

  private convertZegoMessageToChatMessage(zegoMessage: any): ChatMessage {
    return {
      id: zegoMessage.messageID,
      content: zegoMessage.message,
      senderId: zegoMessage.fromUserID,
      senderName: zegoMessage.fromUserName || 'Unknown',
      roomId: this.currentConversationID || '',
      timestamp: zegoMessage.timestamp,
      type: this.getMessageType(zegoMessage),
      metadata: this.extractMetadata(zegoMessage)
    };
  }

  private getMessageType(zegoMessage: any): 'text' | 'system' | 'media' {
    switch (zegoMessage.type) {
      case 1: return 'text';
      case 2: return 'media';
      default: return 'system';
    }
  }

  private extractMetadata(zegoMessage: any) {
    if (zegoMessage.type === 2) {
      return {
        mediaType: zegoMessage.fileType,
        mediaUrl: zegoMessage.fileDownloadUrl,
        thumbnailUrl: zegoMessage.thumbnailDownloadUrl
      };
    }
    return undefined;
  }

  async connect(userID: string, userName: string, token: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.zim) {
      throw new Error('Zego Cloud not initialized');
    }

    try {
      await this.zim.login({
        userID,
        userName,
        token
      });
    } catch (error) {
      console.error('Failed to connect to Zego Cloud:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.ensureInitialized();
    if (!this.zim) return;

    try {
      await this.zim.logout();
    } catch (error) {
      console.error('Failed to disconnect from Zego Cloud:', error);
      throw error;
    }
  }

  async sendMessage(message: Message): Promise<void> {
    await this.ensureInitialized();
    if (!this.zim) {
      throw new Error('Zego Cloud not initialized');
    }
    if (!this.currentConversationID) {
      throw new Error('No active conversation');
    }

    if (typeof message === 'string') {
      // Handle text message
      await this.zim.sendPeerMessage({
        message,
        toUserID: this.currentConversationID,
        priority: 1,
      });
    } else if (message.type === 'media') {
      // Handle media message
      await this.zim.sendMediaMessage({
        messageType: message.mediaType,
        content: message.content,
        toUserID: this.currentConversationID,
        priority: 1,
        extendedData: JSON.stringify({
          duration: message.duration,
        }),
      });
    } else if (message.type === 'system') {
      // Handle system message
      await this.zim.sendCustomMessage({
        message: JSON.stringify({
          type: 'system',
          content: message.content,
          metadata: message.metadata,
        }),
        toUserID: this.currentConversationID,
        priority: 1,
      });
    }
  }

  async startConversation(userID: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.zim) {
      throw new Error('Zego Cloud not initialized');
    }

    try {
      this.currentConversationID = userID;
      await this.zim.createPeerMessage({ toUserID: userID });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }

  async endConversation(): Promise<void> {
    this.currentConversationID = null;
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
}

export default ZegoChatService; 