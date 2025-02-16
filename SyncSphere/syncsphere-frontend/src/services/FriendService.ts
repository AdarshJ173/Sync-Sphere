import { Socket } from 'socket.io-client';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  status: 'online' | 'away' | 'offline';
  lastSeen?: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

class FriendService {
  private socket: Socket;
  private userId: string;
  private handlers: { [key: string]: ((data: any) => void)[] } = {};
  private inactivityTimeout: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();

  constructor(socket: Socket, userId: string) {
    this.socket = socket;
    this.userId = userId;
    this.setupSocketListeners();
    this.setupActivityTracking();
  }

  private setupSocketListeners(): void {
    this.socket.on('friend_status_change', (data: { friendId: string, status: Friend['status'], lastSeen?: Date }) => {
      this.emit('friend_status_change', data);
    });

    this.socket.on('friend_request', (request: FriendRequest) => {
      this.emit('friend_request', request);
    });

    this.socket.on('friend_request_update', (request: FriendRequest) => {
      this.emit('friend_request_update', request);
    });

    this.socket.on('friend_removed', (friendId: string) => {
      this.emit('friend_removed', friendId);
    });

    // Handle reconnection
    this.socket.on('connect', () => {
      this.updateStatus('online');
    });

    this.socket.on('disconnect', () => {
      this.updateStatus('offline');
    });
  }

  private setupActivityTracking() {
    // Track user activity
    const resetInactivityTimer = () => {
      this.lastActivity = Date.now();
      
      if (this.inactivityTimeout) {
        clearTimeout(this.inactivityTimeout);
      }

      this.inactivityTimeout = setTimeout(() => {
        if (Date.now() - this.lastActivity >= 5 * 60 * 1000) { // 5 minutes
          this.updateStatus('away');
        }
      }, 5 * 60 * 1000); // 5 minutes

      // If we were away, set status back to online
      if (this.socket.connected) {
        this.updateStatus('online');
      }
    };

    if (typeof window !== 'undefined') {
      // Track various user activities
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keypress', resetInactivityTimer);
      window.addEventListener('click', resetInactivityTimer);
      window.addEventListener('scroll', resetInactivityTimer);
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.updateStatus('away');
        } else {
          resetInactivityTimer();
        }
      });

      // Initial status
      resetInactivityTimer();
    }
  }

  private updateStatus(status: Friend['status']) {
    this.socket.emit('presence_update', {
      userId: this.userId,
      status,
      lastSeen: status === 'offline' ? new Date() : undefined
    });
  }

  private emit(event: string, data: any): void {
    if (!this.handlers[event]) return;
    this.handlers[event].forEach(handler => handler(data));
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

  // Friend List Operations
  async getFriends(): Promise<Friend[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('get_friends', null, (response: { error?: string; friends?: Friend[] }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.friends || []);
        }
      });
    });
  }

  // Friend Request Operations
  async sendFriendRequest(targetUserId: string): Promise<FriendRequest> {
    return new Promise((resolve, reject) => {
      this.socket.emit('send_friend_request', { targetUserId }, (response: { error?: string; request?: FriendRequest }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.request!);
        }
      });
    });
  }

  async getPendingRequests(): Promise<FriendRequest[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('get_friend_requests', null, (response: { error?: string; requests?: FriendRequest[] }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.requests || []);
        }
      });
    });
  }

  async respondToFriendRequest(requestId: string, accept: boolean): Promise<FriendRequest> {
    return new Promise((resolve, reject) => {
      this.socket.emit('respond_friend_request', { requestId, accept }, (response: { error?: string; request?: FriendRequest }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.request!);
        }
      });
    });
  }

  // Friend Management
  async removeFriend(friendId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('remove_friend', { friendId }, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  async blockUser(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('block_user', { userId }, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  async unblockUser(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('unblock_user', { userId }, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  async getBlockedUsers(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('get_blocked_users', null, (response: { error?: string; blockedUsers?: string[] }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.blockedUsers || []);
        }
      });
    });
  }

  // Friend Search
  async searchUsers(query: string): Promise<Friend[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('search_users', { query }, (response: { error?: string; users?: Friend[] }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.users || []);
        }
      });
    });
  }
}

export default FriendService; 