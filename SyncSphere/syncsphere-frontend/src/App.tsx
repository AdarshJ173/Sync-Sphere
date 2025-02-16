import { CssBaseline, GlobalStyles } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AuthPage } from './pages/auth/AuthPage';
import { SessionRoom } from './pages/session/SessionRoom';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ProfileProvider, useProfile } from './contexts/ProfileContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './theme/ThemeContext';
import { FriendProvider } from './contexts/FriendContext';
import { ChatProvider } from './contexts/ChatContext';
import AuthCallback from './components/Auth/AuthCallback';
import { PasswordResetPage } from './pages/auth/PasswordResetPage';

const globalStyles = {
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  'html, body': {
    scrollBehavior: 'smooth',
  },
  '::-webkit-scrollbar': {
    width: '8px',
  },
  '::-webkit-scrollbar-track': {
    background: 'rgba(119, 67, 219, 0.05)',
    borderRadius: '4px',
  },
  '::-webkit-scrollbar-thumb': {
    background: 'rgba(119, 67, 219, 0.2)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(119, 67, 219, 0.3)',
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(-20px)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    },
  },
  '.page-transition': {
    animation: 'fadeIn 0.5s ease-out',
  },
  '.slide-transition': {
    animation: 'slideIn 0.3s ease-out',
  },
};

const AppContent = () => {
  const { settings } = useProfile();
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (loading) {
    return null;
  }

  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <Routes>
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/dashboard/*" element={user ? <Dashboard /> : <Navigate to="/auth" />}>
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/session/:id" element={user ? <SessionRoom /> : <Navigate to="/auth" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <SocketProvider>
              <ChatProvider>
                <FriendProvider>
                  <AppContent />
                </FriendProvider>
              </ChatProvider>
            </SocketProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
