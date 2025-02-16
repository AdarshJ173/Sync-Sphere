import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 7000);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 70);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <Box className="splash-screen">
      <div className="animated-background">
        <div className="gradient-overlay"></div>
        <div className="wave-container">
          {[...Array(3)].map((_, i) => (
            <div key={`wave-${i}`} className={`wave wave-${i}`}></div>
          ))}
        </div>
        
        <div className="particle-system">
          {[...Array(20)].map((_, i) => (
            <div 
              key={`energy-${i}`} 
              className="energy-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {[...Array(50)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className="music-visualizer">
        {[...Array(20)].map((_, i) => (
          <div key={`bar-${i}`} className="visualizer-bar"></div>
        ))}
      </div>

      <div className="floating-elements">
        {[...Array(5)].map((_, i) => (
          <div key={`note-${i}`} className={`music-note note-${i}`}>♪</div>
        ))}
        {[...Array(3)].map((_, i) => (
          <div key={`icon-${i}`} className={`floating-icon icon-${i}`}>
            <div className="icon-pulse"></div>
          </div>
        ))}
      </div>

      <Box className="logo-container">
        <div className="logo-rings">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`ring ring-${i}`}></div>
          ))}
        </div>
        
        <div className="logo-circle">
          <div className="syncsphere-image-container">
            <img src="/SyncSphere.png" alt="SyncSphere" className="syncsphere-image" />
            <div className="image-overlay"></div>
          </div>
          <div className="inner-circle"></div>
          <div className="pulse-ring"></div>
        </div>

        <div className="orbits-container">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`logo-orbit orbit-${i}`}>
              <div className="orbit-particle"></div>
            </div>
          ))}
        </div>

        <Typography
          variant="h1"
          className="logo-text"
          sx={{
            fontWeight: 700,
            fontSize: '3.5rem',
            background: 'linear-gradient(45deg, #52057B, #892CDC, #BC6FF1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(188, 111, 241, 0.3)',
          }}
        >
          SyncSphere
        </Typography>

        <Typography
          variant="h6"
          className="tagline-text"
          sx={{
            fontWeight: 300,
            color: '#BC6FF1',
            opacity: 0.8,
            letterSpacing: '0.2em',
            marginTop: '1rem',
          }}
        >
          CONNECT • COLLABORATE • CREATE
        </Typography>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </Box>

      <div className="corner-decorations">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`corner corner-${i}`}></div>
        ))}
      </div>

      <div className="connection-lines">
        {[...Array(6)].map((_, i) => (
          <div key={`line-${i}`} className={`connection-line line-${i}`}>
            <div className="line-pulse"></div>
          </div>
        ))}
      </div>
    </Box>
  );
}; 