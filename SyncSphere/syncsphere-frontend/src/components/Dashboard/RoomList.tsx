import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  IoAdd,
  IoSearch,
  IoEnter,
  IoPeople,
  IoClose,
} from 'react-icons/io5';
import RoomService, { Room } from '../../services/RoomService';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

interface RoomListProps {
  onRoomSelect: (room: Room) => void;
  currentRoomId?: string;
}

export const RoomList: React.FC<RoomListProps> = ({ onRoomSelect, currentRoomId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { user } = useAuth();
  const [roomService, setRoomService] = useState<RoomService | null>(null);

  useEffect(() => {
    if (socket) {
      const service = new RoomService(socket);
      setRoomService(service);

      // Listen for room updates
      socket.on('room_updated', (updatedRoom: Room) => {
        setRooms(prevRooms => {
          const index = prevRooms.findIndex(r => r.id === updatedRoom.id);
          if (index !== -1) {
            const newRooms = [...prevRooms];
            newRooms[index] = updatedRoom;
            return newRooms;
          }
          return [...prevRooms, updatedRoom];
        });
      });

      socket.on('room_deleted', (roomId: string) => {
        setRooms(prevRooms => prevRooms.filter(r => r.id !== roomId));
      });

      // Load initial rooms
      loadRooms();
    }
  }, [socket]);

  const loadRooms = async () => {
    if (!roomService) return;

    try {
      setLoading(true);
      const fetchedRooms = await roomService.getRooms();
      setRooms(fetchedRooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!roomService) return;

    try {
      setLoading(true);
      const searchResults = await roomService.searchRooms(searchQuery);
      setRooms(searchResults);
    } catch (error) {
      console.error('Failed to search rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomService || !newRoomName.trim()) return;

    try {
      const newRoom = await roomService.createRoom(newRoomName.trim());
      setRooms(prevRooms => [...prevRooms, newRoom]);
      setIsCreateDialogOpen(false);
      setNewRoomName('');
      onRoomSelect(newRoom);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async (room: Room) => {
    if (!roomService) return;

    try {
      await roomService.joinRoom(room.id);
      onRoomSelect(room);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <IoSearch style={{ marginRight: 8 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            },
          }}
        />
        <Tooltip title="Create Room">
          <IconButton
            onClick={() => setIsCreateDialogOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <IoAdd />
          </IconButton>
        </Tooltip>
      </Box>

      <List sx={{ 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
        },
      }}>
        {rooms.map((room) => (
          <ListItem
            key={room.id}
            button
            selected={room.id === currentRoomId}
            onClick={() => handleJoinRoom(room)}
            sx={{
              mb: 1,
              borderRadius: 2,
              bgcolor: room.id === currentRoomId ? 'rgba(110, 37, 148, 0.2)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(110, 37, 148, 0.1)',
              },
            }}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={room.participants.length}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <IoPeople />
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={room.name}
              secondary={`Created by ${room.createdBy}`}
              primaryTypographyProps={{
                sx: { color: 'white', fontWeight: 500 }
              }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <Tooltip title="Join Room">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinRoom(room);
                }}
                sx={{
                  color: 'primary.light',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <IoEnter />
              </IconButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 2,
            minWidth: 300,
          },
        }}
      >
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)} startIcon={<IoClose />}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRoom}
            variant="contained"
            disabled={!newRoomName.trim()}
            startIcon={<IoAdd />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 