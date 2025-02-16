import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Grid, Paper, Typography, IconButton, Stack } from '@mui/material';
import { MediaPlayer } from '../../components/Dashboard/MediaPlayer';
import { Chat } from '../../components/Dashboard/Chat';
import WebSocketService from '../../services/WebSocketService';
import ChatService from '../../services/ChatService';
import WebRTCService from '../../services/WebRTCService';
import { useAuth } from '../../contexts/AuthContext';
import { MicOff, Mic, VideocamOff, Videocam, CallEnd } from '@mui/icons-material';

interface SessionInfo {
  id: string;
  name: string;
  participants: number;
  videoUrl?: string;
}

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
}

export const SessionRoom = () => {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  const wsRef = useRef<WebSocketService | null>(null);
  const chatRef = useRef<ChatService | null>(null);
  const webRTCRef = useRef<WebRTCService | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!user) return;

    // Initialize WebSocket service
    wsRef.current = new WebSocketService(user.id);
    wsRef.current.connect().then(() => {
      // Initialize Chat service
      if (wsRef.current) {
        chatRef.current = new ChatService(wsRef.current.getSocket(), user.id);
        // Initialize WebRTC service
        webRTCRef.current = new WebRTCService(wsRef.current.getSocket(), user.id);
      }
    }).catch(console.error);

    return () => {
      wsRef.current?.disconnect();
      webRTCRef.current?.leaveRoom();
    };
  }, [user]);

  useEffect(() => {
    if (!webRTCRef.current) return;

    webRTCRef.current.on('local_stream', (stream: MediaStream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    webRTCRef.current.on('remote_stream', ({ userId, stream }) => {
      setParticipants(prev => {
        const participantExists = prev.some(p => p.id === userId);
        if (participantExists) {
          return prev.map(p => p.id === userId ? { ...p, stream } : p);
        }
        return [...prev, { id: userId, name: `User ${userId}`, stream }];
      });
    });

    webRTCRef.current.on('peer_disconnected', (userId: string) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
    });
  }, []);

  const handleJoinCall = useCallback(async () => {
    if (!webRTCRef.current || !sessionInfo?.id) return;

    try {
      await webRTCRef.current.joinRoom(sessionInfo.id, {
        audio: isAudioEnabled,
        video: isVideoEnabled
      });
      setIsInCall(true);
    } catch (error) {
      console.error('Error joining call:', error);
    }
  }, [sessionInfo?.id, isAudioEnabled, isVideoEnabled]);

  const handleLeaveCall = useCallback(() => {
    if (!webRTCRef.current) return;

    webRTCRef.current.leaveRoom();
    setIsInCall(false);
    setParticipants([]);
  }, []);

  const toggleAudio = useCallback(() => {
    if (!webRTCRef.current) return;

    const newState = !isAudioEnabled;
    webRTCRef.current.toggleAudio(newState);
    setIsAudioEnabled(newState);
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (!webRTCRef.current) return;

    const newState = !isVideoEnabled;
    webRTCRef.current.toggleVideo(newState);
    setIsVideoEnabled(newState);
  }, [isVideoEnabled]);

  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <Box sx={{ height: '70%', mb: 2 }}>
              <MediaPlayer />
            </Box>
            <Box sx={{ height: '30%' }}>
              <Typography variant="h6" gutterBottom>
                Video Call
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {!isInCall ? (
                  <IconButton
                    color="primary"
                    onClick={handleJoinCall}
                  >
                    <Videocam />
                  </IconButton>
                ) : (
                  <>
                    <IconButton
                      color={isAudioEnabled ? 'primary' : 'error'}
                      onClick={toggleAudio}
                    >
                      {isAudioEnabled ? <Mic /> : <MicOff />}
                    </IconButton>
                    <IconButton
                      color={isVideoEnabled ? 'primary' : 'error'}
                      onClick={toggleVideo}
                    >
                      {isVideoEnabled ? <Videocam /> : <VideocamOff />}
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={handleLeaveCall}
                    >
                      <CallEnd />
                    </IconButton>
                  </>
                )}
              </Box>
              <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                {isInCall && (
                  <Box sx={{ width: 200, position: 'relative' }}>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        borderRadius: 8,
                        backgroundColor: '#000'
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        color: '#fff',
                        textShadow: '0 0 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      You
                    </Typography>
                  </Box>
                )}
                {participants.map(participant => (
                  <Box key={participant.id} sx={{ width: 200, position: 'relative' }}>
                    <video
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        borderRadius: 8,
                        backgroundColor: '#000'
                      }}
                      srcObject={participant.stream}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        color: '#fff',
                        textShadow: '0 0 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      {participant.name}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <Chat
              chatService={chatRef.current}
              sessionId={sessionInfo?.id}
              userId={user?.id}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 