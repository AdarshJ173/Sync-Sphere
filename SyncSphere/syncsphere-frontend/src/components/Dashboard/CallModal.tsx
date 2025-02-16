import React, { useEffect, useRef } from 'react';
import { Box, Modal } from '@mui/material';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface CallModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  isVideoEnabled: boolean;
}

export const CallModal: React.FC<CallModalProps> = ({
  open,
  onClose,
  roomId,
  isVideoEnabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !roomId || !containerRef.current) return;

    const initCall = async () => {
      const appID = parseInt(process.env.REACT_APP_ZEGO_APP_ID || '0');
      const serverSecret = process.env.REACT_APP_ZEGO_SERVER_SECRET || '';
      const userId = `user-${Date.now()}`;
      const userName = 'User';

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userId,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // Configure the call settings
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: isVideoEnabled ? ZegoUIKitPrebuilt.VideoConference : ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: true,
        showLeavingView: true,
        showUserList: true,
        showPreviewOptions: true,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: isVideoEnabled,
        showMyCameraToggleButton: isVideoEnabled,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        onLeaveRoom: () => {
          onClose();
        },
        layout: {
          mode: ZegoUIKitPrebuilt.LayoutMode.Auto,
          config: {
            maxUsers: 4,
            showScreenSharingViewInMainWindow: true,
          },
        },
      });
    };

    initCall().catch(console.error);
  }, [open, roomId, isVideoEnabled, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="call-modal"
      aria-describedby="video-or-audio-call-interface"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          bgcolor: 'background.paper',
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          '& .zego-uikit': {
            width: '100%',
            height: '100%',
          },
          '& .zego-uikit-prebuilt': {
            width: '100%',
            height: '100%',
          },
          '& video': {
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
          },
          '& .prebuilt-host-video': {
            width: '100%',
            height: '100%',
          },
          '& .prebuilt-video-player': {
            width: '100%',
            height: '100%',
          },
        }}
      />
    </Modal>
  );
}; 