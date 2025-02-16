import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';

interface StartChatDialogProps {
  open: boolean;
  onClose: () => void;
  onStartChat: (userId: string) => void;
}

export const StartChatDialog: React.FC<StartChatDialogProps> = ({
  open,
  onClose,
  onStartChat,
}) => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }
    onStartChat(userId.trim());
    setUserId('');
    setError('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(37, 40, 61, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          minWidth: 320,
        }
      }}
    >
      <DialogTitle sx={{ color: 'white' }}>Start New Chat</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Enter the user ID of the person you want to chat with.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="User ID"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Start Chat
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 