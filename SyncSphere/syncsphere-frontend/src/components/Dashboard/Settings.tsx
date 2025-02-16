import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Modal,
  Fade,
  Button,
  TextField,
  Stack,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  IoClose,
  IoColorPaletteOutline,
  IoNotificationsOutline,
  IoLockClosedOutline,
  IoLanguageOutline,
  IoVolumeHighOutline,
  IoCloudOutline,
  IoHelpCircleOutline,
  IoChevronForward,
  IoSunnyOutline,
  IoMoonOutline,
  IoCamera,
  IoSaveOutline,
} from 'react-icons/io5';
import { useProfile } from '../../contexts/ProfileContext';
import { useTheme } from '../../theme/ThemeContext';
import { ProfilePictureUpload } from '../ProfilePicture/ProfilePictureUpload';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

interface Settings {
  language: {
    language: string;
  };
  timeFormat: {
    timeFormat: '12h' | '24h';
  };
  appearance: {
    showOfflineUsers: string;
    compactMode: string;
    animations: string;
    autoplayMedia: string;
    gifAutoplay: string;
    themeColor: string;
    videoQuality: string;
  };
  notifications: {
    enabled: string;
    sessionInvites: string;
  };
  theme?: {
    theme: string;
  };
}

interface SettingSection {
  id: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
}

export const Settings = ({ open, onClose }: SettingsProps) => {
  const { profile, settings, updateProfile, updateSettings } = useProfile();
  const { themeMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (open) {
      setDisplayName(profile?.displayName || '');
      setUsername(profile?.username || '');
      setAvatar(profile?.avatar || '');
    }
  }, [open, profile]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const handleSaveProfile = () => {
    if (!displayName || !username) {
      setSnackbar({
        open: true,
        message: 'Display name and username are required',
        severity: 'error'
      });
      return;
    }

    updateProfile({
      displayName,
      username,
      avatar,
      isProfileSetup: true,
    });

    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success'
    });
  };

  const handleSettingChange = (section: keyof Settings, key: string, value: string | '12h' | '24h') => {
    const sectionSettings = settings[section] || {};
    updateSettings({
      ...settings,
      [section]: {
        ...sectionSettings,
        [key]: value
      }
    });

    // If this is a theme change, use the theme context
    if (section === 'theme' && key === 'theme') {
      toggleTheme();
    }

    setSnackbar({
      open: true,
      message: 'Settings updated successfully',
      severity: 'success'
    });
  };

  const getSetting = (section: keyof Settings, key: string, defaultValue: string | '12h' | '24h'): string | '12h' | '24h' => {
    if (!settings[section]) return defaultValue;
    
    const value = (settings[section] as any)[key];
    if (value === undefined || value === null) return defaultValue;
    
    return value.toString();
  };

  const handleAvatarChange = (newAvatar: string | null) => {
    setAvatar(newAvatar || '');
    setSnackbar({
      open: true,
      message: 'Profile picture updated successfully',
      severity: 'success'
    });
  };

  const generateNewAvatar = () => {
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}&backgroundColor=b6e3f4`;
    setAvatar(newAvatar);
    setSnackbar({
      open: true,
      message: 'Generated new avatar successfully',
      severity: 'success'
    });
  };

  const settingsSections: SettingSection[] = [
    { id: 'profile', icon: IoCamera, label: 'Profile' },
    { id: 'appearance', icon: IoColorPaletteOutline, label: 'Appearance' },
    { id: 'notifications', icon: IoNotificationsOutline, label: 'Notifications' },
    { id: 'privacy', icon: IoLockClosedOutline, label: 'Privacy & Security' },
    { id: 'language', icon: IoLanguageOutline, label: 'Language' },
    { id: 'sound', icon: IoVolumeHighOutline, label: 'Sound & Media' },
    { id: 'storage', icon: IoCloudOutline, label: 'Storage & Data' },
    { id: 'help', icon: IoHelpCircleOutline, label: 'Help & Support' },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#BC6FF1',
                mb: 4,
                textAlign: 'center',
                animation: 'slideDown 0.5s ease-out',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #52057B, #892CDC)',
                  margin: '8px auto',
                  borderRadius: 1,
                },
              }}
            >
              Profile Settings
            </Typography>

            <Stack spacing={4} alignItems="center">
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <ProfilePictureUpload
                  currentAvatar={avatar}
                  onAvatarChange={handleAvatarChange}
                  generateRandomAvatar={generateNewAvatar}
                />
              </Box>

              <Stack spacing={3} sx={{ width: '100%' }}>
                <TextField
                  label="Display Name (@username)"
                  value={displayName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDisplayName(value);
                    setUsername(value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }}
                  fullWidth
                  helperText={`Your username will be: @${username}`}
                  InputProps={{
                    sx: {
                      '&::before': {
                        content: '"@"',
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#BC6FF1',
                        zIndex: 1,
                      },
                      paddingLeft: '24px',
                      color: '#FFFFFF',
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      bgcolor: '#444444',
                      '& fieldset': {
                        borderColor: 'rgba(188, 111, 241, 0.2)',
                        borderRadius: '12px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(188, 111, 241, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#892CDC',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#BC6FF1',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#892CDC',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#BC6FF1',
                    },
                  }}
                />

                <TextField
                  label="Bio"
                  multiline
                  rows={3}
                  value={profile?.bio || ''}
                  onChange={(e) => updateProfile({ ...profile!, bio: e.target.value })}
                  placeholder="Tell others about yourself..."
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'text.primary',
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
                      color: 'text.secondary',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'primary.main',
                    },
                  }}
                />

                <TextField
                  label="Location"
                  value={profile?.location || ''}
                  onChange={(e) => updateProfile({ ...profile!, location: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      color: 'text.primary',
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
                      color: 'text.secondary',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'primary.main',
                    },
                  }}
                />

                <TextField
                  label="Website"
                  value={profile?.website || ''}
                  onChange={(e) => updateProfile({ ...profile!, website: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      color: 'text.primary',
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
                      color: 'text.secondary',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'primary.main',
                    },
                  }}
                />
              </Stack>

              <Button
                variant="contained"
                onClick={handleSaveProfile}
                startIcon={<IoSaveOutline />}
                sx={{
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: '#52057B',
                  color: '#FFFFFF',
                  px: 4,
                  '&:hover': {
                    bgcolor: '#892CDC',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(188, 111, 241, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Save Changes
              </Button>
            </Stack>
          </Box>
        );

      case 'appearance':
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#BC6FF1',
                mb: 3,
                textAlign: 'center',
                fontWeight: 600,
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #52057B, #892CDC)',
                  margin: '8px auto',
                  borderRadius: 1,
                },
              }}
            >
              Appearance Settings
            </Typography>

            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: '#444444',
                  borderRadius: 2,
                  border: '1px solid rgba(188, 111, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(137, 44, 220, 0.2)',
                    transform: 'translateY(-2px)',
                    border: '1px solid rgba(188, 111, 241, 0.4)',
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    color: '#BC6FF1',
                    fontWeight: 600,
                  }}
                >
                  Theme
                </Typography>

                <ListItem
                  sx={{
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'rgba(82, 5, 123, 0.2)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#BC6FF1' }}>
                    {themeMode === 'dark' ? <IoMoonOutline /> : <IoSunnyOutline />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography color="#FFFFFF">
                        {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="#BC6FF1">
                        Switch between light and dark themes
                      </Typography>
                    }
                  />
                  <Switch
                    checked={themeMode === 'dark'}
                    onChange={toggleTheme}
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        '&.Mui-checked': {
                          color: '#892CDC',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#52057B',
                          },
                        },
                      },
                    }}
                  />
                </ListItem>

                <ListItem
                  sx={{
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography color="#FFFFFF">Theme Color</Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="#BC6FF1">
                        Choose your preferred accent color
                      </Typography>
                    }
                  />
                  <Select
                    value={getSetting('appearance', 'themeColor', 'purple')}
                    onChange={(e) => handleSettingChange('appearance', 'themeColor', e.target.value)}
                    sx={{
                      width: 150,
                      height: 40,
                      bgcolor: '#171717',
                      color: '#FFFFFF',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(188, 111, 241, 0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(188, 111, 241, 0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#892CDC',
                      },
                      '& .MuiSelect-icon': {
                        color: '#BC6FF1',
                      },
                    }}
                  >
                    <MenuItem value="purple" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>Purple</MenuItem>
                    <MenuItem value="blue" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>Blue</MenuItem>
                    <MenuItem value="green" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>Green</MenuItem>
                    <MenuItem value="pink" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>Pink</MenuItem>
                    <MenuItem value="orange" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>Orange</MenuItem>
                  </Select>
                </ListItem>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid rgba(119, 67, 219, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(119, 67, 219, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    color: 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  Interface
                </Typography>
                <Stack spacing={2}>
                  <ListItem
                    sx={{
                      borderRadius: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        bgcolor: 'rgba(119, 67, 219, 0.05)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography color="text.primary">Show Offline Users</Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Display users who are currently offline
                        </Typography>
                      }
                    />
                    <Switch
                      checked={getSetting('appearance', 'showOfflineUsers', 'false') === 'true'}
                      onChange={(e) => handleSettingChange('appearance', 'showOfflineUsers', e.target.checked ? 'true' : 'false')}
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          '&.Mui-checked': {
                            color: '#7743DB',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#CDC1FF',
                            },
                          },
                        },
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Compact Mode"
                      secondary="Reduce spacing in the interface"
                    />
                    <Switch
                      checked={getSetting('appearance', 'compactMode', 'false') === 'true'}
                      onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked ? 'true' : 'false')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Animations"
                      secondary="Enable interface animations"
                    />
                    <Switch
                      checked={getSetting('appearance', 'animations', 'false') === 'true'}
                      onChange={(e) => handleSettingChange('appearance', 'animations', e.target.checked ? 'true' : 'false')}
                    />
                  </ListItem>
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Media
                </Typography>
                <Stack spacing={2}>
                  <ListItem>
                    <ListItemText
                      primary="Autoplay Media"
                      secondary="Automatically play videos and animations"
                    />
                    <Switch
                      checked={getSetting('appearance', 'autoplayMedia', 'false') === 'true'}
                      onChange={(e) => handleSettingChange('appearance', 'autoplayMedia', e.target.checked ? 'true' : 'false')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Video Quality"
                      secondary="Default quality for video playback"
                    />
                    <Select
                      value={getSetting('appearance', 'videoQuality', 'auto')}
                      onChange={(e) => handleSettingChange('appearance', 'videoQuality', e.target.value)}
                      sx={{ width: 120 }}
                    >
                      <MenuItem value="auto">Auto</MenuItem>
                      <MenuItem value="1080p">1080p</MenuItem>
                      <MenuItem value="720p">720p</MenuItem>
                      <MenuItem value="480p">480p</MenuItem>
                      <MenuItem value="360p">360p</MenuItem>
                    </Select>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="GIF Autoplay"
                      secondary="Automatically play GIF animations"
                    />
                    <Switch
                      checked={getSetting('appearance', 'gifAutoplay', 'false') === 'true'}
                      onChange={(e) => handleSettingChange('appearance', 'gifAutoplay', e.target.checked ? 'true' : 'false')}
                    />
                  </ListItem>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        );

      case 'notifications':
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#BC6FF1',
                mb: 3,
                textAlign: 'center',
                animation: 'slideDown 0.5s ease-out',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #52057B, #892CDC)',
                  margin: '8px auto',
                  borderRadius: 1
                }
              }}
            >
              Notification Settings
            </Typography>

            <Stack spacing={3}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#444444',
                  borderRadius: 2,
                  border: '1px solid rgba(188, 111, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(137, 44, 220, 0.2)',
                    transform: 'translateY(-2px)',
                    border: '1px solid rgba(188, 111, 241, 0.4)'
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#BC6FF1', fontWeight: 600 }}>
                  General
                </Typography>
                <Stack spacing={2}>
                  <ListItem>
                    <ListItemText
                      primary={<Typography color="#FFFFFF">Enable Notifications</Typography>}
                      secondary={
                        <Typography variant="body2" color="#BC6FF1">
                          Receive notifications for important updates
                        </Typography>
                      }
                    />
                    <Switch
                      checked={getSetting('notifications', 'enabled', 'false') === 'true'}
                      onChange={(e) => handleSettingChange('notifications', 'enabled', e.target.checked ? 'true' : 'false')}
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          '&.Mui-checked': {
                            color: '#892CDC',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#52057B'
                            }
                          }
                        }
                      }}
                    />
                  </ListItem>
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#444444',
                  borderRadius: 2,
                  border: '1px solid rgba(188, 111, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(137, 44, 220, 0.2)',
                    transform: 'translateY(-2px)',
                    border: '1px solid rgba(188, 111, 241, 0.4)'
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#BC6FF1', fontWeight: 600 }}>
                  Session Notifications
                </Typography>
                <Stack spacing={2}>
                  <ListItem>
                    <ListItemText
                      primary={<Typography color="#FFFFFF">Session Invites</Typography>}
                      secondary={
                        <Typography variant="body2" color="#BC6FF1">
                          Get notified when someone invites you to a session
                        </Typography>
                      }
                    />
                    <Switch
                      checked={getSetting('notifications', 'sessionInvites', 'false') === 'true'}
                      onChange={(e) => handleSettingChange('notifications', 'sessionInvites', e.target.checked ? 'true' : 'false')}
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          '&.Mui-checked': {
                            color: '#892CDC',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#52057B'
                            }
                          }
                        }
                      }}
                    />
                  </ListItem>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        );

      case 'language':
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#BC6FF1',
                mb: 4,
                textAlign: 'center',
                animation: 'slideDown 0.5s ease-out',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #52057B, #892CDC)',
                  margin: '8px auto',
                  borderRadius: 1,
                },
              }}
            >
              Language &amp; Region
            </Typography>

            <Stack spacing={3}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#444444',
                  borderRadius: 2,
                  border: '1px solid rgba(188, 111, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(137, 44, 220, 0.2)',
                    transform: 'translateY(-2px)',
                    border: '1px solid rgba(188, 111, 241, 0.4)',
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#BC6FF1', fontWeight: 600 }}>
                  App Language
                </Typography>
                <Select
                  value={getSetting('language', 'language', 'en')}
                  onChange={(e) => handleSettingChange('language', 'language', e.target.value)}
                  fullWidth
                  sx={{
                    height: 56,
                    bgcolor: '#171717',
                    color: '#FFFFFF',
                    '& .MuiSelect-select': {
                      color: '#FFFFFF',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(188, 111, 241, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(188, 111, 241, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#892CDC',
                    },
                    '& .MuiSelect-icon': {
                      color: '#BC6FF1',
                    },
                  }}
                >
                  <MenuItem value="en" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>English (US)</MenuItem>
                  <MenuItem value="en-GB" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>English (UK)</MenuItem>
                  <MenuItem value="es" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>Español</MenuItem>
                  <MenuItem value="fr" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>Français</MenuItem>
                  <MenuItem value="de" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>Deutsch</MenuItem>
                </Select>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#444444',
                  borderRadius: 2,
                  border: '1px solid rgba(188, 111, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(137, 44, 220, 0.2)',
                    transform: 'translateY(-2px)',
                    border: '1px solid rgba(188, 111, 241, 0.4)',
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#BC6FF1', fontWeight: 600 }}>
                  Format
                </Typography>
                <Stack spacing={2}>
                  <ListItem>
                    <ListItemText
                      primary={<Typography color="#FFFFFF">Time Format</Typography>}
                      secondary={
                        <Typography variant="body2" color="#BC6FF1">
                          Choose between 12-hour and 24-hour format
                        </Typography>
                      }
                    />
                    <Select
                      value={getSetting('timeFormat', 'timeFormat', '12h')}
                      onChange={(e) => handleSettingChange('timeFormat', 'timeFormat', e.target.value as '12h' | '24h')}
                      sx={{
                        width: 120,
                        height: 40,
                        bgcolor: '#171717',
                        color: '#FFFFFF',
                        '& .MuiSelect-select': {
                          color: '#FFFFFF',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(188, 111, 241, 0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(188, 111, 241, 0.4)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#892CDC',
                        },
                        '& .MuiSelect-icon': {
                          color: '#BC6FF1',
                        },
                      }}
                    >
                      <MenuItem value="12h" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>12-hour</MenuItem>
                      <MenuItem value="24h" sx={{ color: '#FFFFFF', bgcolor: '#171717' }}>24-hour</MenuItem>
                    </Select>
                  </ListItem>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      disableEscapeKeyDown={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(23, 23, 23, 0.85)',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1000,
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: '#171717',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(137, 44, 220, 0.3)',
            p: { xs: 2, sm: 3 },
            border: '1px solid rgba(188, 111, 241, 0.2)',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={onClose}
            aria-label="Close settings"
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              zIndex: 10,
              color: '#BC6FF1',
              bgcolor: 'rgba(82, 5, 123, 0.2)',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: 'rgba(137, 44, 220, 0.3)',
                transform: 'rotate(90deg) scale(1.1)',
              },
              '&:active': {
                transform: 'rotate(90deg) scale(0.95)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <IoClose size={24} />
          </IconButton>

          <Typography
            variant="h5"
            sx={{
              color: '#BC6FF1',
              fontWeight: 600,
              mb: 3,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #52057B, #892CDC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
            }}
          >
            Settings
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 4 },
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            <List
              sx={{
                minWidth: { xs: '100%', md: 200 },
                bgcolor: '#171717',
                borderRadius: 2,
                border: '1px solid rgba(188, 111, 241, 0.2)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {settingsSections.map((section) => (
                <ListItem
                  button
                  key={section.id}
                  className={activeSection === section.id ? 'active' : ''}
                  onClick={() => setActiveSection(section.id)}
                >
                  <ListItemIcon>
                    {React.createElement(section.icon, { size: 24, color: activeSection === section.id ? '#BC6FF1' : '#892CDC' })}
                  </ListItemIcon>
                  <ListItemText primary={section.label} />
                  <IoChevronForward
                    size={16}
                    style={{
                      opacity: activeSection === section.id ? 1 : 0.5,
                      transform: `rotate(${activeSection === section.id ? '90deg' : '0deg'})`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: activeSection === section.id ? '#BC6FF1' : '#892CDC'
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Box
              sx={{
                flex: 1,
                bgcolor: '#171717',
                borderRadius: 2,
                p: 3,
                border: '1px solid rgba(188, 111, 241, 0.2)',
                minHeight: 400,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {renderSectionContent()}
            </Box>
          </Box>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              severity={snackbar.severity}
              sx={{
                bgcolor: snackbar.severity === 'success' ? 'rgba(82, 5, 123, 0.95)' : 'rgba(218, 0, 55, 0.95)',
                color: '#FFFFFF',
                backdropFilter: 'blur(8px)',
                border: '1px solid',
                borderColor: snackbar.severity === 'success' ? '#BC6FF1' : '#DA0037',
                '& .MuiAlert-icon': {
                  color: '#FFFFFF'
                }
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Fade>
    </Modal>
  );
}; 