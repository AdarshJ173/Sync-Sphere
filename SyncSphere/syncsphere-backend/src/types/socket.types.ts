import { Socket } from 'socket.io';
import { IUser } from '../models/User';
import { IMediaState } from '../models/Session';

export interface IClientToServerEvents {
  // Session events
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  
  // Media sync events
  mediaStateUpdate: (sessionId: string, state: Partial<IMediaState>) => void;
  seekTo: (sessionId: string, time: number) => void;
  
  // Chat events
  sendMessage: (sessionId: string, message: string) => void;
  startTyping: (sessionId: string) => void;
  stopTyping: (sessionId: string) => void;
}

export interface IServerToClientEvents {
  // Session events
  userJoined: (sessionId: string, user: Pick<IUser, '_id' | 'firstName' | 'lastName'>) => void;
  userLeft: (sessionId: string, userId: string) => void;
  
  // Media sync events
  mediaStateChanged: (sessionId: string, state: IMediaState) => void;
  seeked: (sessionId: string, time: number) => void;
  
  // Chat events
  newMessage: (sessionId: string, message: IChatMessage) => void;
  userTyping: (sessionId: string, user: Pick<IUser, '_id' | 'firstName' | 'lastName'>) => void;
  userStoppedTyping: (sessionId: string, userId: string) => void;
  
  // Error events
  error: (error: { message: string }) => void;
}

export interface IInterServerEvents {
  ping: () => void;
}

export interface IChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export interface ISocketData {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
} 