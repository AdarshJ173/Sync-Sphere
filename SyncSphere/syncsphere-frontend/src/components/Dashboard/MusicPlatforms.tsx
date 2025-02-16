import { useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  IconButton, 
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Chip,
  Fade,
} from '@mui/material';
import { 
  IoMusicalNotes, 
  IoHeart, 
  IoHeartOutline,
  IoTrendingUp,
  IoStar,
} from 'react-icons/io5';
import { 
  SiSpotify, 
  SiYoutubemusic, 
  SiApplemusic, 
  SiPandora, 
  SiTidal, 
  SiDeezer, 
  SiSoundcloud,
  SiJiosaavn,
} from 'react-icons/si';

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  url: string;
  trending?: boolean;
  new?: boolean;
}

const platforms: Platform[] = [
  { 
    id: 'spotify', 
    name: 'Spotify', 
    icon: SiSpotify, 
    color: '#1DB954',
    url: 'https://spotify.com',
    trending: true,
  },
  { 
    id: 'youtube-music', 
    name: 'YouTube Music', 
    icon: SiYoutubemusic, 
    color: '#FF0000',
    url: 'https://music.youtube.com',
    trending: true,
  },
  { 
    id: 'apple-music', 
    name: 'Apple Music', 
    icon: SiApplemusic, 
    color: '#FA243C',
    url: 'https://music.apple.com',
  },
  { 
    id: 'pandora', 
    name: 'Pandora', 
    icon: SiPandora, 
    color: '#3668FF',
    url: 'https://pandora.com',
  },
  { 
    id: 'tidal', 
    name: 'Tidal', 
    icon: SiTidal, 
    color: '#000000',
    url: 'https://tidal.com',
    new: true,
  },
  { 
    id: 'deezer', 
    name: 'Deezer', 
    icon: SiDeezer, 
    color: '#FF0092',
    url: 'https://deezer.com',
  },
  { 
    id: 'soundcloud', 
    name: 'SoundCloud', 
    icon: SiSoundcloud, 
    color: '#FF5500',
    url: 'https://soundcloud.com',
  },
  { 
    id: 'jiosaavn', 
    name: 'JioSaavn', 
    icon: SiJiosaavn, 
    color: '#2BC5B4',
    url: 'https://jiosaavn.com',
  },
];

interface MusicPlatformsProps {
  viewMode: 'grid' | 'list';
}

export const MusicPlatforms = ({ viewMode }: MusicPlatformsProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  if (viewMode === 'list') {
    return (
      <List sx={{ 
        width: '100%',
        height: '100%',
        overflow: 'auto',
      }}>
        {platforms.map((platform, index) => (
          <Fade in key={platform.id} timeout={300 + index * 100}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component="a"
                href={platform.url}
                target="_blank"
                sx={{
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' }
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: `${platform.color}15`, color: platform.color }}>
                    <platform.icon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={platform.name} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {platform.trending && <Chip icon={<IoTrendingUp />} label="Trending" size="small" />}
                  {platform.new && <Chip icon={<IoStar />} label="New" size="small" />}
                  <IconButton onClick={() => toggleFavorite(platform.id)}>
                    {favorites.includes(platform.id) ? <IoHeart /> : <IoHeartOutline />}
                  </IconButton>
                </Box>
              </ListItemButton>
            </ListItem>
          </Fade>
        ))}
      </List>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      overflow: 'auto',
    }}>
      <Grid container spacing={2}>
        {platforms.map((platform, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={platform.id}>
            <Fade in timeout={300 + index * 100}>
              <Paper
                component="a"
                href={platform.url}
                target="_blank"
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateY(-8px)'
                  }
                }}
              >
                <Avatar sx={{ width: 80, height: 80, bgcolor: `${platform.color}15`, color: platform.color }}>
                  <platform.icon />
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white' }}>{platform.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {platform.trending && <Chip icon={<IoTrendingUp />} label="Trending" size="small" />}
                  {platform.new && <Chip icon={<IoStar />} label="New" size="small" />}
                  <Tooltip title="Listen Now">
                    <IconButton><IoMusicalNotes /></IconButton>
                  </Tooltip>
                  <IconButton onClick={() => toggleFavorite(platform.id)}>
                    {favorites.includes(platform.id) ? <IoHeart /> : <IoHeartOutline />}
                  </IconButton>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export { MusicPlatforms }; 