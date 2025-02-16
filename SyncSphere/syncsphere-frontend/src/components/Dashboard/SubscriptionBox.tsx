import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { IoStar } from 'react-icons/io5';

interface SubscriptionBoxProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export const SubscriptionBox: React.FC<SubscriptionBoxProps> = ({ isCollapsed, onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: isCollapsed ? 1.5 : 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer',
        borderRadius: 2,
        background: 'linear-gradient(135deg, rgba(119, 67, 219, 0.1) 0%, rgba(188, 111, 241, 0.1) 100%)',
        border: '1px solid',
        borderColor: 'rgba(119, 67, 219, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: 'linear-gradient(135deg, rgba(119, 67, 219, 0.15) 0%, rgba(188, 111, 241, 0.15) 100%)',
          borderColor: 'rgba(119, 67, 219, 0.3)',
          transform: 'translateY(-2px)',
          '& .glow': {
            opacity: 1,
          },
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      }}
    >
      <Box
        className="glow"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(119, 67, 219, 0.2) 0%, transparent 70%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 0,
            },
            '50%': {
              transform: 'scale(1.2)',
              opacity: 0.3,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 0,
            },
          },
        }}
      />

      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(119, 67, 219, 0.2)',
          color: '#7743DB',
          position: 'relative',
        }}
      >
        <IoStar size={18} />
        <Box
          sx={{
            position: 'absolute',
            inset: -2,
            border: '2px solid rgba(119, 67, 219, 0.3)',
            borderRadius: '50%',
            animation: 'rotate 4s linear infinite',
            '@keyframes rotate': {
              '0%': {
                transform: 'rotate(0deg)',
              },
              '100%': {
                transform: 'rotate(360deg)',
              },
            },
          }}
        />
      </Box>

      {!isCollapsed && (
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: '#7743DB',
              fontSize: '0.875rem',
            }}
          >
            Upgrade Your Plan
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              fontSize: '0.75rem',
            }}
          >
            Unlock premium features
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 