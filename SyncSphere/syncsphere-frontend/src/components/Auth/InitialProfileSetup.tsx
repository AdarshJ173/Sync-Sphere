import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { IoCamera, IoCheckmark } from 'react-icons/io5';
import { ProfilePictureUpload } from '../ProfilePicture/ProfilePictureUpload';

interface InitialProfileSetupProps {
  open: boolean;
  onComplete: (profileData: { displayName: string; username: string; avatar?: string; status: 'online' | 'away' | 'offline' }) => void;
}

export const InitialProfileSetup = ({ open, onComplete }: InitialProfileSetupProps) => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(`https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`);
  const [step, setStep] = useState(0);

  const handleAvatarChange = (newAvatar: string | null) => {
    setAvatar(newAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`);
  };

  const generateNewAvatar = () => {
    setAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}&backgroundColor=b6e3f4`);
  };

  const handleNext = () => {
    if (step === 0 && displayName) {
      setStep(1);
    } else if (step === 1 && username) {
      onComplete({ 
        displayName, 
        username, 
        avatar,
        status: 'online'
      });
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 24,
        sx: {
          backgroundColor: 'rgba(37, 40, 61, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          animation: 'dialogFadeIn 0.5s ease-out',
          '@keyframes dialogFadeIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.95) translateY(10px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(180deg, rgba(110, 37, 148, 0.2) 0%, transparent 100%)',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(45deg, #fff, #A675A1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {step === 0 ? 'Welcome to SyncSphere!' : 'Choose Your Identity'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={4} alignItems="center">
          {step === 0 ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <ProfilePictureUpload
                  currentAvatar={avatar}
                  onAvatarChange={handleAvatarChange}
                  generateRandomAvatar={generateNewAvatar}
                />
              </Box>

              <TextField
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main',
                  },
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ maxWidth: 300 }}
              >
                This is how other users will see you. You can change this later in settings.
              </Typography>
            </>
          ) : (
            <>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                fullWidth
                autoFocus
                helperText="This will be your unique identifier"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'primary.main',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ maxWidth: 300 }}
              >
                Choose a unique username that others can use to find and connect with you.
              </Typography>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(0deg, rgba(110, 37, 148, 0.1) 0%, transparent 100%)',
        }}
      >
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={step === 0 ? !displayName : !username}
          startIcon={step === 1 ? <IoCheckmark /> : undefined}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            minWidth: 120,
            py: 1.5,
            px: 3,
            backgroundColor: 'primary.main',
            color: 'white',
            boxShadow: '0 4px 12px rgba(110, 37, 148, 0.3)',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: '0 6px 16px rgba(110, 37, 148, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(110, 37, 148, 0.2)',
              color: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          {step === 0 ? 'Next' : 'Complete Setup'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 