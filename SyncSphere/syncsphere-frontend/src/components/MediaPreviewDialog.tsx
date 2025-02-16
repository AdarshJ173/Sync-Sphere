import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Slider,
  Typography,
  Stack,
  Tooltip,
  DialogTitle,
} from '@mui/material';
import {
  IoClose,
  IoPlay,
  IoPause,
  IoVolumeMedium,
  IoVolumeMute,
  IoExpand,
  IoContract,
  IoDownload,
} from 'react-icons/io5';

interface MediaPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  media: {
    url: string;
    type: 'image' | 'video';
    duration?: number;
  };
  onPlay?: (videoElement: HTMLVideoElement) => void;
}

export const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({
  open,
  onClose,
  media,
  onPlay,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && videoRef.current && media.type === 'video' && onPlay) {
      onPlay(videoRef.current);
    }
  }, [open, media.type, onPlay]);

  useEffect(() => {
    if (!open) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.pause();
      }
    }
  }, [open]);

  useEffect(() => {
    if (media.duration) {
      setDuration(media.duration);
    }
  }, [media.duration]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      if (!media.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const volumeValue = newValue as number;
    setVolume(volumeValue);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue;
    }
    setIsMuted(volumeValue === 0);
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleSeek = (_: Event, newValue: number | number[]) => {
    const seekTime = newValue as number;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = `media_${Date.now()}${media.type === 'image' ? '.jpg' : '.mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Preview
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <IoClose />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {media.type === 'image' ? (
          <img
            src={media.url}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 200px)',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={media.url}
            controls
            controlsList="nodownload"
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 200px)',
              display: 'block',
              margin: '0 auto',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handlePlayPause}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}; 