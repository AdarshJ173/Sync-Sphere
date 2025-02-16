import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  zegoToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshZegoToken: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const userData = await AuthService.checkSession();
      if (userData) {
        setUser(userData);
        await refreshZegoToken();
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await AuthService.login(email, password);
      setUser(userData);
      await refreshZegoToken();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      await AuthService.requestPasswordReset(email);
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await AuthService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshZegoToken = async () => {
    if (!user) return;

    try {
      const token = await AuthService.refreshZegoToken(user.id);
      setUser(prev => prev ? { ...prev, zegoToken: token } : null);
    } catch (error) {
      console.error('Failed to refresh Zego token:', error);
      throw error;
    }
  };

  // Set up token refresh interval
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(refreshZegoToken, 1000 * 60 * 60); // Refresh every hour
    return () => clearInterval(refreshInterval);
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshZegoToken,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 