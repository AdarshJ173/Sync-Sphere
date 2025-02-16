import { Socket } from 'socket.io-client';

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  participants: string[];
  createdAt: Date;
  lastActivity: Date;
}

class RoomService {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  createRoom(name: string): Promise<Room> {
    return new Promise((resolve, reject) => {
      this.socket.emit('create_room', { name }, (response: { success: boolean; room?: Room; error?: string }) => {
        if (response.success && response.room) {
          resolve(response.room);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  }

  joinRoom(roomId: string): Promise<Room> {
    return new Promise((resolve, reject) => {
      this.socket.emit('join_room', { roomId }, (response: { success: boolean; room?: Room; error?: string }) => {
        if (response.success && response.room) {
          resolve(response.room);
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  leaveRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('leave_room', { roomId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to leave room'));
        }
      });
    });
  }

  getRooms(): Promise<Room[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('get_rooms', (response: { success: boolean; rooms?: Room[]; error?: string }) => {
        if (response.success && response.rooms) {
          resolve(response.rooms);
        } else {
          reject(new Error(response.error || 'Failed to get rooms'));
        }
      });
    });
  }

  searchRooms(query: string): Promise<Room[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('search_rooms', { query }, (response: { success: boolean; rooms?: Room[]; error?: string }) => {
        if (response.success && response.rooms) {
          resolve(response.rooms);
        } else {
          reject(new Error(response.error || 'Failed to search rooms'));
        }
      });
    });
  }
}

export default RoomService; 