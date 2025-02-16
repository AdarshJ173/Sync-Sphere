import { createTheme, ThemeOptions } from '@mui/material';

const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    background: {
      default: '#F5EFFF',
      paper: '#FFFBF5',
    },
    primary: {
      main: '#7743DB',
      light: '#CDC1FF',
      dark: '#A294F9',
    },
    secondary: {
      main: '#C3ACD0',
      light: '#F7EFE5',
      dark: '#7743DB',
    },
    text: {
      primary: '#2A2A2A',
      secondary: '#4A4A4A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: 0.5,
    },
    body1: {
      letterSpacing: 0.15,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(120deg, transparent, rgba(119, 67, 219, 0.1), transparent)',
            transform: 'translateX(-100%)',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(119, 67, 219, 0.15)',
            '&::after': {
              transform: 'translateX(100%)',
              transition: 'transform 0.6s ease-in-out',
            },
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(119, 67, 219, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: -100,
            width: 50,
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(119, 67, 219, 0.05), transparent)',
            transform: 'skewX(-15deg)',
            transition: 'transform 0.6s ease',
          },
          '&:hover::before': {
            transform: 'translateX(500%) skewX(-15deg)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px) scale(1.01)',
            },
            '& fieldset': {
              borderColor: '#E5D9F2',
            },
            '&:hover fieldset': {
              borderColor: '#CDC1FF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7743DB',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1) rotate(5deg)',
            backgroundColor: 'rgba(119, 67, 219, 0.08)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#7743DB',
            '&:hover': {
              backgroundColor: 'rgba(119, 67, 219, 0.08)',
            },
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#CDC1FF',
          },
        },
      },
    },
  },
};

const darkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#1A1B26',
      paper: '#1F2937',
    },
    primary: {
      main: '#7743DB',
      light: '#CDC1FF',
      dark: '#A294F9',
    },
    secondary: {
      main: '#C3ACD0',
      light: '#F7EFE5',
      dark: '#7743DB',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
    },
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'rgba(31, 41, 55, 0.7)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(119, 67, 219, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(31, 41, 55, 0.7)',
          backdropFilter: 'blur(10px)',
          ...lightTheme.components?.MuiCard?.styleOverrides?.root,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            ...lightTheme.components?.MuiTextField?.styleOverrides?.root?.['& .MuiOutlinedInput-root'],
            '& fieldset': {
              borderColor: 'rgba(209, 213, 219, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(205, 193, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7743DB',
            },
          },
        },
      },
    },
  },
};

export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme(mode === 'light' ? lightTheme : darkTheme);
};

export default getTheme('light'); 