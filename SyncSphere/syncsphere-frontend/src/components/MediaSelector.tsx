import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  IoImage, 
  IoVideocam, 
  IoCamera, 
  IoClose, 
  IoStop,
  IoRadioButtonOn,
  IoSend,
  IoTrash,
  IoDocument,
} from 'react-icons/io5';
import './MediaSelector.css';

interface MediaSelectorProps {
  onMediaSelect: (file: File, type: 'image' | 'video' | 'document', metadata?: { duration?: number }) => void;
  className?: string;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({ onMediaSelect, className = '' }) => {
  const [activeView, setActiveView] = useState<'options' | 'camera' | 'preview' | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewData, setPreviewData] = useState<{
    file: File;
    url: string;
    duration?: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopMediaStream();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (previewData) {
        URL.revokeObjectURL(previewData.url);
      }
    };
  }, []);

  const stopMediaStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingTime(0);
    chunksRef.current = [];
  }, [stream, isRecording]);

  const startCamera = async (type: 'image' | 'video', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: type === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setError(null);
      setMediaType(type);
      setActiveView('camera');
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  };

  const handleFileSelect = (type: 'image' | 'video' | 'document') => {
    const inputRef = type === 'document' ? documentInputRef : fileInputRef;
    if (inputRef.current) {
      inputRef.current.accept = type === 'image' 
        ? 'image/*' 
        : type === 'video'
          ? 'video/*'
          : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv';
      inputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'video') {
      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      const duration = video.duration;
      URL.revokeObjectURL(video.src);
      onMediaSelect(file, type, { duration });
    } else {
      onMediaSelect(file, type);
    }
    event.target.value = '';
  };

  const handleMediaSelect = (file: File, type: 'image' | 'video') => {
    try {
      const url = URL.createObjectURL(file);
      
      if (type === 'video') {
        // For uploaded videos, get duration before sending
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        
        tempVideo.onloadedmetadata = () => {
          const duration = tempVideo.duration;
          URL.revokeObjectURL(tempVideo.src);
          
          setPreviewData({ 
            file,
            url,
            duration
          });
          setActiveView('preview');
        };
        
        tempVideo.onerror = () => {
          console.error('Error loading video metadata');
          setPreviewData({ 
            file,
            url
          });
          setActiveView('preview');
          URL.revokeObjectURL(tempVideo.src);
        };
        
        tempVideo.src = url;
      } else {
        setPreviewData({ file, url });
        setActiveView('preview');
      }
    } catch (error) {
      console.error(`Failed to handle ${type} selection:`, error);
    }
  };

  const handleSendMedia = () => {
    if (previewData) {
      const message = {
        file: previewData.file,
        type: mediaType as 'image' | 'video' | 'document',
        metadata: {
          duration: previewData.duration
        }
      };
      onMediaSelect(message.file, message.type, message.metadata);
      URL.revokeObjectURL(previewData.url);
      setPreviewData(null);
      setActiveView(null);
    }
  };

  const handleCancelPreview = () => {
    if (previewData) {
      URL.revokeObjectURL(previewData.url);
      setPreviewData(null);
    }
    setActiveView(null);
  };

  const startRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Create a temporary video element to get duration
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        
        // Create a promise to handle metadata loading
        const getDuration = new Promise<number>((resolve) => {
          tempVideo.onloadedmetadata = () => {
            resolve(tempVideo.duration);
            URL.revokeObjectURL(tempVideo.src);
          };
          tempVideo.onerror = () => {
            console.error('Error loading video metadata');
            resolve(0);
            URL.revokeObjectURL(tempVideo.src);
          };
        });

        // Set the source and start loading metadata
        tempVideo.src = URL.createObjectURL(blob);
        
        // Wait for duration to be loaded
        const duration = await getDuration;
        
        const file = new File([blob], `video_${Date.now()}.webm`, { 
          type: 'video/webm',
          lastModified: Date.now()
        });
        
        const url = URL.createObjectURL(file);
        setPreviewData({ 
          file,
          url,
          duration // Store duration in preview data
        });
        setActiveView('preview');
      }
      stopMediaStream();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const captureImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(file);
        setPreviewData({ file, url });
        setActiveView('preview');
        stopMediaStream();
      }
    }, 'image/jpeg', 0.95);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderOptions = () => (
    <Box className="media-options">
      <List>
        <ListItem
          button
          onClick={() => handleFileSelect('image')}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <IoImage size={24} />
          </ListItemIcon>
          <ListItemText primary="Photo" secondary="Share a photo from your device" />
        </ListItem>

        <ListItem
          button
          onClick={() => handleFileSelect('video')}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <IoVideocam size={24} />
          </ListItemIcon>
          <ListItemText primary="Video" secondary="Share a video from your device" />
        </ListItem>

        <ListItem
          button
          onClick={() => handleFileSelect('document')}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <IoDocument size={24} />
          </ListItemIcon>
          <ListItemText primary="Document" secondary="Share PDF, Word, Excel, or other documents" />
        </ListItem>

        <ListItem
          button
          onClick={(e) => {
            e.preventDefault();
            setActiveView('camera');
            setMediaType('image');
            startCamera('image', e);
          }}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <IoCamera size={24} />
          </ListItemIcon>
          <ListItemText primary="Camera" secondary="Take a photo or record a video" />
        </ListItem>
      </List>
    </Box>
  );

  const renderCamera = () => (
    <Box className="camera-view">
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
            transform: 'scaleX(-1)',
          }}
        />
        
        {error ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'error.main',
              p: 2,
              textAlign: 'center',
              borderRadius: '8px',
            }}
          >
            {error}
          </Box>
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              p: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}
          >
            {isRecording && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'error.main',
                }}
              >
                <IoRadioButtonOn className="blink" />
                <Typography variant="body2">
                  {formatTime(recordingTime)}
                </Typography>
              </Box>
            )}
            
            <IconButton
              onClick={() => {
                stopMediaStream();
                setActiveView(null);
              }}
              sx={{ 
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <IoClose />
            </IconButton>
          </Box>
        )}
      </Box>

      {!error && (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() => setMediaType(mediaType === 'image' ? 'video' : 'image')}
            startIcon={mediaType === 'image' ? <IoVideocam /> : <IoCamera />}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Switch to {mediaType === 'image' ? 'Video' : 'Photo'}
          </Button>

          {mediaType === 'image' ? (
            <Button
              variant="contained"
              startIcon={<IoCamera />}
              onClick={captureImage}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              Take Photo
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={isRecording ? <IoStop /> : <IoVideocam />}
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? 'recording' : ''}
              sx={{
                bgcolor: isRecording ? 'error.main' : 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: isRecording ? 'error.dark' : 'primary.dark',
                },
                '&.recording': {
                  animation: 'pulse 1.5s infinite',
                },
              }}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );

  const renderPreview = () => (
    <Box className="preview-view">
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
        {mediaType === 'image' ? (
          <img
            src={previewData?.url}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            }}
          />
        ) : (
          <video
            src={previewData?.url}
            controls
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
            }}
          />
        )}
      </Box>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ mt: 2 }}
      >
        <Button
          variant="outlined"
          startIcon={<IoTrash />}
          onClick={handleCancelPreview}
          sx={{
            color: 'error.main',
            borderColor: 'error.main',
            '&:hover': {
              borderColor: 'error.dark',
              bgcolor: 'error.dark',
              color: 'white',
            },
          }}
        >
          Discard
        </Button>
        <Button
          variant="contained"
          startIcon={<IoSend />}
          onClick={handleSendMedia}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Send
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box className={`media-selector ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, e.target.accept.includes('image') ? 'image' : 'video')}
      />
      <input
        type="file"
        ref={documentInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, 'document')}
      />
      
      {activeView === 'camera' ? renderCamera() :
       activeView === 'preview' ? renderPreview() :
       renderOptions()}
    </Box>
  );
};

export default MediaSelector; 