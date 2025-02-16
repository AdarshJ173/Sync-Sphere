import { Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, Badge, IconButton, Tooltip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { IoAdd, IoChevronBack, IoChevronForward, IoSettingsSharp, IoLogOutOutline } from 'react-icons/io5';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logOut } from '../../services/auth';
import { useProfile } from '../../contexts/ProfileContext';
import { Fade } from '@mui/material';
import { useTheme } from '../../theme/ThemeContext';
import { useFriend } from '../../contexts/FriendContext';
import { FriendRequests } from './FriendRequests';
import { SubscriptionBox } from './SubscriptionBox';
import { SubscriptionModal } from './SubscriptionModal';

type Session = {
  id: string;
  name: string;
  participants: number;
};

// Mock data with diverse avatars
const mockSessions: Session[] = [
  { id: '1', name: 'Movie Night', participants: 3 },
  { id: '2', name: 'Study Group', participants: 4 },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onFriendSelect: (friendId: string) => void;
}

export const Sidebar = ({ isCollapsed, onToggle, onFriendSelect }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const { themeMode } = useTheme();
  const { friends } = useFriend();
  const [hoveredFriend, setHoveredFriend] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const statusOptions = [
    { value: 'online', label: 'Online', color: '#4CAF50' },
    { value: 'away', label: 'Away', color: '#FFA726' },
    { value: 'offline', label: 'Offline', color: '#ff4444' },
  ];

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    const result = await logOut();
    if (!result.error) {
      navigate('/');
    }
    setLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleFriendClick = (friendId: string) => {
    setSelectedFriend(friendId);
    onFriendSelect(friendId);
  };

  return (
    <Box
      sx={{
        width: isCollapsed ? 80 : 280,
        height: '100vh',
        borderRight: '1px solid var(--divider-color)',
        backdropFilter: 'blur(12px)',
        backgroundColor: 'var(--background-sidebar)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: isCollapsed ? '120px' : '0',
          background: themeMode === 'light' 
            ? 'linear-gradient(180deg, rgba(173, 73, 225, 0.1) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(110, 37, 148, 0.2) 0%, transparent 100%)',
          transition: 'all 0.3s ease-in-out',
          opacity: isCollapsed ? 1 : 0,
        }
      }}
    >
      <Box
        sx={{
          p: isCollapsed ? 1.5 : 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid var(--divider-color)',
          background: themeMode === 'light'
            ? 'linear-gradient(180deg, rgba(173, 73, 225, 0.05) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(110, 37, 148, 0.1) 0%, transparent 100%)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '10%',
            width: '80%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--primary-transparent-dark), transparent)',
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flex: 1,
            position: 'relative',
          }}
        >
          <Box
            onClick={isCollapsed ? onToggle : undefined}
            sx={{
              width: isCollapsed ? 40 : 48,
              height: isCollapsed ? 40 : 48,
              borderRadius: '12px',
              background: 'var(--gradient-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-transparent-dark)',
              transition: 'all 0.3s ease',
              cursor: isCollapsed ? 'pointer' : 'default',
              '&:hover': {
                transform: isCollapsed ? 'scale(1.1)' : 'scale(1.05)',
                boxShadow: isCollapsed ? 
                  '0 6px 16px var(--primary-transparent-dark), 0 0 0 4px var(--primary-transparent)' : 
                  '0 6px 16px var(--primary-transparent-dark)',
              },
              '&:active': isCollapsed ? {
                transform: 'scale(0.95)',
                boxShadow: '0 2px 8px rgba(110, 37, 148, 0.4)',
              } : {},
              position: 'relative',
              '&::after': isCollapsed ? {
                content: '""',
                position: 'absolute',
                inset: -4,
                border: '2px solid rgba(110, 37, 148, 0.3)',
                borderRadius: '16px',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              } : {},
              '&:hover::after': isCollapsed ? {
                opacity: 1,
              } : {},
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: isCollapsed ? '1.2rem' : '1.5rem',
                userSelect: 'none',
              }}
            >
              S
            </Typography>
            {isCollapsed && (
              <Box
                sx={{
                  position: 'absolute',
                  right: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '.MuiBox-root:hover > &': {
                    opacity: 0.7,
                  }
                }}
              >
                <IoChevronForward size={14} />
              </Box>
            )}
          </Box>
          {!isCollapsed && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  letterSpacing: '0.02em',
                  background: 'var(--gradient-light)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 10px rgba(119, 67, 219, 0.2)',
                  position: 'relative',
                  userSelect: 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -1,
                    background: 'var(--gradient-purple)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'blur(4px)',
                    opacity: 0.5,
                    zIndex: -1,
                  },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    textShadow: '0 4px 12px rgba(119, 67, 219, 0.3)',
                  }
                }}
              >
                SyncSphere
              </Typography>
              <Box sx={{ flex: 1 }} />
              <IconButton
                size="small"
                onClick={onToggle}
                sx={{
                  color: 'var(--text-primary)',
                  width: 32,
                  height: 32,
                  opacity: 0.9,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: 'rgba(68, 68, 68, 0.15)',
                  border: '1px solid rgba(23, 23, 23, 0.2)',
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: 'rgba(68, 68, 68, 0.25)',
                    transform: 'scale(1.1)',
                    border: '1px solid rgba(23, 23, 23, 0.3)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  }
                }}
              >
                <IoChevronBack size={18} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Box>

      <Box sx={{ 
        p: isCollapsed ? 1 : 2, 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'var(--primary-transparent)',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: 'var(--primary-transparent-dark)',
          },
        },
      }}>
        <Box>
          <Box sx={{ mt: 3 }}>
            <SubscriptionBox 
              isCollapsed={isCollapsed} 
              onClick={() => setSubscriptionModalOpen(true)} 
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2,
            mt: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: isCollapsed ? -10 : 0,
              left: isCollapsed ? '10%' : 0,
              width: isCollapsed ? '80%' : '40%',
              height: 2,
              background: isCollapsed ? 
                'linear-gradient(90deg, transparent, #7743DB, transparent)' : 
                'linear-gradient(90deg, #7743DB, transparent)',
              opacity: isCollapsed ? 0.5 : 1,
              transition: 'all 0.3s ease-in-out',
            }
          }}>
            {!isCollapsed && (
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 700,
                  mr: 'auto',
                  fontSize: '0.875rem',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    width: '40%',
                    height: 2,
                    background: 'linear-gradient(90deg, #7743DB, transparent)',
                    opacity: 0.7,
                  }
                }}
              >
                Friends
              </Typography>
            )}
            <FriendRequests />
          </Box>

          <List sx={{ 
            '& .MuiListItem-root': { 
              borderRadius: 2, 
              mb: 0.5,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(119, 67, 219, 0.08)',
                transform: isCollapsed ? 'scale(1.1)' : 'translateX(8px)',
                '& .friend-avatar': {
                  borderColor: '#7743DB',
                  transform: isCollapsed ? 'scale(1.15)' : 'scale(1.1)',
                  boxShadow: '0 4px 12px rgba(119, 67, 219, 0.2)',
                },
                '& .MuiTypography-root': {
                  color: '#7743DB',
                }
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(119, 67, 219, 0.12)',
                '&:hover': {
                  backgroundColor: 'rgba(119, 67, 219, 0.16)',
                },
                '& .MuiTypography-root': {
                  color: '#7743DB',
                  fontWeight: 600,
                }
              }
            }
          }}>
            {friends.map((friend, index) => (
              <ListItem 
                key={friend.id} 
                button
                selected={selectedFriend === friend.id}
                onMouseEnter={() => setHoveredFriend(friend.id)}
                onMouseLeave={() => setHoveredFriend(null)}
                onClick={() => handleFriendClick(friend.id)}
                sx={{ 
                  px: isCollapsed ? 1 : 2,
                  transform: hoveredFriend === friend.id ? 
                    isCollapsed ? 'scale(1.1)' : 'translateX(8px)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: isCollapsed ? `fadeInScale 0.3s ease-out ${index * 0.1}s` : 'none',
                  '@keyframes fadeInScale': {
                    '0%': { 
                      opacity: 0,
                      transform: 'scale(0.5)',
                    },
                    '100%': { 
                      opacity: 1,
                      transform: 'scale(1)',
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: '#7743DB',
                    transform: selectedFriend === friend.id ? 'scaleY(1)' : 'scaleY(0)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
              >
                <ListItemAvatar sx={{ 
                  minWidth: isCollapsed ? 40 : 56,
                  mx: isCollapsed ? 'auto' : 0,
                }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={friend.status === 'online' ? 'success' : friend.status === 'away' ? 'warning' : 'error'}
                    sx={{
                      '& .MuiBadge-badge': {
                        border: '2px solid #F5EFFF',
                        animation: friend.status === 'online' ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(.8)', opacity: 0.5 },
                          '50%': { transform: 'scale(1)', opacity: 1 },
                          '100%': { transform: 'scale(.8)', opacity: 0.5 },
                        },
                      }
                    }}
                  >
                    <Avatar 
                      src={friend.avatar}
                      className="friend-avatar"
                      sx={{ 
                        bgcolor: friend.status === 'online' ? '#7743DB' : 'rgba(42, 42, 42, 0.2)',
                        width: isCollapsed ? 32 : 40,
                        height: isCollapsed ? 32 : 40,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '2px solid #F5EFFF',
                        '&:hover': {
                          borderColor: '#7743DB',
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      {friend.name[0]}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                {!isCollapsed && (
                  <Stack spacing={0.5} sx={{ overflow: 'hidden' }}>
                    <ListItemText 
                      primary={friend.name}
                      primaryTypographyProps={{
                        sx: { 
                          fontWeight: 600,
                          transition: 'color 0.2s ease',
                          color: 'var(--text-primary)',
                          fontSize: '0.9375rem',
                          letterSpacing: '0.01em',
                        }
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: friend.status === 'online' ? '#4CAF50' : 
                              friend.status === 'away' ? '#FFA726' : '#ff4444',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        opacity: 0.9,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        '&::before': {
                          content: '""',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'currentColor',
                          display: 'inline-block',
                          marginRight: '4px',
                          boxShadow: friend.status === 'online' ? '0 0 8px #4CAF50' :
                                    friend.status === 'away' ? '0 0 8px #FFA726' : 
                                    '0 0 8px #ff4444',
                        }
                      }}
                    >
                      {friend.status === 'online' ? 'Online' : 
                       friend.status === 'away' ? 'Away' : 'Offline'}
                    </Typography>
                  </Stack>
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ 
          borderColor: 'rgba(119, 67, 219, 0.1)', 
          mx: isCollapsed ? 0 : -2,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: isCollapsed ? '10%' : '0',
            width: isCollapsed ? '80%' : '100%',
            height: '1px',
            background: isCollapsed ? 
              'linear-gradient(90deg, transparent, rgba(119, 67, 219, 0.2), transparent)' : 
              'rgba(119, 67, 219, 0.1)',
          }
        }} />

        <Box sx={{ mt: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isCollapsed ? 'center' : 'space-between', 
            mb: 2,
            px: isCollapsed ? 0 : 1,
            minHeight: 28,
          }}>
            {!isCollapsed && (
              <Typography variant="subtitle2" sx={{ 
                color: 'var(--text-primary)', 
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
              }}>
                Active Sessions
              </Typography>
            )}
            <Tooltip title="New Session" placement={isCollapsed ? 'right' : 'top'}>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'var(--primary)',
                  backgroundColor: 'rgba(68, 68, 68, 0.15)',
                  border: '1px solid rgba(23, 23, 23, 0.2)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(68, 68, 68, 0.25)',
                    transform: 'rotate(90deg) scale(1.1)',
                    border: '1px solid rgba(23, 23, 23, 0.3)',
                  }
                }}
              >
                <IoAdd />
              </IconButton>
            </Tooltip>
          </Box>
          <List sx={{ 
            '& .MuiListItem-root': { 
              borderRadius: 2, 
              mb: 0.5,
              '&:hover': { 
                backgroundColor: 'rgba(68, 68, 68, 0.1)',
              }
            }
          }}>
            {mockSessions.map((session) => (
              <Tooltip
                key={session.id}
                title={isCollapsed ? `${session.name} (${session.participants} participants)` : ''}
                placement="right"
              >
                <ListItem 
                  button
                  sx={{ 
                    px: isCollapsed ? 1 : 2,
                    backgroundColor: 'rgba(68, 68, 68, 0.1)',
                    border: '1px solid rgba(23, 23, 23, 0.1)',
                    '&:hover': { 
                      backgroundColor: 'rgba(68, 68, 68, 0.2)',
                      border: '1px solid rgba(23, 23, 23, 0.2)',
                    }
                  }}
                >
                  {!isCollapsed && (
                    <ListItemText
                      primary={session.name}
                      secondary={`${session.participants} participants`}
                      primaryTypographyProps={{
                        sx: { 
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }
                      }}
                      secondaryTypographyProps={{
                        sx: { 
                          color: '#444444', 
                          fontSize: '0.75rem',
                        }
                      }}
                    />
                  )}
                  {isCollapsed && (
                    <Avatar 
                      variant="rounded"
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: '#171717',
                        color: '#FFFFFF',
                        fontSize: '0.875rem',
                      }}
                    >
                      {session.name[0]}
                    </Avatar>
                  )}
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 'auto',
          borderTop: '1px solid var(--divider-color)',
          background: themeMode === 'light'
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.95) 100%)'
            : 'linear-gradient(180deg, rgba(37, 40, 61, 0.4) 0%, rgba(37, 40, 61, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--primary-transparent-dark), transparent)',
          }
        }}
      >
        <Box
          sx={{
            p: isCollapsed ? 1.5 : 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid var(--divider-color)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: themeMode === 'light' 
                ? 'rgba(173, 73, 225, 0.05)'
                : 'rgba(255, 255, 255, 0.05)',
            }
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: statusOptions.find(s => s.value === profile?.status)?.color,
                  color: statusOptions.find(s => s.value === profile?.status)?.color,
                  boxShadow: `0 0 0 2px #25283D`,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: profile?.status === 'online' ? 'ripple 1.2s infinite ease-in-out' : 'none',
                    border: '1px solid currentColor',
                    content: '""',
                  },
                },
              }}
            >
              <Tooltip title={isCollapsed ? profile?.displayName || 'User' : ''}>
                <Avatar
                  src={profile?.avatar}
                  alt={profile?.displayName}
                  sx={{
                    width: isCollapsed ? 40 : 44,
                    height: isCollapsed ? 40 : 44,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#7743DB',
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              </Tooltip>
            </Badge>
          </Box>

          {!isCollapsed && (
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  position: 'relative',
                  paddingX: 0.5,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(119, 67, 219, 0.08) 0%, rgba(205, 193, 255, 0.08) 100%)',
                    borderRadius: '4px',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&:hover': {
                    color: '#7743DB',
                    '&::before': {
                      opacity: 1,
                    }
                  }
                }}
              >
                {profile?.displayName || 'User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: statusOptions.find(s => s.value === profile?.status)?.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  paddingX: 0.5,
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease',
                  '&:hover': {
                    opacity: 1,
                  }
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'currentColor',
                    boxShadow: () => `0 0 10px ${statusOptions.find(s => s.value === profile?.status)?.color}`,
                  }}
                />
                {statusOptions.find(s => s.value === profile?.status)?.label}
              </Typography>
            </Box>
          )}
        </Box>

        <Stack
          direction={isCollapsed ? 'column' : 'row'}
          spacing={isCollapsed ? 2 : 3}
          alignItems="center"
          justifyContent="center"
          sx={{
            p: isCollapsed ? 2 : 3,
            position: 'relative',
            backgroundColor: 'rgba(23, 23, 23, 0.05)',
            borderTop: '1px solid rgba(23, 23, 23, 0.1)',
          }}
        >
          <Tooltip 
            title="Settings" 
            placement={isCollapsed ? 'right' : 'top'}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 300 }}
          >
            <IconButton
              onClick={() => navigate('/dashboard/settings')}
              sx={{
                color: location.pathname === '/dashboard/settings' ? 'primary.main' : 'text.secondary',
                bgcolor: location.pathname === '/dashboard/settings' ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <IoSettingsSharp />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              height: isCollapsed ? '1px' : '24px',
              width: isCollapsed ? '80%' : '1px',
              background: 'rgba(23, 23, 23, 0.2)',
            }}
          />

          <Tooltip 
            title="Logout" 
            placement={isCollapsed ? 'right' : 'top'}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 300 }}
          >
            <IconButton
              onClick={handleLogoutClick}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: 'error.light',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <IoLogOutOutline />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          Are you sure you want to log out?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="error">Logout</Button>
        </DialogActions>
      </Dialog>

      <SubscriptionModal 
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </Box>
  );
}; 