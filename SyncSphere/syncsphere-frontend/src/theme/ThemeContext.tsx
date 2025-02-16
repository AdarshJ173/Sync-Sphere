import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme, ThemeMode } from './theme';
import { GlobalStyles } from '@mui/material';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const cssVariables = {
  light: {
    '--background-default': '#FFFFFF',
    '--background-paper': '#F8F9FA',
    '--text-primary': 'rgba(42, 42, 42, 0.9)',
    '--text-secondary': 'rgba(42, 42, 42, 0.7)',
    '--primary-main': '#AD49E1',
    '--primary-light': '#EBD3F8',
    '--primary-dark': '#7A1CAC',
    '--primary-shadow': 'rgba(255, 255, 255, 0.9)',
    '--primary-transparent': 'rgba(173, 73, 225, 0.1)',
    '--primary-transparent-dark': 'rgba(173, 73, 225, 0.2)',
    '--primary-transparent-light': 'rgba(173, 73, 225, 0.05)',
    '--divider-color': 'rgba(173, 73, 225, 0.1)',
    '--background-chat': 'rgba(255, 255, 255, 0.9)',
    '--background-sidebar': 'rgba(255, 255, 255, 0.95)',
    '--gradient-purple': 'linear-gradient(45deg, #AD49E1, #EBD3F8)',
    '--gradient-light': 'linear-gradient(45deg, #fff, #EBD3F8)',
    '--gradient-dark': 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
    '--gradient-indigo-purple': 'linear-gradient(135deg, #AD49E1, #7A1CAC)',
  },
  dark: {
    '--background-default': '#1A1C2A',
    '--background-paper': '#25283D',
    '--text-primary': '#f3f4f6',
    '--text-secondary': '#6b7280',
    '--primary-main': '#6E2594',
    '--primary-light': '#A675A1',
    '--primary-dark': '#4A1B63',
    '--primary-shadow': 'rgba(0, 0, 0, 0.9)',
    '--primary-transparent': 'rgba(110, 37, 148, 0.1)',
    '--primary-transparent-dark': 'rgba(110, 37, 148, 0.3)',
    '--primary-transparent-light': 'rgba(110, 37, 148, 0.05)',
    '--divider-color': 'rgba(255, 255, 255, 0.1)',
    '--background-chat': 'rgba(37, 40, 61, 0.3)',
    '--background-sidebar': 'rgba(37, 40, 61, 0.8)',
    '--gradient-purple': 'linear-gradient(45deg, #6E2594, #A675A1)',
    '--gradient-light': 'linear-gradient(45deg, #fff, #A675A1)',
    '--gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2d1f2f 100%)',
    '--gradient-indigo-purple': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as ThemeMode;
      return savedTheme && (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
    } catch (error) {
      console.warn('Failed to get theme from localStorage:', error);
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', themeMode);
      document.body.style.backgroundColor = themeMode === 'light' ? '#ffffff' : '#1A1C2A';
      document.documentElement.setAttribute('data-theme', themeMode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <GlobalStyles
          styles={{
            ':root': {
              ...cssVariables[themeMode],
              transition: 'all 0.3s ease-in-out',
            },
            'body': {
              transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
              backgroundColor: themeMode === 'light' ? '#ffffff' : '#1A1C2A',
              color: themeMode === 'light' ? '#2A2A2A' : '#f3f4f6',
            },
            '*': {
              transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, color 0.3s ease-in-out',
            }
          }}
        />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 