import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  TextField,
  Button,
  Badge,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  IoCheckmark,
  IoClose,
  IoSearch,
  IoPersonAdd,
  IoNotifications,
} from 'react-icons/io5';
import { useFriend } from '../../contexts/FriendContext';
import { Friend } from '../../services/FriendService';

export const FriendRequests: React.FC = () => {
  const {
    pendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    searchUsers,
    loading,
    error,
  } = useFriend();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setSearchError(null);
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      // Remove user from search results
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (err) {
      // Error is handled by the context
    }
  };

  return (
    <>
      <Tooltip title="Friend Requests">
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'relative',
            color: 'var(--text-primary)',
            '&:hover': {
              color: 'var(--primary)',
              backgroundColor: 'rgba(119, 67, 219, 0.08)',
            },
          }}
        >
          <Badge
            badgeContent={pendingRequests.length}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#ff4444',
                color: '#fff',
                animation: pendingRequests.length > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(.8)', opacity: 0.5 },
                  '50%': { transform: 'scale(1)', opacity: 1 },
                  '100%': { transform: 'scale(.8)', opacity: 0.5 },
                },
              },
            }}
          >
            <IoNotifications size={24} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Friend Requests
          </Typography>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Find Friends
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  sx: {
                    bgcolor: 'var(--bg-secondary)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--border-color)',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                startIcon={searching ? <CircularProgress size={20} /> : <IoSearch />}
                sx={{
                  bgcolor: 'var(--primary)',
                  '&:hover': {
                    bgcolor: 'var(--primary-dark)',
                  },
                }}
              >
                Search
              </Button>
            </Box>

            {searchError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {searchError}
              </Alert>
            )}

            {searchResults.length > 0 && (
              <List sx={{ mt: 2 }}>
                {searchResults.map((user) => (
                  <ListItem
                    key={user.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleSendRequest(user.id)}
                        sx={{ color: 'var(--primary)' }}
                      >
                        <IoPersonAdd />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={user.avatar}>{user.name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.online ? 'Online' : 'Offline'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Pending Requests
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          ) : pendingRequests.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
              No pending friend requests
            </Typography>
          ) : (
            <List>
              {pendingRequests.map((request) => (
                <ListItem
                  key={request.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        onClick={() => handleAccept(request.id)}
                        sx={{
                          color: '#4CAF50',
                          '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' },
                        }}
                      >
                        <IoCheckmark />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleReject(request.id)}
                        sx={{
                          color: '#ff4444',
                          '&:hover': { bgcolor: 'rgba(255, 68, 68, 0.08)' },
                        }}
                      >
                        <IoClose />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={request.senderAvatar}>
                      {request.senderName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={request.senderName}
                    secondary={new Date(request.createdAt).toLocaleDateString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}; 