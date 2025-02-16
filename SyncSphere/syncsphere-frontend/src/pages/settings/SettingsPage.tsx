import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Fade,
  Grow,
  useTheme as useMuiTheme,
  alpha,
  Avatar,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoEyeOutline, 
  IoEyeOffOutline, 
  IoArrowBack, 
  IoSaveOutline,
  IoCamera,
  IoCloudUpload,
  IoTrash,
  IoRefresh,
  IoClose,
} from 'react-icons/io5';
import { useTheme } from '../../theme/ThemeContext';
import { useProfile } from '../../contexts/ProfileContext';
import { ProfilePictureUpload } from '../../components/ProfilePicture/ProfilePictureUpload';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const muiTheme = useMuiTheme();

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      sx={{ 
        height: '100%',
        overflow: 'auto',
        transition: 'all 0.3s ease-in-out',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(muiTheme.palette.primary.main, 0.2),
          borderRadius: '3px',
          '&:hover': {
            background: alpha(muiTheme.palette.primary.main, 0.3),
          },
        },
      }}
    >
      <AnimatePresence mode="wait">
        {value === index && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            style={{ 
              height: '100%',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100px',
                    background: `linear-gradient(180deg, ${alpha(muiTheme.palette.background.paper, 0.1)} 0%, transparent 100%)`,
                    pointerEvents: 'none',
                  },
                }}
              >
                {children}
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

interface Settings {
  language: string;
  theme: string;
  autoplayVideos: boolean;
  showOfflineUsers: boolean;
  enableNotifications: boolean;
  messageNotifications: boolean;
  sessionInvites: boolean;
  friendRequests: boolean;
  profileVisibility: string;
  onlineStatus: boolean;
  shareWatchHistory: boolean;
  email: string;
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  displayName: string;
  bio: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  socialLinks: {
    twitter: string;
    github: string;
    linkedin: string;
  };
}

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useTheme();
  const { profile, updateProfile } = useProfile();
  const muiTheme = useMuiTheme();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<Settings>({
    language: 'en',
    theme: themeMode,
    autoplayVideos: true,
    showOfflineUsers: true,
    enableNotifications: true,
    messageNotifications: true,
    sessionInvites: true,
    friendRequests: true,
    profileVisibility: 'public',
    onlineStatus: true,
    shareWatchHistory: true,
    email: profile?.email || '',
    username: profile?.username || '',
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || '',
    status: profile?.status || 'online',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    socialLinks: {
      twitter: profile?.socialLinks?.twitter || '',
      github: profile?.socialLinks?.github || '',
      linkedin: profile?.socialLinks?.linkedin || '',
    },
  });

  useEffect(() => {
    // Simulate loading settings
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSettings(prev => ({ ...prev, theme: themeMode }));
  }, [themeMode]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({ ...prev, [field]: value }));
    
    setSuccessMessage('Settings updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handlePasswordChange = async () => {
    if (settings.newPassword !== settings.confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }
    
    setSuccessMessage('Password updated successfully');
    setSettings(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setSuccessMessage('Theme updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAvatarChange = (newAvatar: string | null) => {
    setSettings(prev => ({ ...prev, avatar: newAvatar || '' }));
    setSuccessMessage('Avatar updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const generateRandomAvatar = () => {
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}&backgroundColor=b6e3f4`;
    setSettings(prev => ({ ...prev, avatar: newAvatar }));
    setSuccessMessage('Avatar updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleProfileUpdate = () => {
    updateProfile({
      ...profile,
      displayName: settings.displayName,
      bio: settings.bio,
      avatar: settings.avatar,
      socialLinks: settings.socialLinks,
    });
    setSuccessMessage('Profile updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <AnimatePresence mode="wait">
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
        onClick={() => navigate('/dashboard')}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: '95%',
            maxWidth: 1200,
            height: '90vh',
            m: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: alpha(muiTheme.palette.background.paper, 0.7),
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(muiTheme.palette.primary.main, 0.1),
            boxShadow: `0 8px 32px ${alpha(muiTheme.palette.common.black, 0.2)}`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: alpha(muiTheme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              zIndex: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: alpha(muiTheme.palette.error.main, 0.1),
                    color: 'error.main',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <IoClose />
              </IconButton>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Settings
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                backdropFilter: 'blur(10px)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    ${alpha(muiTheme.palette.primary.main, 0.2)} 25%, 
                    ${alpha(muiTheme.palette.primary.main, 0.2)} 75%, 
                    transparent 100%
                  )`,
                },
                '& .MuiTabs-scroller': {
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                },
                '& .MuiTabs-flexContainer': {
                  gap: 2,
                },
                '& .MuiTab-root': {
                  minWidth: 120,
                  minHeight: 48,
                  fontWeight: 500,
                  textTransform: 'none',
                  color: 'text.secondary',
                  borderRadius: '8px 8px 0 0',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, 
                      ${alpha(muiTheme.palette.primary.main, 0.05)} 0%, 
                      ${alpha(muiTheme.palette.primary.main, 0.1)} 100%
                    )`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover': {
                    color: 'text.primary',
                    '&::before': {
                      opacity: 1,
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                    '&::before': {
                      opacity: 1,
                      background: `linear-gradient(135deg, 
                        ${alpha(muiTheme.palette.primary.main, 0.1)} 0%, 
                        ${alpha(muiTheme.palette.primary.main, 0.15)} 100%
                      )`,
                    },
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                  boxShadow: `0 0 10px ${alpha(muiTheme.palette.primary.main, 0.5)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, transparent, ${muiTheme.palette.primary.main}, transparent)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '.Mui-selected &::after': {
                      opacity: 1,
                    },
                  }}>
                    Profile
                  </Box>
                } 
              />
              <Tab label="General" />
              <Tab label="Account" />
              <Tab label="Privacy" />
              <Tab label="Notifications" />
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {isLoading ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                      }}
                    >
                      Loading settings...
                    </Typography>
                  </motion.div>
                </Box>
              ) : (
                <>
                  <TabPanel value={tabValue} index={0}>
                    <Stack spacing={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${alpha(muiTheme.palette.primary.main, 0.15)}`,
                          },
                        }}
                      >
                        <Stack spacing={4} alignItems="center">
                          <Box sx={{ position: 'relative' }}>
                            <ProfilePictureUpload
                              currentAvatar={settings.avatar}
                              onAvatarChange={handleAvatarChange}
                              generateRandomAvatar={generateRandomAvatar}
                            />
                          </Box>

                          <Stack spacing={3} sx={{ width: '100%', maxWidth: 500 }}>
                            <TextField
                              label="Display Name"
                              value={settings.displayName}
                              onChange={handleChange('displayName')}
                              fullWidth
                              variant="outlined"
                            />
                            <TextField
                              label="Bio"
                              value={settings.bio}
                              onChange={handleChange('bio')}
                              fullWidth
                              multiline
                              rows={4}
                              variant="outlined"
                            />
                          </Stack>
                        </Stack>
                      </Paper>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack spacing={3}>
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            Social Links
                          </Typography>
                          <TextField
                            label="Twitter"
                            value={settings.socialLinks.twitter}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                            }))}
                            fullWidth
                            variant="outlined"
                          />
                          <TextField
                            label="GitHub"
                            value={settings.socialLinks.github}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, github: e.target.value }
                            }))}
                            fullWidth
                            variant="outlined"
                          />
                          <TextField
                            label="LinkedIn"
                            value={settings.socialLinks.linkedin}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                            }))}
                            fullWidth
                            variant="outlined"
                          />
                          <Button
                            variant="contained"
                            onClick={handleProfileUpdate}
                            startIcon={<IoSaveOutline />}
                            sx={{
                              alignSelf: 'flex-start',
                              background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Save Profile
                          </Button>
                        </Stack>
                      </Paper>
                    </Stack>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    <Stack spacing={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack spacing={3}>
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            Theme & Display
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={themeMode === 'dark'}
                                onChange={handleThemeToggle}
                                color="primary"
                              />
                            }
                            label="Dark Mode"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.showOfflineUsers}
                                onChange={handleChange('showOfflineUsers')}
                                color="primary"
                              />
                            }
                            label="Show Offline Users"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.autoplayVideos}
                                onChange={handleChange('autoplayVideos')}
                                color="primary"
                              />
                            }
                            label="Autoplay Videos"
                          />
                        </Stack>
                      </Paper>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${alpha(muiTheme.palette.primary.main, 0.15)}`,
                          },
                        }}
                      >
                        <Stack spacing={3}>
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            Language & Region
                          </Typography>
                          <Select
                            value={settings.language}
                            onChange={handleChange('language') as any}
                            fullWidth
                            variant="outlined"
                          >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="es">Español</MenuItem>
                            <MenuItem value="fr">Français</MenuItem>
                            <MenuItem value="de">Deutsch</MenuItem>
                          </Select>
                        </Stack>
                      </Paper>
                    </Stack>
                  </TabPanel>

                  <TabPanel value={tabValue} index={2}>
                    <Stack spacing={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack spacing={3}>
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            Account Information
                          </Typography>
                          <TextField
                            label="Email"
                            value={settings.email}
                            onChange={handleChange('email')}
                            fullWidth
                          />
                          <TextField
                            label="Username"
                            value={settings.username}
                            onChange={handleChange('username')}
                            fullWidth
                          />
                        </Stack>
                      </Paper>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack spacing={3}>
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            Change Password
                          </Typography>
                          <TextField
                            label="Current Password"
                            type={showPassword ? 'text' : 'password'}
                            value={settings.currentPassword}
                            onChange={handleChange('currentPassword')}
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                </IconButton>
                              ),
                            }}
                          />
                          <TextField
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={settings.newPassword}
                            onChange={handleChange('newPassword')}
                            fullWidth
                          />
                          <TextField
                            label="Confirm New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={settings.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            fullWidth
                          />
                          <Button
                            variant="contained"
                            onClick={handlePasswordChange}
                            startIcon={<IoSaveOutline />}
                            sx={{
                              alignSelf: 'flex-start',
                              background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Update Password
                          </Button>
                        </Stack>
                      </Paper>
                    </Stack>
                  </TabPanel>

                  <TabPanel value={tabValue} index={3}>
                    <Stack spacing={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack spacing={3}>
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            Privacy Settings
                          </Typography>
                          <Select
                            value={settings.profileVisibility}
                            onChange={handleChange('profileVisibility') as any}
                            fullWidth
                            variant="outlined"
                          >
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="friends">Friends Only</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                          </Select>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.onlineStatus}
                                onChange={handleChange('onlineStatus')}
                                color="primary"
                              />
                            }
                            label="Show Online Status"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.shareWatchHistory}
                                onChange={handleChange('shareWatchHistory')}
                                color="primary"
                              />
                            }
                            label="Share Watch History"
                          />
                        </Stack>
                      </Paper>
                    </Stack>
                  </TabPanel>

                  <TabPanel value={tabValue} index={4}>
                    <Stack spacing={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: alpha(muiTheme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack spacing={3}>
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            Notification Preferences
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.enableNotifications}
                                onChange={handleChange('enableNotifications')}
                                color="primary"
                              />
                            }
                            label="Enable Notifications"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.messageNotifications}
                                onChange={handleChange('messageNotifications')}
                                color="primary"
                              />
                            }
                            label="Message Notifications"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.sessionInvites}
                                onChange={handleChange('sessionInvites')}
                                color="primary"
                              />
                            }
                            label="Session Invites"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.friendRequests}
                                onChange={handleChange('friendRequests')}
                                color="primary"
                              />
                            }
                            label="Friend Requests"
                          />
                        </Stack>
                      </Paper>
                    </Stack>
                  </TabPanel>
                </>
              )}
            </Box>
          </Box>

          <AnimatePresence>
            {successMessage && (
              <Alert
                severity="success"
                sx={{
                  position: 'fixed',
                  bottom: 16,
                  right: 16,
                  zIndex: 9999,
                  maxWidth: 400,
                  backdropFilter: 'blur(8px)',
                  backgroundColor: alpha(muiTheme.palette.success.main, 0.9),
                  color: 'white',
                  boxShadow: `0 8px 32px ${alpha(muiTheme.palette.success.main, 0.2)}`,
                  border: '1px solid',
                  borderColor: alpha(muiTheme.palette.success.main, 0.2),
                  borderRadius: 2,
                }}
              >
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert
                severity="error"
                onClose={() => setErrorMessage(null)}
                sx={{
                  position: 'fixed',
                  bottom: 16,
                  right: 16,
                  zIndex: 9999,
                  maxWidth: 400,
                  backdropFilter: 'blur(8px)',
                  backgroundColor: alpha(muiTheme.palette.error.main, 0.9),
                  color: 'white',
                  boxShadow: `0 8px 32px ${alpha(muiTheme.palette.error.main, 0.2)}`,
                  border: '1px solid',
                  borderColor: alpha(muiTheme.palette.error.main, 0.2),
                  borderRadius: 2,
                }}
              >
                {errorMessage}
              </Alert>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </AnimatePresence>
  );
};