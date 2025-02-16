import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, IconButton, Tooltip, Fade, CircularProgress } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Chat } from './Chat';
import { MediaPlayer } from './MediaPlayer';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import './split.css';
import { IoContract, IoExpand } from 'react-icons/io5';

export const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prioritizedPane, setPrioritizedPane] = useState<'media' | 'chat' | null>(null);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    rafId: 0,
    lastRatio: 50,
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Add any initialization logic here
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handlePrioritize = useCallback((pane: 'media' | 'chat') => {
    setPrioritizedPane(prevPane => {
      // If the same pane is clicked again, unprioritize it
      if (prevPane === pane) {
        return null;
      }
      // Otherwise, prioritize the clicked pane
      return pane;
    });
  }, []);

  const calculateRatio = useCallback((clientX: number) => {
    if (!containerRef.current) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newRatio = ((clientX - containerRect.left) / containerRect.width) * 100;
    
    // Enforce minimum sizes (20% of container)
    if (newRatio >= 20 && newRatio <= 80) {
      return newRatio;
    }
    
    return null;
  }, []);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // Cancel any existing animation frame
    if (dragRef.current.rafId) {
      cancelAnimationFrame(dragRef.current.rafId);
    }

    // Schedule the next update
    dragRef.current.rafId = requestAnimationFrame(() => {
      const newRatio = calculateRatio(e.clientX);
      if (newRatio !== null && newRatio !== dragRef.current.lastRatio) {
        dragRef.current.lastRatio = newRatio;
        setSplitRatio(newRatio);
      }
    });
  }, [isDragging, calculateRatio]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (dragRef.current.rafId) {
      cancelAnimationFrame(dragRef.current.rafId);
      dragRef.current.rafId = 0;
    }
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleDrag]);

  const initDrag = useCallback((e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    const initialRatio = calculateRatio(e.clientX);
    if (initialRatio !== null) {
      dragRef.current.lastRatio = initialRatio;
    }

    setIsDragging(true);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    
    // Prevent default browser drag behavior
    e.preventDefault();
  }, [handleDrag, handleMouseUp, calculateRatio]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      if (dragRef.current.rafId) {
        cancelAnimationFrame(dragRef.current.rafId);
      }
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleDrag, handleMouseUp]);

  // Add handler for friend selection
  const handleFriendSelect = useCallback((friendId: string) => {
    // Handle friend selection logic here
    console.log('Friend selected:', friendId);
  }, []);

  const renderMainContent = () => {
    const isMediaPrioritized = prioritizedPane === 'media';
    const isChatPrioritized = prioritizedPane === 'chat';
    const isPrioritized = isMediaPrioritized || isChatPrioritized;

    return (
      <Box 
        ref={containerRef}
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          gap: isPrioritized ? 0 : '4px',
          transition: 'gap 0.3s ease',
          p: '16px',
          pt: '8px',
        }}
      >
        <Box
          className={`split-pane ${isDragging ? 'dragging' : ''} ${isMediaPrioritized ? 'prioritized' : ''}`}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: isMediaPrioritized ? '100%' : 
                  isChatPrioritized ? '0%' : 
                  `${splitRatio}%`,
            opacity: isChatPrioritized ? 0 : 1,
            visibility: isChatPrioritized ? 'hidden' : 'visible',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
          role="region"
          aria-label="Media player panel"
        >
          <div className="pane-header">
            <div className="pane-title">
              <span className="pane-label">Media Player</span>
            </div>
            <Tooltip 
              title={isMediaPrioritized ? 'Minimize' : 'Maximize'} 
              TransitionComponent={Fade} 
              TransitionProps={{ timeout: 300 }}
              placement="bottom"
              arrow
            >
              <IconButton
                className={`priority-button ${isMediaPrioritized ? 'active' : ''}`}
                onClick={() => handlePrioritize('media')}
                aria-label={isMediaPrioritized ? 'Minimize media player' : 'Maximize media player'}
                size="small"
                sx={(theme) => ({
                  p: '6px',
                  color: isMediaPrioritized ? 'primary.main' : theme.palette.mode === 'dark' ? 'text.secondary' : 'rgba(42, 42, 42, 0.7)',
                  bgcolor: isMediaPrioritized ? 
                    `${theme.palette.primary.main}1F` : 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(237, 237, 237, 0.5)',
                  border: '1px solid',
                  borderColor: isMediaPrioritized ? 
                    `${theme.palette.primary.main}4D` : 'transparent',
                  backdropFilter: 'blur(8px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: (theme) => `radial-gradient(circle at center, ${theme.palette.primary.main}1F, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&:hover': {
                    color: isMediaPrioritized ? 'primary.main' : 
                      theme.palette.mode === 'dark' ? 'text.primary' : '#444444',
                    bgcolor: isMediaPrioritized ? 
                      `${theme.palette.primary.main}2E` : 
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(237, 237, 237, 0.8)',
                    borderColor: isMediaPrioritized ? 
                      `${theme.palette.primary.main}66` : 
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(68, 68, 68, 0.2)',
                    transform: 'translateY(-1px)',
                    boxShadow: isMediaPrioritized ? 
                      `0 4px 8px ${theme.palette.primary.main}26` : 
                      '0 4px 8px rgba(23, 23, 23, 0.1)',
                    '&::before': {
                      opacity: 1,
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '& svg': {
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                })}
              >
                {isMediaPrioritized ? <IoContract /> : <IoExpand />}
              </IconButton>
            </Tooltip>
          </div>
          <div className="pane-content" style={{ flex: 1, overflow: 'hidden' }}>
            <MediaPlayer />
          </div>
        </Box>

        {!isPrioritized && (
          <Box
            className="split-divider"
            onMouseDown={initDrag}
            sx={{
              width: '4px',
              backgroundColor: 'rgba(119, 67, 219, 0.2)',
              cursor: isDragging ? 'col-resize' : 'default',
              transition: 'all 0.3s ease',
              margin: '16px 8px',
              '&:hover': {
                backgroundColor: 'rgba(119, 67, 219, 0.4)',
                width: '6px',
                margin: '16px 7px',
              },
            }}
          />
        )}

        <Box
          className={`split-pane ${isDragging ? 'dragging' : ''} ${isChatPrioritized ? 'prioritized' : ''}`}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: isChatPrioritized ? '100%' : 
                  isMediaPrioritized ? '0%' : 
                  `${100 - splitRatio}%`,
            opacity: isMediaPrioritized ? 0 : 1,
            visibility: isMediaPrioritized ? 'hidden' : 'visible',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
          role="region"
          aria-label="Chat panel"
        >
          <div className="pane-header">
            <div className="pane-title">
              <span className="pane-label">Chat</span>
            </div>
            <Tooltip 
              title={isChatPrioritized ? 'Minimize' : 'Maximize'} 
              TransitionComponent={Fade} 
              TransitionProps={{ timeout: 300 }}
              placement="bottom"
              arrow
            >
              <IconButton
                className={`priority-button ${isChatPrioritized ? 'active' : ''}`}
                onClick={() => handlePrioritize('chat')}
                aria-label={isChatPrioritized ? 'Minimize chat' : 'Maximize chat'}
                size="small"
                sx={(theme) => ({
                  p: '6px',
                  color: isChatPrioritized ? 'primary.main' : theme.palette.mode === 'dark' ? 'text.secondary' : 'rgba(42, 42, 42, 0.7)',
                  bgcolor: isChatPrioritized ? 
                    `${theme.palette.primary.main}1F` : 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(237, 237, 237, 0.5)',
                  border: '1px solid',
                  borderColor: isChatPrioritized ? 
                    `${theme.palette.primary.main}4D` : 'transparent',
                  backdropFilter: 'blur(8px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: (theme) => `radial-gradient(circle at center, ${theme.palette.primary.main}1F, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&:hover': {
                    color: isChatPrioritized ? 'primary.main' : 
                      theme.palette.mode === 'dark' ? 'text.primary' : '#444444',
                    bgcolor: isChatPrioritized ? 
                      `${theme.palette.primary.main}2E` : 
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(237, 237, 237, 0.8)',
                    borderColor: isChatPrioritized ? 
                      `${theme.palette.primary.main}66` : 
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(68, 68, 68, 0.2)',
                    transform: 'translateY(-1px)',
                    boxShadow: isChatPrioritized ? 
                      `0 4px 8px ${theme.palette.primary.main}26` : 
                      '0 4px 8px rgba(23, 23, 23, 0.1)',
                    '&::before': {
                      opacity: 1,
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '& svg': {
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                })}
              >
                {isChatPrioritized ? <IoContract /> : <IoExpand />}
              </IconButton>
            </Tooltip>
          </div>
          <div className="pane-content" style={{ flex: 1, overflow: 'hidden' }}>
            <Chat />
          </div>
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default',
        color: 'error.main',
      }}>
        {error}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      width: '100vw',
      bgcolor: 'background.default',
      overflow: 'hidden',
      background: (theme) => theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1A1C2A 0%, #25283D 100%)'
        : 'linear-gradient(135deg, #F8F9FE 0%, #FFFFFF 100%)',
      position: 'relative',
      gap: '1px',
    }}>
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={handleSidebarToggle}
        onFriendSelect={handleFriendSelect}
      />
      
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        p: '16px',
        height: '100%',
        bgcolor: (theme) => theme.palette.mode === 'dark' 
          ? 'transparent'
          : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
      }}>
        {renderMainContent()}
      </Box>

      <Routes>
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </Box>
  );
};