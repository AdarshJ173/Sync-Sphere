import { createTheme } from '@mui/material/styles';

// Color palette definitions
const palettes = {
  palette1: {
    light: '#EEEEEE',
    primary: '#D84040',
    secondary: '#8E1616',
    dark: '#1D1616',
  },
  palette2: {
    dark: '#1A1A1D',
    secondary: '#3B1C32',
    primary: '#6A1E55',
    accent: '#A64D79',
  },
  palette3: {
    dark: '#0C0C0C',
    secondary: '#481E14',
    primary: '#9B3922',
    accent: '#F2613F',
  },
  palette4: {
    dark: '#000000',
    secondary: '#3E065F',
    primary: '#700B97',
    accent: '#8E05C2',
  },
  palette5: {
    dark: '#232931',
    secondary: '#393E46',
    primary: '#4ECCA3',
    light: '#EEEEEE',
  },
  palette6: {
    dark: '#35013F',
    secondary: '#561050',
    primary: '#951556',
    light: '#E9B5D2',
  },
  palette7: {
    dark: '#2E073F',
    secondary: '#7A1CAC',
    primary: '#AD49E1',
    light: '#EBD3F8',
  },
  customDark: {
    primary: '#6E2594',
    light: '#A675A1',
    dark: '#4A1B63',
    background: '#1A1C2A',
    paper: '#25283D',
    black: '#000000',
    success: {
      main: '#10b981',
      dark: '#059669'
    },
    error: {
      main: '#ef4444',
      dark: '#dc2626'
    },
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
      tertiary: '#6b7280'
    },
    service: {
      youtube: '#FF0000',
      netflix: '#E50914',
      disney: '#00A8E1',
      prime: '#113CCF',
      spotify: '#1DB954',
      crunchyroll: '#FA466A'
    },
    overlay: {
      white: {
        light: 'rgba(255, 255, 255, 0.03)',
        medium: 'rgba(255, 255, 255, 0.1)',
        strong: 'rgba(255, 255, 255, 0.95)'
      },
      black: {
        light: 'rgba(0, 0, 0, 0.1)',
        medium: 'rgba(0, 0, 0, 0.5)',
        strong: 'rgba(0, 0, 0, 0.9)'
      },
      purple: {
        light: 'rgba(110, 37, 148, 0.1)',
        medium: 'rgba(110, 37, 148, 0.3)',
        strong: 'rgba(110, 37, 148, 0.6)'
      }
    },
    gradient: {
      purple: 'linear-gradient(45deg, #6E2594, #A675A1)',
      light: 'linear-gradient(45deg, #fff, #A675A1)',
      dark: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f2f 100%)',
      indigoPurple: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    }
  }
};

const commonComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        padding: 8,
        '& .MuiSwitch-track': {
          borderRadius: 22 / 2,
          '&:before, &:after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
          },
        },
        '& .MuiSwitch-thumb': {
          boxShadow: 'none',
          width: 16,
          height: 16,
          margin: 2,
          transition: 'all 0.3s ease',
        },
      },
    },
  },
};

// Light theme configuration
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palettes.palette7.primary, // AD49E1 - Main purple
      light: palettes.palette7.light, // EBD3F8 - Light purple
      dark: palettes.palette7.secondary, // 7A1CAC - Dark purple
    },
    secondary: {
      main: palettes.palette4.primary, // 700B97 - Deep purple
      light: palettes.palette4.accent, // 8E05C2 - Bright purple
      dark: palettes.palette4.secondary, // 3E065F - Dark purple
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8F9FA',
    },
    text: {
      primary: palettes.palette2.dark, // 1A1A1D - Dark text
      secondary: palettes.palette2.secondary, // 3B1C32 - Secondary text
    },
    error: {
      main: palettes.palette3.accent, // F2613F - Orange-red for errors
    },
    warning: {
      main: '#F2A63F', // Custom warning color
    },
    success: {
      main: palettes.palette5.primary, // 4ECCA3 - Teal for success
    },
    divider: 'rgba(0, 0, 0, 0.1)',
  },
  components: {
    ...commonComponents,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(173, 73, 225, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(173, 73, 225, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #7A1CAC, #AD49E1)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(45deg, #892CDC, #BC6FF1)',
          },
        },
        outlined: {
          borderColor: 'rgba(173, 73, 225, 0.5)',
          color: palettes.palette7.primary,
          '&:hover': {
            borderColor: palettes.palette7.primary,
            backgroundColor: 'rgba(173, 73, 225, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: 'rgba(173, 73, 225, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(173, 73, 225, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: palettes.palette7.primary,
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(26, 26, 29, 0.7)',
            '&.Mui-focused': {
              color: palettes.palette7.primary,
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              color: palettes.palette7.primary,
              '& + .MuiSwitch-track': {
                backgroundColor: palettes.palette7.secondary,
                opacity: 0.8,
              },
            },
          },
          '& .MuiSwitch-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(173, 73, 225, 0.05)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: palettes.palette2.dark,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(26, 26, 29, 0.95)',
          color: '#FFFFFF',
          border: '1px solid rgba(173, 73, 225, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(173, 73, 225, 0.1)',
          color: palettes.palette7.primary,
          '&:hover': {
            backgroundColor: 'rgba(173, 73, 225, 0.2)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(173, 73, 225, 0.2)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(173, 73, 225, 0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palettes.palette7.primary,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(173, 73, 225, 0.05)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(173, 73, 225, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(173, 73, 225, 0.2)',
            },
          },
        },
      },
    },
  },
});

// Dark theme configuration
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palettes.customDark.primary,
      light: palettes.customDark.light,
      dark: palettes.customDark.dark,
    },
    secondary: {
      main: palettes.customDark.light,
      light: palettes.customDark.primary,
      dark: palettes.customDark.dark,
    },
    background: {
      default: palettes.customDark.background,
      paper: palettes.customDark.paper,
    },
    text: {
      primary: '#f3f4f6',
      secondary: palettes.customDark.text.secondary,
    },
    error: {
      main: palettes.customDark.error.main,
      dark: palettes.customDark.error.dark,
    },
    success: {
      main: palettes.customDark.success.main,
      dark: palettes.customDark.success.dark,
    },
    divider: palettes.customDark.overlay.white.medium,
  },
  components: {
    ...commonComponents,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palettes.customDark.background,
          color: '#f3f4f6',
          transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: palettes.customDark.paper,
          backdropFilter: 'blur(10px)',
          boxShadow: `0 4px 20px ${palettes.customDark.overlay.black.medium}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: `0 8px 30px ${palettes.customDark.overlay.purple.medium}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 20px ${palettes.customDark.overlay.purple.medium}`,
          },
        },
        contained: {
          background: palettes.customDark.gradient.purple,
          color: '#f3f4f6',
          '&:hover': {
            background: palettes.customDark.gradient.indigoPurple,
          },
        },
        outlined: {
          borderColor: palettes.customDark.overlay.purple.medium,
          color: palettes.customDark.light,
          '&:hover': {
            borderColor: palettes.customDark.light,
            backgroundColor: palettes.customDark.overlay.purple.light,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: `${palettes.customDark.overlay.white.light}`,
            '& fieldset': {
              borderColor: palettes.customDark.overlay.purple.light,
            },
            '&:hover fieldset': {
              borderColor: palettes.customDark.overlay.purple.medium,
            },
            '&.Mui-focused fieldset': {
              borderColor: palettes.customDark.light,
            },
          },
          '& .MuiInputLabel-root': {
            color: palettes.customDark.text.secondary,
            '&.Mui-focused': {
              color: palettes.customDark.light,
            },
          },
          '& .MuiInputBase-input': {
            color: '#f3f4f6',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              color: palettes.customDark.light,
              '& + .MuiSwitch-track': {
                backgroundColor: palettes.customDark.primary,
                opacity: 0.8,
              },
            },
          },
          '& .MuiSwitch-track': {
            backgroundColor: palettes.customDark.overlay.white.medium,
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: palettes.customDark.overlay.purple.light,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${palettes.customDark.paper}CC`,
          backdropFilter: 'blur(10px)',
          color: '#f3f4f6',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: `${palettes.customDark.paper}F2`,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: palettes.customDark.paper,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: `${palettes.customDark.paper}E6`,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: `${palettes.customDark.paper}F2`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${palettes.customDark.overlay.purple.light}`,
          color: '#f3f4f6',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: palettes.customDark.overlay.purple.light,
          color: palettes.customDark.light,
          '&:hover': {
            backgroundColor: palettes.customDark.overlay.purple.medium,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: palettes.customDark.overlay.white.light,
          color: '#f3f4f6',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: palettes.customDark.overlay.purple.light,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palettes.customDark.overlay.purple.medium,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palettes.customDark.light,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: palettes.customDark.overlay.purple.light,
          },
          '&.Mui-selected': {
            backgroundColor: palettes.customDark.overlay.purple.medium,
            '&:hover': {
              backgroundColor: palettes.customDark.overlay.purple.strong,
            },
          },
        },
      },
    },
  },
});

export type ThemeMode = 'light' | 'dark'; 