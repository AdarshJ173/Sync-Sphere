import React, { createContext, useContext, useEffect, useState } from 'react';
import FriendService, { Friend, FriendRequest } from '../services/FriendService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface FriendContextType {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<Friend[]>;
  loading: boolean;
  error: string | null;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export const FriendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [friendService, setFriendService] = useState<FriendService | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (socket && user) {
      const service = new FriendService(socket, user.id);
      setFriendService(service);

      // Set up event listeners
      service.on('friend_request', handleFriendRequest);
      service.on('friend_request_update', handleFriendRequestUpdate);
      service.on('friend_status_change', handleFriendStatusChange);
      service.on('friend_removed', handleFriendRemoved);

      // Load initial data
      loadFriendsAndRequests();

      return () => {
        service.off('friend_request', handleFriendRequest);
        service.off('friend_request_update', handleFriendRequestUpdate);
        service.off('friend_status_change', handleFriendStatusChange);
        service.off('friend_removed', handleFriendRemoved);
      };
    }
  }, [socket, user]);

  const loadFriendsAndRequests = async () => {
    if (!friendService) return;

    try {
      setLoading(true);
      const [friendsList, requestsList] = await Promise.all([
        friendService.getFriends(),
        friendService.getPendingRequests(),
      ]);
      setFriends(friendsList);
      setPendingRequests(requestsList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = (request: FriendRequest) => {
    setPendingRequests(prev => [...prev, request]);
  };

  const handleFriendRequestUpdate = (request: FriendRequest) => {
    setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    if (request.status === 'accepted') {
      loadFriendsAndRequests();
    }
  };

  const handleFriendStatusChange = (update: { friendId: string; status: Friend['status'] }) => {
    setFriends(prev => prev.map(friend => 
      friend.id === update.friendId 
        ? { ...friend, status: update.status, online: update.status === 'online' }
        : friend
    ));
  };

  const handleFriendRemoved = (friendId: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
  };

  const sendFriendRequest = async (userId: string) => {
    if (!friendService) return;
    try {
      await friendService.sendFriendRequest(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
      throw err;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    if (!friendService) return;
    try {
      await friendService.respondToFriendRequest(requestId, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept friend request');
      throw err;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    if (!friendService) return;
    try {
      await friendService.respondToFriendRequest(requestId, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject friend request');
      throw err;
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!friendService) return;
    try {
      await friendService.removeFriend(friendId);
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
      throw err;
    }
  };

  const blockUser = async (userId: string) => {
    if (!friendService) return;
    try {
      await friendService.blockUser(userId);
      // Remove from friends list if they were a friend
      setFriends(prev => prev.filter(friend => friend.id !== userId));
      // Remove any pending requests
      setPendingRequests(prev => prev.filter(request => 
        request.senderId !== userId && request.receiverId !== userId
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block user');
      throw err;
    }
  };

  const unblockUser = async (userId: string) => {
    if (!friendService) return;
    try {
      await friendService.unblockUser(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock user');
      throw err;
    }
  };

  const searchUsers = async (query: string): Promise<Friend[]> => {
    if (!friendService) return [];
    try {
      return await friendService.searchUsers(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
      throw err;
    }
  };

  const value = {
    friends,
    pendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    searchUsers,
    loading,
    error,
  };

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriend = () => {
  const context = useContext(FriendContext);
  if (context === undefined) {
    throw new Error('useFriend must be used within a FriendProvider');
  }
  return context;
};

export default FriendContext; 