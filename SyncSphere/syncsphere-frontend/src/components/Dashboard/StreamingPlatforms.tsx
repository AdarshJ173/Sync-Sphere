import { useState } from 'react';
import { Box, Tab, Tabs, IconButton, Typography, Tooltip, Zoom } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import NetflixIcon from '@mui/icons-material/Tv';
import PrimeVideoIcon from '@mui/icons-material/LocalMovies';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SpotifyIcon from '@mui/icons-material/LibraryMusic';
import AppleMusicIcon from '@mui/icons-material/MusicNote';
import JioSaavnIcon from '@mui/icons-material/QueueMusic';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface PlatformButtonProps {
  icon: React.ReactNode;
  name: string;
  color: string;
  onClick: () => void;
}

const PlatformButton = ({ icon, name, color, onClick }: PlatformButtonProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Tooltip title={name} TransitionComponent={Zoom}>
      <IconButton
        onClick={onClick}
        sx={{
          width: 80,
          height: 80,
          backgroundColor: `${color}20`,
          borderRadius: 2,
          m: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: `${color}40`,
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ color: color }}>{icon}</Box>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {name}
        </Typography>
      </IconButton>
    </Tooltip>
  </motion.div>
);

export const StreamingPlatforms = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const videoServices = [
    { name: 'Netflix', icon: <NetflixIcon />, color: '#E50914' },
    { name: 'Prime', icon: <PrimeVideoIcon />, color: '#00A8E1' },
    { name: 'YouTube', icon: <YouTubeIcon />, color: '#FF0000' },
  ];

  const musicServices = [
    { name: 'Spotify', icon: <SpotifyIcon />, color: '#1DB954' },
    { name: 'Apple Music', icon: <AppleMusicIcon />, color: '#FA466A' },
    { name: 'JioSaavn', icon: <JioSaavnIcon />, color: '#2BC5B4' },
  ];

  return (
    <Box sx={{
      height: '100%',
      backgroundColor: 'rgba(37, 40, 61, 0.3)',
      borderRadius: 3,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
    }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
          },
        }}
      >
        <Tab label="Video Streaming" />
        <Tab label="Music Streaming" />
      </Tabs>

      <AnimatePresence mode="wait">
        <TabPanel value={tabValue} index={0}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {videoServices.map((service) => (
                <PlatformButton
                  key={service.name}
                  {...service}
                  onClick={() => console.log(`Opening ${service.name}`)}
                />
              ))}
            </Box>
          </motion.div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {musicServices.map((service) => (
                <PlatformButton
                  key={service.name}
                  {...service}
                  onClick={() => console.log(`Opening ${service.name}`)}
                />
              ))}
            </Box>
          </motion.div>
        </TabPanel>
      </AnimatePresence>
    </Box>
  );
}; 