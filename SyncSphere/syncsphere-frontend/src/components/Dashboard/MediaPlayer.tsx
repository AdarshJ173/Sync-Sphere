import { Box, Paper, IconButton, Stack, Typography, TextField, List, ListItem, InputAdornment, CircularProgress, Tabs, Tab, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ReactPlayer from 'react-player';
import { IoPlaySharp, IoPauseSharp, IoVolumeMediumSharp, IoVolumeMuteSharp, IoExpand, IoContract, IoSearch, IoCloseCircle, IoTv } from 'react-icons/io5';
import { FaYoutube, FaSpotify, FaAmazon, FaApple, FaPlay } from 'react-icons/fa';
import { SiNetflix, SiYoutubemusic } from 'react-icons/si';
import { useState, useRef, useEffect, useCallback } from 'react';
import { IconType } from 'react-icons';
import './MediaPlayer.css';
import './MediaPlayerHeader.css';
import { useChat } from '../../contexts/ChatContext';
import { MediaState } from '../../services/ChatService';

interface YouTubeApiResponse {
  items?: {
    id: { videoId: string };
    snippet: {
      title: string;
      thumbnails: {
        medium: { url: string };
      };
      channelTitle: string;
      publishedAt: string;
    };
  }[];
  error?: {
    message: string;
  };
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: IconType;
  color: string;
  baseUrl: string;
  embedUrl?: string;
  authUrl: string;
  authRequired: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  subtitle?: string;
  publishedAt?: string;
  uri?: string;
  type?: string;
}

const YOUTUBE_API_KEY = 'AIzaSyDwuEImMc8yqZPZSvsr9-7RB05z_AZc4Z4';
const LAST_VIDEO_KEY = 'syncSphere_lastVideo';
const LAST_VIDEO_TITLE_KEY = 'syncSphere_lastVideoTitle';
const LAST_PLATFORM_KEY = 'syncSphere_lastPlatform';
const LAST_PLATFORM_TYPE_KEY = 'syncSphere_lastPlatformType';
const PLATFORM_STATES_KEY = 'syncSphere_platformStates';

const SPOTIFY_CLIENT_ID = 'b1d717e3352344e097e4425cd83d60b4';
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/callback`;

// Add Spotify configuration
const getSpotifyAuthUrl = () => {
  const params = new URLSearchParams();
  params.append('client_id', SPOTIFY_CLIENT_ID);
  params.append('response_type', 'token');
  params.append('redirect_uri', SPOTIFY_REDIRECT_URI);
  params.append('scope', [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'user-library-modify',
    'user-read-playback-state',
    'user-modify-playback-state'
  ].join(' '));
  params.append('show_dialog', 'true');
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

const videoPlatforms: PlatformConfig[] = [
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: FaYoutube, 
    color: '#FF0000',
    baseUrl: 'https://www.youtube.com',
    embedUrl: 'https://www.youtube.com',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    authRequired: false
  },
  { 
    id: 'netflix', 
    name: 'Netflix', 
    icon: SiNetflix, 
    color: '#E50914',
    baseUrl: 'https://www.netflix.com',
    embedUrl: 'https://www.netflix.com',
    authUrl: 'https://www.netflix.com/login',
    authRequired: true
  },
  { 
    id: 'prime', 
    name: 'Prime Video', 
    icon: FaAmazon, 
    color: '#00A8E1',
    baseUrl: 'https://www.primevideo.com',
    embedUrl: 'https://www.primevideo.com',
    authUrl: 'https://www.amazon.com/ap/signin',
    authRequired: true
  },
  { 
    id: 'disney', 
    name: 'Disney+', 
    icon: FaPlay, 
    color: '#113CCF',
    baseUrl: 'https://www.disneyplus.com',
    embedUrl: 'https://www.disneyplus.com',
    authUrl: 'https://www.disneyplus.com/login',
    authRequired: true
  },
];

const musicPlatforms: PlatformConfig[] = [
  { 
    id: 'spotify', 
    name: 'Spotify', 
    icon: FaSpotify, 
    color: '#1DB954',
    baseUrl: 'https://open.spotify.com',
    embedUrl: '',
    authUrl: getSpotifyAuthUrl(),
    authRequired: true
  },
  { 
    id: 'apple-music', 
    name: 'Apple Music', 
    icon: FaApple, 
    color: '#FA466A',
    baseUrl: 'https://music.apple.com',
    embedUrl: 'https://music.apple.com',
    authUrl: 'https://music.apple.com/login',
    authRequired: true
  },
  { 
    id: 'amazon-music', 
    name: 'Amazon Music', 
    icon: FaAmazon, 
    color: '#00A8E1',
    baseUrl: 'https://music.amazon.com',
    embedUrl: 'https://music.amazon.com',
    authUrl: 'https://music.amazon.com/login',
    authRequired: true
  },
  { 
    id: 'youtube-music', 
    name: 'YouTube Music', 
    icon: SiYoutubemusic, 
    color: '#FF0000',
    baseUrl: 'https://music.youtube.com',
    embedUrl: 'https://music.youtube.com',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    authRequired: false
  },
];

interface PlatformState {
  url?: string;
  title?: string;
  embedUrl?: string;
  timestamp: number;
  type?: string;
  id?: string;
  progress?: number;
  volume?: number;
  isPlaying?: boolean;
}

// Update global declarations
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: Spotify.PlayerConstructor;
    };
  }
}

interface YouTubeInternalPlayer {
  getInternalPlayer: () => HTMLVideoElement;
  requestPictureInPicture: () => Promise<PictureInPictureWindow>;
  playVideo: () => void;
  pauseVideo: () => void;
  [key: string]: unknown;
}

const isYouTubePlayer = (player: unknown): player is YouTubeInternalPlayer => {
  if (!player || typeof player !== 'object') return false;
  const p = player as { getInternalPlayer?: unknown };
  return typeof p.getInternalPlayer === 'function';
};

interface ControlButtonProps {
  icon: IconType;
  onClick: () => void;
  tooltip: string;
  disabled?: boolean;
  active?: boolean;
}

const ControlButton = ({ icon: Icon, onClick, tooltip, disabled = false, active = false }: ControlButtonProps) => (
  <Tooltip title={tooltip} placement="top">
    <span>
      <IconButton
        onClick={onClick}
        disabled={disabled}
        sx={{
          color: active ? 'primary.main' : 'white',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
            background: 'rgba(255, 255, 255, 0.1)',
            '& svg': {
              filter: 'drop-shadow(0 0 8px rgba(110, 37, 148, 0.6))',
            },
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.3)',
            transform: 'none',
          },
          '& svg': {
            transition: 'all 0.3s ease',
          },
        }}
      >
        <Icon />
      </IconButton>
    </span>
  </Tooltip>
);

export const MediaPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('syncSphere_volume');
    return savedVolume ? parseFloat(savedVolume) : 0.7;
  });
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const playerRef = useRef<ReactPlayer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [mouseMoving, setMouseMoving] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [platformType, setPlatformType] = useState<'video' | 'music'>(() => {
    return (localStorage.getItem(LAST_PLATFORM_TYPE_KEY) as 'video' | 'music') || 'video';
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(() => {
    return localStorage.getItem(LAST_PLATFORM_KEY) || null;
  });
  const [platformStates, setPlatformStates] = useState<Record<string, PlatformState>>(() => {
    const savedStates = localStorage.getItem(PLATFORM_STATES_KEY);
    return savedStates ? JSON.parse(savedStates) : {};
  });
  const [currentUrl, setCurrentUrl] = useState(() => {
    return localStorage.getItem(LAST_VIDEO_KEY) || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  });
  const [currentVideoTitle, setCurrentVideoTitle] = useState(() => {
    return localStorage.getItem(LAST_VIDEO_TITLE_KEY) || 'Welcome to SyncSphere';
  });
  const [showPlatformInterface, setShowPlatformInterface] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<PlatformConfig | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState(currentUrl);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [backgroundPlayback, setBackgroundPlayback] = useState(false);
  const videoRef = useRef<YouTubeInternalPlayer | null>(null);
  // Keeping for potential future use
  // const [youtubeConfig] = useState({
  //   youtube: {
  //     playerVars: {
  //       controls: 1,
  //       showinfo: 1,
  //       rel: 0,
  //       modestbranding: 1,
  //       iv_load_policy: 3,
  //     }
  //   }
  // });
  // Keeping for potential future use
  // const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);

  const [spotifyEmbedDialog, setSpotifyEmbedDialog] = useState(false);
  const [spotifyEmbedCode, setSpotifyEmbedCode] = useState('');

  const [spotifyToken, setSpotifyToken] = useState<string | null>(localStorage.getItem('spotify_access_token'));
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [isSpotifyReady, setIsSpotifyReady] = useState(false);

  const [spotifyAuthError, setSpotifyAuthError] = useState<string | null>(null);

  const { chatService, userId } = useChat();
  const [syncLock, setSyncLock] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const SYNC_THRESHOLD = 2000; // 2 seconds threshold for sync updates
  const PROGRESS_SYNC_THRESHOLD = 3; // 3 seconds threshold for progress sync

  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  // Add state for YouTube content detection
  const [isYouTubeContent, setIsYouTubeContent] = useState(false);

  const checkIfYouTubeContent = useCallback((url: string) => {
    return url?.toLowerCase().includes('youtube.com') || url?.toLowerCase().includes('youtu.be');
  }, []);

  useEffect(() => {
    if (currentUrl) {
      setIsYouTubeContent(checkIfYouTubeContent(currentUrl));
    }
  }, [currentUrl, checkIfYouTubeContent]);

  useEffect(() => {
    const savedPlatform = localStorage.getItem(LAST_PLATFORM_KEY);
    
    if (savedPlatform) {
      const platform = [...videoPlatforms, ...musicPlatforms].find(p => p.id === savedPlatform);
      if (platform) {
        const savedState = platformStates[savedPlatform];
        setCurrentPlatform(platform);
        setShowPlatformInterface(true);
        setIsYouTubeContent(platform.id === 'youtube' || platform.id === 'youtube-music');
        
        if (savedState) {
          if (platform.id === 'spotify') {
            setCurrentPlatform({
              ...platform,
              embedUrl: savedState.embedUrl
            });
          } else {
            if (savedState.url) {
              setCurrentUrl(savedState.url);
              setResolvedUrl(savedState.url);
            }
            if (savedState.title) setCurrentVideoTitle(savedState.title);
            if (savedState.progress !== undefined) setProgress(savedState.progress);
            if (savedState.volume !== undefined) setVolume(savedState.volume);
            if (savedState.isPlaying !== undefined) setPlaying(savedState.isPlaying);
          }
        }
      }
    }
  }, [platformStates]);

  useEffect(() => {
    if (currentPlatform?.id === 'youtube' || currentPlatform?.id === 'youtube-music') {
      setIsYouTubeContent(true);
    } else {
      setIsYouTubeContent(false);
    }
  }, [currentPlatform]);

  useEffect(() => {
    localStorage.setItem('syncSphere_volume', volume.toString());
  }, [volume]);

  const savePlatformState = useCallback((platformId: string, state: PlatformState) => {
    setPlatformStates(prev => {
      const newStates = {
        ...prev,
        [platformId]: state
      };
      localStorage.setItem(PLATFORM_STATES_KEY, JSON.stringify(newStates));
      return newStates;
    });
  }, []);

  const handleSpotifyAuth = useCallback(() => {
    try {
      const authWindow = window.open(getSpotifyAuthUrl(), 'Spotify Login', 'width=800,height=600');
      
      if (!authWindow) {
        setAuthError('Popup blocked. Please allow popups and try again.');
        return;
      }

      // Check popup status
      const checkPopup = setInterval(() => {
        try {
          if (authWindow.closed) {
            clearInterval(checkPopup);
            if (!spotifyToken) {
              setAuthError('Authentication was cancelled.');
            }
          }
        } catch (e) {
          clearInterval(checkPopup);
          console.error('Error checking popup status:', e);
        }
      }, 500);

    } catch (error) {
      console.error('Error opening Spotify auth:', error);
      setAuthError('Failed to open Spotify authentication. Please try again.');
    }
  }, [spotifyToken]);

  useEffect(() => {
    // Handle Spotify Auth Callback
    const handleSpotifyCallback = () => {
      // Check if we're on the callback page
      if (window.location.pathname === '/callback') {
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const token = params.get('access_token');
          const error = params.get('error');
          
          if (error) {
            console.error('Spotify auth error:', error);
            if (window.opener) {
              window.opener.postMessage({ type: 'SPOTIFY_AUTH_ERROR', error }, window.location.origin);
              window.close();
            }
            return;
          }

          if (token) {
            localStorage.setItem('spotify_access_token', token);
            if (window.opener) {
              window.opener.postMessage({ type: 'SPOTIFY_AUTH', token }, window.location.origin);
              window.close();
            }
          }
        }
      }

      // Listen for auth message from popup
      const handleAuthMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'SPOTIFY_AUTH') {
          setSpotifyToken(event.data.token);
          setSpotifyAuthError(null);
        } else if (event.data?.type === 'SPOTIFY_AUTH_ERROR') {
          setSpotifyAuthError(event.data.error);
          setSpotifyToken(null);
          localStorage.removeItem('spotify_access_token');
        }
      };

      window.addEventListener('message', handleAuthMessage);
      return () => window.removeEventListener('message', handleAuthMessage);
    };

    handleSpotifyCallback();
  }, []);

  const handlePlatformSelect = useCallback((platformId: string) => {
    const platform = [...videoPlatforms, ...musicPlatforms].find(p => p.id === platformId);
    if (!platform) return;

    if (currentPlatform) {
      const currentState = {
        url: currentUrl,
        title: currentVideoTitle,
        embedUrl: currentPlatform.embedUrl,
        timestamp: Date.now(),
        progress: progress,
        volume: volume,
        isPlaying: playing,
        type: platformType
      };
      savePlatformState(currentPlatform.id, currentState);

      // If switching from video to music platform, enable PiP
      if (platform.id.includes('music') && !currentPlatform.id.includes('music') && videoRef.current) {
        if (document.pictureInPictureEnabled && isYouTubePlayer(videoRef.current)) {
          videoRef.current.requestPictureInPicture()
            .then(() => {
              setIsPiPActive(true);
              setBackgroundPlayback(true);
            })
            .catch(console.error);
        }
      }
    }

    setSelectedPlatform(platformId);
    localStorage.setItem(LAST_PLATFORM_KEY, platformId);
    
    setCurrentPlatform(platform);
    setShowPlatformInterface(true);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    setIsYouTubeContent(platformId === 'youtube' || platformId === 'youtube-music');

    // Handle Spotify authentication
    if (platformId === 'spotify') {
      if (!spotifyToken) {
        // Open auth in a new tab instead of redirecting
        handleSpotifyAuth();
        return;
      }
      if (!isSpotifyReady) {
        setAuthError('Initializing Spotify player...');
        return;
      }
      setSpotifyEmbedDialog(true);
    }

    // Restore previous state for the selected platform
    const savedState = platformStates[platformId];
    if (savedState) {
      if (savedState.url) setCurrentUrl(savedState.url);
      if (savedState.title) setCurrentVideoTitle(savedState.title);
      if (savedState.progress !== undefined) {
        setProgress(savedState.progress);
        if (playerRef.current) {
          playerRef.current.seekTo(savedState.progress, 'fraction');
        }
      }
      if (savedState.volume !== undefined) setVolume(savedState.volume);
      if (savedState.isPlaying !== undefined) setPlaying(savedState.isPlaying);
      if (savedState.type) setPlatformType(savedState.type as 'video' | 'music');
    }

    // Handle external platforms
    if (['netflix', 'prime', 'disney', 'apple-music'].includes(platformId)) {
      window.open(platform.baseUrl, '_blank', 'width=1200,height=800');
      setShowPlatformInterface(false);
      return;
    }
  }, [currentPlatform, currentUrl, currentVideoTitle, platformStates, savePlatformState, progress, volume, playing, platformType, spotifyToken, isSpotifyReady, handleSpotifyAuth]);

  const handleSpotifyEmbedSubmit = () => {
    if (!spotifyEmbedCode || !currentPlatform) return;

    // Extract the src URL from the embed code
    const srcMatch = spotifyEmbedCode.match(/src="([^"]+)"/);
    if (!srcMatch) {
        setAuthError('Invalid embed code. Please paste the entire iframe code from Spotify.');
        return;
    }

    const embedUrl = srcMatch[1];
    
    // Extract playlist/album/track ID from the embed URL
    const idMatch = embedUrl.match(/embed\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
    if (!idMatch) {
        setAuthError('Invalid Spotify embed URL format.');
        return;
    }

    const [, type, id] = idMatch;
    const newState = {
        embedUrl,
        type,
        id,
        timestamp: Date.now()
    };

    setCurrentPlatform({
        ...currentPlatform,
        embedUrl,
    });
    savePlatformState(currentPlatform.id, newState);
    setSpotifyEmbedDialog(false);
    setSpotifyEmbedCode('');

    // Remove track immediate play since we're using embed only
  };

  const handleSpotifyTrackSelect = async (trackUri: string) => {
    if (!spotifyToken || !spotifyDeviceId || !isSpotifyReady) {
        setAuthError('Spotify player not ready. Please try again.');
        return;
    }

    try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${spotifyToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [trackUri]
            })
        });
        setPlaying(true);
    } catch (error) {
        console.error('Error playing track:', error);
        if (error instanceof Response && error.status === 401) {
            // Token expired, clear and request new auth
            localStorage.removeItem('spotify_access_token');
            setSpotifyToken(null);
            window.location.href = currentPlatform?.authUrl || '';
        } else {
            setAuthError('Failed to play track. Please try again.');
        }
    }
  };

  const refreshToken = useCallback(async (platformId: string) => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: platformId,
          refreshToken: localStorage.getItem(`${platformId}_refresh_token`),
        }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem(`${platformId}_token`, token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, []);

  const getStreamingUrl = useCallback((url: string, token?: string | null): string => {
    if (!currentPlatform?.embedUrl) return url;
    
    const videoId = url.split('v=')[1] || url.split('/').pop() || '';
    let embedUrl = `${currentPlatform.embedUrl}${videoId}`;
    
    if (token) {
      embedUrl += `?auth_token=${encodeURIComponent(token)}`;
    }
    
    return embedUrl;
  }, [currentPlatform]);

  useEffect(() => {
    const verifyAndRefreshToken = async () => {
      if (!currentPlatform) return;
      
      const token = localStorage.getItem(`${currentPlatform.id}_token`);
      if (!token) {
        setResolvedUrl(getStreamingUrl(currentUrl));
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const refreshed = await refreshToken(currentPlatform.id);
          if (refreshed) {
            const newToken = localStorage.getItem(`${currentPlatform.id}_token`);
            setResolvedUrl(getStreamingUrl(currentUrl, newToken));
          }
        } else {
          setResolvedUrl(getStreamingUrl(currentUrl, token));
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setResolvedUrl(getStreamingUrl(currentUrl));
      }
    };

    verifyAndRefreshToken();
  }, [currentUrl, currentPlatform, getStreamingUrl, refreshToken]);

  const getSearchPlaceholder = useCallback(() => {
    if (!currentPlatform) return 'Search videos...';
    return `Search ${currentPlatform.name}${platformType === 'video' ? ' videos' : ' tracks'}...`;
  }, [currentPlatform, platformType]);

  useEffect(() => {
    localStorage.setItem(LAST_VIDEO_KEY, currentUrl);
    localStorage.setItem(LAST_VIDEO_TITLE_KEY, currentVideoTitle);
  }, [currentUrl, currentVideoTitle]);

  useEffect(() => {
    if (!chatService) return;

    const handleMediaStateUpdate = (state: MediaState) => {
      if (state.senderId === userId) return; // Ignore own updates
      if (Date.now() - state.timestamp > SYNC_THRESHOLD) return; // Ignore old updates

      setSyncLock(true);
      if (Math.abs(progress - state.progress) > PROGRESS_SYNC_THRESHOLD) {
        playerRef.current?.seekTo(state.progress, 'fraction');
      }
      setPlaying(state.isPlaying);
      setTimeout(() => setSyncLock(false), 500);
    };

    const handleMediaSeek = (data: { progress: number; timestamp: number; senderId: string }) => {
      if (data.senderId === userId) return;
      if (Date.now() - data.timestamp > SYNC_THRESHOLD) return;

      setSyncLock(true);
      playerRef.current?.seekTo(data.progress, 'fraction');
      setTimeout(() => setSyncLock(false), 500);
    };

    const handleMediaPlayPause = (data: { isPlaying: boolean; timestamp: number; senderId: string }) => {
      if (data.senderId === userId) return;
      if (Date.now() - data.timestamp > SYNC_THRESHOLD) return;

      setSyncLock(true);
      setPlaying(data.isPlaying);
      setTimeout(() => setSyncLock(false), 500);
    };

    chatService.on('media_state_update', handleMediaStateUpdate);
    chatService.on('media_seek', handleMediaSeek);
    chatService.on('media_play_pause', handleMediaPlayPause);

    return () => {
      chatService.off('media_state_update', handleMediaStateUpdate);
      chatService.off('media_seek', handleMediaSeek);
      chatService.off('media_play_pause', handleMediaPlayPause);
    };
  }, [chatService, userId, progress]);

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (syncLock || isDraggingTimeline) return;
    
    setProgress(state.played);
    setLocalProgress(state.played);
    setCurrentTime(state.playedSeconds);
    
    // Broadcast progress updates periodically
    if (Date.now() - lastUpdateRef.current > SYNC_THRESHOLD) {
      lastUpdateRef.current = Date.now();
      chatService?.updateMediaState({
        url: currentUrl || '',
        title: currentVideoTitle || '',
        isPlaying: playing,
        progress: state.played,
        timestamp: Date.now(),
        senderId: userId
      });
    }
  };

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    setIsDraggingTimeline(true);
    
    const updateTimelineProgress = (clientX: number) => {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      setLocalProgress(percentage);
    };
    
    updateTimelineProgress(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      updateTimelineProgress(e.clientX);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDraggingTimeline(false);
      if (playerRef.current) {
        const rect = timelineRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = x / rect.width;
        playerRef.current.seekTo(percentage, 'fraction');
        setProgress(percentage);
        chatService?.seekMedia(percentage);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current) return;
    setIsDraggingVolume(true);
    
    const updateVolume = (clientX: number) => {
      const rect = volumeBarRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const newVolume = Math.max(0, Math.min(1, x / rect.width));
      setVolume(newVolume);
    };
    
    updateVolume(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      updateVolume(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDraggingVolume(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handlePlayPause = useCallback(() => {
    if (syncLock) return;
    const newPlayingState = !playing;
    setPlaying(newPlayingState);
    chatService?.toggleMediaPlayPause(newPlayingState);
  }, [syncLock, playing, setPlaying, chatService]);

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const searchYouTube = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
          query
        )}&type=video&key=${YOUTUBE_API_KEY}`
      );
      
      const data: YouTubeApiResponse = await response.json();
      
      if (data.error) {
        console.error('YouTube API Error:', data.error);
        throw new Error(data.error.message || 'Failed to search videos');
      }
      
      if (data.items && data.items.length > 0) {
        setSearchResults(data.items.map((item) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString()
        })));
      } else {
        setSearchResults([]);
        setSearchError('No videos found. Try a different search term.');
      }
    } catch (error) {
      console.error('YouTube search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search videos. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      if (currentPlatform?.id === 'youtube' || currentPlatform?.id === 'youtube-music') {
        searchYouTube(searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentPlatform?.id]);

  const handleMediaSelect = (result: SearchResult) => {
    if (currentPlatform?.id === 'youtube' || currentPlatform?.id === 'youtube-music') {
      const videoUrl = `https://www.youtube.com/watch?v=${result.id}`;
      
      // Immediately update URL and title for quick feedback
      setCurrentUrl(videoUrl);
      setResolvedUrl(videoUrl);
      setCurrentVideoTitle(result.title);
      setProgress(0);
      setPlaying(true);
      setShowPlatformInterface(true);
      setIsYouTubeContent(true);

      // Force player reset if needed
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }

      // Save to localStorage immediately
      localStorage.setItem(LAST_VIDEO_KEY, videoUrl);
      localStorage.setItem(LAST_VIDEO_TITLE_KEY, result.title);
      localStorage.setItem(LAST_PLATFORM_KEY, currentPlatform.id);

      // Update platform state after playback starts
      const newState = {
        url: videoUrl,
        title: result.title,
        id: result.id,
        timestamp: Date.now(),
        progress: 0,
        volume: volume,
        isPlaying: true,
        type: platformType
      };
      
      savePlatformState(currentPlatform.id, newState);
    }

    // Clear search UI immediately for better UX
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (mouseMoving) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen && playing) {
          setShowControls(false);
          setMouseMoving(false);
        }
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [mouseMoving, isFullscreen, playing]);

  const toggleFullscreen = async () => {
    if (!playerContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await playerContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  // Add recovery effect
  useEffect(() => {
    if (recoveryAttempts > 0 && recoveryAttempts < 3) {
      const timer = setTimeout(() => {
        console.log('Attempting playback recovery...');
        // Reset player state
        if (playerRef.current) {
          playerRef.current.seekTo(0);
          setPlaying(true);
        }
        // Reset URL to trigger reload
        setResolvedUrl(currentUrl);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [recoveryAttempts, currentUrl, setPlaying, setResolvedUrl]);

  useEffect(() => {
    // Cleanup function for player initialization
    return () => {
      if (playerInitTimeoutRef.current) {
        clearTimeout(playerInitTimeoutRef.current);
      }
    };
  }, []);

  const renderPlayer = useCallback(() => {
    if (!currentPlatform || !showPlatformInterface) return null;

    if (currentPlatform.id === 'spotify') {
      if (!spotifyToken) {
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            gap: 2
          }}>
            <Typography variant="h6">Spotify Premium Required</Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
              To play full songs, please connect your Spotify Premium account.
              Free accounts can only play song previews.
            </Typography>
            {spotifyAuthError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {spotifyAuthError}
              </Typography>
            )}
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSpotifyAuth}
              startIcon={<FaSpotify />}
            >
              Connect Spotify Premium
            </Button>
          </Box>
        );
      }

      return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <iframe
            src={resolvedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="encrypted-media; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Web App"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            onLoad={() => {
              // Add message listener for track selection
              window.addEventListener('message', (event) => {
                if (event.origin !== 'https://open.spotify.com') return;
                try {
                  const data = JSON.parse(event.data);
                  if (data.type === 'playback' && data.uri) {
                    handleSpotifyTrackSelect(data.uri);
                  }
                } catch (e) {
                  // Ignore invalid messages
                }
              });
            }}
          />
        </Box>
      );
    }

    if (currentPlatform.id === 'youtube' || currentPlatform.id === 'youtube-music') {
      return (
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            height: '100%',
            aspectRatio: '16/9',
            maxHeight: 'calc(100% - 32px)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <ReactPlayer
            ref={playerRef}
            url={resolvedUrl}
            width="100%"
            height="100%"
            playing={playing}
            volume={volume}
            muted={volume === 0}
            onProgress={handleProgress}
            onDuration={setDuration}
            onReady={(player) => {
              // Force play on ready if needed
              if (playing) {
                try {
                  player.getInternalPlayer().playVideo();
                } catch (e) {
                  console.error('Error forcing playback:', e);
                }
              }
            }}
            onError={(e) => {
              console.error('Player error:', e);
              // Attempt recovery
              if (recoveryAttempts < 3) {
                setRecoveryAttempts(prev => prev + 1);
                // Force reload the player
                setResolvedUrl('');
                setTimeout(() => setResolvedUrl(currentUrl), 100);
              }
            }}
            onPlay={() => {
              if (!syncLock) {
                setPlaying(true);
                chatService?.toggleMediaPlayPause(true);
              }
            }}
            onPause={() => {
              if (!syncLock) {
                setPlaying(false);
                chatService?.toggleMediaPlayPause(false);
              }
            }}
            progressInterval={1000}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '8px',
            }}
            config={{
              youtube: {
                playerVars: {
                  controls: isYouTubeContent ? 1 : 0,
                  modestbranding: 1,
                  playsinline: 1,
                  rel: 0,
                  iv_load_policy: 3,
                  origin: window.location.origin,
                  autoplay: 1,
                  enablejsapi: 1,
                  start: 0
                },
                onUnstarted: () => {
                  // Force play if video doesn't start
                  if (playing && videoRef.current && isYouTubePlayer(videoRef.current)) {
                    videoRef.current.playVideo();
                  }
                }
              },
            }}
          />
        </Box>
      );
    }

    return null;
  }, [currentPlatform, showPlatformInterface, resolvedUrl, playing, volume, handleProgress, isYouTubeContent, chatService, syncLock, currentUrl, recoveryAttempts]);

  const handlePlatformTypeChange = (_: React.SyntheticEvent, newValue: 'video' | 'music') => {
    if (currentPlatform) {
      const currentState = {
        url: currentUrl,
        title: currentVideoTitle,
        embedUrl: currentPlatform.embedUrl,
        timestamp: Date.now(),
        progress: progress,
        volume: volume,
        isPlaying: playing
      };
      savePlatformState(currentPlatform.id, currentState);
      
      // If switching from video to music, enable PiP
      if (newValue === 'music' && platformType === 'video' && videoRef.current && document.pictureInPictureEnabled) {
        videoRef.current.requestPictureInPicture()
          .then(() => {
            setIsPiPActive(true);
            setBackgroundPlayback(true);
          })
          .catch(console.error);
      }
    }

    setPlatformType(newValue);
    localStorage.setItem(LAST_PLATFORM_TYPE_KEY, newValue);
    
    const platforms = newValue === 'video' ? videoPlatforms : musicPlatforms;
    const lastStates = Object.entries(platformStates)
      .filter(([id]) => platforms.some(p => p.id === id))
      .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));

    if (lastStates.length > 0) {
      const [lastPlatformId] = lastStates[0];
      handlePlatformSelect(lastPlatformId);
    } else {
      setSelectedPlatform(null);
      setCurrentPlatform(null);
      setShowPlatformInterface(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && playing && currentPlatform?.id === 'youtube') {
        setBackgroundPlayback(true);
        if (videoRef.current && document.pictureInPictureEnabled && !isPiPActive && isYouTubePlayer(videoRef.current)) {
          videoRef.current.requestPictureInPicture()
            .then(() => setIsPiPActive(true))
            .catch(console.error);
        }
      }
    };

    const handlePiPChange = () => {
      setIsPiPActive(!!document.pictureInPictureElement);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, [playing, currentPlatform, isPiPActive]);

  useEffect(() => {
    if (backgroundPlayback) {
      // Keep audio playing when tab is not focused
      navigator.mediaSession.setActionHandler('pause', () => {
        setPlaying(false);
        setBackgroundPlayback(false);
      });
      
      navigator.mediaSession.setActionHandler('play', () => {
        setPlaying(true);
        setBackgroundPlayback(true);
      });
    }
  }, [backgroundPlayback]);

  // Add media session metadata
  useEffect(() => {
    if (backgroundPlayback && currentVideoTitle) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentVideoTitle,
        artist: 'YouTube',
        artwork: [
          { src: 'favicon.ico', sizes: '96x96', type: 'image/png' }
        ]
      });

      // Keep audio playing when tab is not focused
      navigator.mediaSession.setActionHandler('pause', () => {
        setPlaying(false);
        setBackgroundPlayback(false);
      });
      
      navigator.mediaSession.setActionHandler('play', () => {
        setPlaying(true);
        setBackgroundPlayback(true);
      });

      // Add seek handlers
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (playerRef.current) {
          const newTime = Math.max(0, currentTime - 10);
          playerRef.current.seekTo(newTime, 'seconds');
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (playerRef.current) {
          const newTime = Math.min(duration, currentTime + 10);
          playerRef.current.seekTo(newTime, 'seconds');
        }
      });
    }
  }, [backgroundPlayback, currentVideoTitle, currentTime, duration]);

  useEffect(() => {
    if (spotifyToken) {
      // Initialize Spotify Web Playback SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'SyncSphere Web Player',
          getOAuthToken: cb => { cb(spotifyToken); }
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
          setSpotifyDeviceId(device_id);
          setIsSpotifyReady(true);
        });

        player.connect();
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [spotifyToken]);

  useEffect(() => {
    // Restore last video state on mount
    const lastVideo = localStorage.getItem(LAST_VIDEO_KEY);
    const lastTitle = localStorage.getItem(LAST_VIDEO_TITLE_KEY);
    const lastPlatform = localStorage.getItem(LAST_PLATFORM_KEY);
    
    if (lastVideo && lastTitle) {
      setCurrentUrl(lastVideo);
      setResolvedUrl(lastVideo);
      setCurrentVideoTitle(lastTitle);
      setIsYouTubeContent(checkIfYouTubeContent(lastVideo));
      
      // If it's a YouTube video, ensure YouTube platform is selected
      if (checkIfYouTubeContent(lastVideo) && lastPlatform !== 'youtube') {
        const platform = videoPlatforms.find(p => p.id === 'youtube');
        if (platform) {
          setCurrentPlatform(platform);
          setSelectedPlatform('youtube');
          localStorage.setItem(LAST_PLATFORM_KEY, 'youtube');
        }
      }
      
      setShowPlatformInterface(true);
    }
  }, []);

  // Add recovery attempts state
  const playerInitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Paper 
        elevation={3} 
        className="media-player-header"
        sx={{ 
          p: 2, 
          position: 'relative',
          overflow: 'visible',
          background: 'linear-gradient(45deg, #1a1a1a, #2d2d2d)',
          zIndex: 1000,
          flexShrink: 0, // Prevent header from shrinking
        }}
      >
        {/* Animation Container */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <div className="header-background">
            <div className="header-background-wave" />
            <div className="header-background-flow" />
            <div className="header-background-particles" />
          </div>
        </Box>

        {/* Header Content */}
        <Box 
          sx={{ 
            position: 'relative',
            zIndex: 1001,
          }}
        >
          <Box sx={{ 
            p: { xs: 2, md: 2.5 },
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'rgba(37, 40, 61, 0.95)',
            position: 'relative',
          }}>
            {/* Platform selection and search content */}
            <Box sx={{ 
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {/* Platform selection */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                minWidth: '200px',
                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                pr: 2,
              }}>
                <Tabs
                  value={platformType}
                  onChange={handlePlatformTypeChange}
                  sx={{
                    minHeight: '36px',
                    mb: 1,
                    '& .MuiTab-root': {
                      minHeight: '36px',
                      fontSize: '0.85rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-selected': {
                        color: 'white',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      background: 'linear-gradient(45deg, #7743DB, #CDC1FF)',
                    }
                  }}
                >
                  <Tab value="video" label="Video" />
                  <Tab value="music" label="Music" />
                </Tabs>
                
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {(platformType === 'video' ? videoPlatforms : musicPlatforms).map((platform) => (
                    <Tooltip 
                      key={platform.id} 
                      title={platform.authRequired ? `${platform.name} (Login Required)` : platform.name}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handlePlatformSelect(platform.id)}
                        sx={{
                          color: platform.color,
                          bgcolor: selectedPlatform === platform.id ? `${platform.color}20` : 'transparent',
                          width: 32,
                          height: 32,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: `${platform.color}40`,
                            transform: 'translateY(-2px)',
                          },
                          ...(selectedPlatform === platform.id && {
                            boxShadow: `0 0 10px ${platform.color}40`,
                          }),
                          ...(platform.authRequired && {
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: 'warning.main',
                            }
                          })
                        }}
                      >
                        <platform.icon size={18} />
                      </IconButton>
                    </Tooltip>
                  ))}
                </Stack>
              </Box>

              {/* Search container */}
              <Box sx={{ 
                position: 'relative',
                flex: 1,
              }}>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  disabled={Boolean(!currentPlatform || (currentPlatform.authRequired && Boolean(authError)))}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(true);
                    setSearchError(null);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isSearching ? (
                          <CircularProgress size={20} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        ) : (
                          <IoSearch style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        )}
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setShowSearch(false);
                            setSearchError(null);
                          }}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                              color: 'white',
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                            }
                          }}
                        >
                          <IoCloseCircle />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        '& fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                        }
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                      fontSize: '0.95rem',
                      padding: '12px 14px',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                    },
                  }}
                />

                {/* Search Suggestions */}
                {showSearch && (searchResults.length > 0 || isSearching || searchError) && (
                  <List sx={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(37, 40, 61, 0.98)',
                    zIndex: 1002,
                    maxHeight: '400px',
                    overflow: 'auto',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '3px',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                  }}>
                    {isSearching && (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <CircularProgress size={30} />
                      </Box>
                    )}

                    {searchError && (
                      <Box sx={{ p: 2, color: 'error.main' }}>
                        <Typography>{searchError}</Typography>
                      </Box>
                    )}

                    {!isSearching && !searchError && searchResults.map((result) => (
                      <ListItem
                        key={result.id}
                        onClick={() => handleMediaSelect(result)}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: 'rgba(110, 37, 148, 0.2)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={result.thumbnail}
                          alt={result.title}
                          sx={{
                            width: currentPlatform?.id === 'spotify' ? 60 : 160,
                            height: currentPlatform?.id === 'spotify' ? 60 : 90,
                            objectFit: 'cover',
                            borderRadius: currentPlatform?.id === 'spotify' ? '4px' : 1,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ 
                            color: 'white',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {result.title}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.8rem',
                          }}>
                            {result.subtitle || result.publishedAt}
                          </Typography>
                          {result.type && (
                            <Typography variant="caption" sx={{ 
                              color: 'primary.main',
                              textTransform: 'capitalize',
                              bgcolor: 'rgba(110, 37, 148, 0.1)',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                            }}>
                              {result.type}
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Auth Error Dialog */}
        {authError && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 1003, // Above search suggestions
              p: 3,
              borderRadius: 2,
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxWidth: 400,
            }}
          >
            <Typography variant="h6" sx={{ color: 'warning.main', mb: 2 }}>
              Authentication Required
            </Typography>
            <Typography sx={{ color: 'white', mb: 3 }}>
              {authError}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setAuthError(null)}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              Close
            </Button>
          </Box>
        )}
      </Paper>

      {/* Video Player Container */}
      <Box 
        ref={playerContainerRef} 
        sx={{ 
          flex: 1,
          position: 'relative',
          minHeight: 0, // Important for flex container
          padding: '16px',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .custom-controls': {
            display: isYouTubeContent ? 'none' : 'flex',
            zIndex: 2
          }
        }}
      >
        {renderPlayer()}

        {/* Custom controls container with conditional display */}
        <Box 
          className="custom-controls"
          sx={{
            position: 'absolute',
            bottom: '16px', // Match container padding
            left: '16px',
            right: '16px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'opacity 0.3s ease',
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? 'auto' : 'none',
            borderRadius: '0 0 8px 8px', // Optional: rounded corners for bottom
          }}
        >
          <Box
            ref={timelineRef}
            component="div"
            sx={{
              position: 'relative',
              width: '100%',
              height: '4px',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                height: '6px',
                '& .progress-thumb': {
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 10px rgba(110, 37, 148, 0.8)',
                  opacity: 1,
                },
              },
            }}
            onMouseDown={handleTimelineMouseDown}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${(isDraggingTimeline ? localProgress : progress) * 100}%`,
                bgcolor: 'primary.main',
                borderRadius: 'inherit',
                background: 'linear-gradient(90deg, #7743DB, #CDC1FF)',
                transition: isDraggingTimeline ? 'none' : 'width 0.1s linear',
              }}
            />
            <Box
              className="progress-thumb"
              sx={{
                position: 'absolute',
                left: `${(isDraggingTimeline ? localProgress : progress) * 100}%`,
                top: '50%',
                width: '12px',
                height: '12px',
                bgcolor: '#fff',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                transition: isDraggingTimeline ? 'none' : 'all 0.3s ease',
                boxShadow: '0 0 5px rgba(110, 37, 148, 0.5)',
                opacity: isDraggingTimeline ? 1 : 0.8,
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.2)',
                  opacity: 1,
                },
              }}
            />
          </Box>
          
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mt: 1 }}
          >
            <ControlButton
              icon={playing ? IoPauseSharp : IoPlaySharp}
              onClick={handlePlayPause}
              tooltip={playing ? "Pause" : "Play"}
            />

            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              minWidth: 100,
              fontSize: '0.85rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.4)',
            }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center" 
              sx={{ 
                ml: 'auto !important',
                minWidth: 150,
              }}
            >
              <ControlButton
                icon={volume === 0 ? IoVolumeMuteSharp : IoVolumeMediumSharp}
                onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                tooltip={volume === 0 ? "Unmute" : "Mute"}
              />
              
              <Box
                ref={volumeBarRef}
                sx={{
                  width: 80,
                  height: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    height: 6,
                    '& .volume-thumb': {
                      transform: 'translate(-50%, -50%) scale(1.2)',
                      boxShadow: '0 0 10px rgba(110, 37, 148, 0.8)',
                      opacity: 1,
                    },
                  },
                }}
                onMouseDown={handleVolumeMouseDown}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${volume * 100}%`,
                    bgcolor: 'primary.main',
                    borderRadius: 'inherit',
                    background: 'linear-gradient(90deg, #7743DB, #CDC1FF)',
                    transition: isDraggingVolume ? 'none' : 'width 0.1s linear',
                  }}
                />
                <Box
                  className="volume-thumb"
                  sx={{
                    position: 'absolute',
                    left: `${volume * 100}%`,
                    top: '50%',
                    width: 12,
                    height: 12,
                    bgcolor: '#fff',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    transition: isDraggingVolume ? 'none' : 'all 0.3s ease',
                    boxShadow: '0 0 5px rgba(110, 37, 148, 0.5)',
                    opacity: isDraggingVolume ? 1 : 0.8,
                    '&:hover': {
                      transform: 'translate(-50%, -50%) scale(1.2)',
                      opacity: 1,
                    },
                  }}
                />
              </Box>

              {document.pictureInPictureEnabled && currentPlatform?.id === 'youtube' && (
                <ControlButton
                  icon={IoTv}
                  onClick={() => {
                    if (videoRef.current) {
                      if (document.pictureInPictureElement) {
                        document.exitPictureInPicture();
                      } else {
                        videoRef.current.requestPictureInPicture();
                      }
                    }
                  }}
                  tooltip={isPiPActive ? "Exit Picture in Picture" : "Enter Picture in Picture"}
                  active={isPiPActive}
                />
              )}

              <ControlButton
                icon={isFullscreen ? IoContract : IoExpand}
                onClick={toggleFullscreen}
                tooltip={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                active={isFullscreen}
              />
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Dialog 
        open={spotifyEmbedDialog} 
        onClose={() => setSpotifyEmbedDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enter Spotify Embed Code</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please paste the embed code from Spotify. You can get this by clicking "Share" on any Spotify playlist, album, or track, then selecting "Embed".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Spotify Embed Code"
            fullWidth
            multiline
            rows={4}
            value={spotifyEmbedCode}
            onChange={(e) => setSpotifyEmbedCode(e.target.value)}
            error={!!authError}
            helperText={authError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpotifyEmbedDialog(false)}>Cancel</Button>
          <Button onClick={handleSpotifyEmbedSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaPlayer; 