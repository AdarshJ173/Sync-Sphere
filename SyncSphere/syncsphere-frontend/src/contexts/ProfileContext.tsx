import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Profile {
  displayName: string;
  username: string;
  avatar: string;
  isProfileSetup: boolean;
  bio?: string;
  location?: string;
  website?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: Date;
  email?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

interface Settings {
  theme: 'light' | 'dark';
  language: string;
  region: string;
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  weekStart: 'sunday' | 'monday';
  notifications: {
    enabled: boolean;
    showBadges: boolean;
    sound: boolean;
    sessionInvites: boolean;
    sessionUpdates: boolean;
    sessionReminders: boolean;
    friendRequests: boolean;
    messages: boolean;
    mentions: boolean;
    emailUpdates: boolean;
    marketingEmails: boolean;
  };
  appearance: {
    themeColor: string;
    showOfflineUsers: boolean;
    autoplayMedia: boolean;
    compactMode: boolean;
    animations: boolean;
    videoQuality: 'auto' | '1080p' | '720p' | '480p' | '360p';
    gifAutoplay: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    onlineStatus: boolean;
    lastSeen: boolean;
  };
}

interface ProfileContextType {
  profile: Profile | null;
  settings: Settings;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  theme: 'dark',
  language: 'en',
  region: 'auto',
  timeFormat: '12h',
  dateFormat: 'MM/DD/YYYY',
  weekStart: 'sunday',
  notifications: {
    enabled: true,
    showBadges: true,
    sound: true,
    sessionInvites: true,
    sessionUpdates: true,
    sessionReminders: true,
    friendRequests: true,
    messages: true,
    mentions: true,
    emailUpdates: true,
    marketingEmails: false,
  },
  appearance: {
    themeColor: 'purple',
    showOfflineUsers: true,
    autoplayMedia: true,
    compactMode: false,
    animations: true,
    videoQuality: 'auto',
    gifAutoplay: true,
  },
  privacy: {
    profileVisibility: 'public',
    onlineStatus: true,
    lastSeen: true,
  },
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load profile and settings from localStorage on mount
    const savedProfile = localStorage.getItem('userProfile');
    const savedSettings = localStorage.getItem('userSettings');

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      // Only set the profile if it's properly set up
      if (parsedProfile.isProfileSetup) {
        setProfile(parsedProfile);
      } else {
        // If profile exists but not set up, keep it null to trigger setup
        setProfile(null);
      }
    }
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
    setIsLoading(false);
  }, []);

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile(prev => {
      const updated = prev ? { ...prev, ...updates } : { ...updates } as Profile;
      localStorage.setItem('userProfile', JSON.stringify(updated));
      return updated;
    });
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('userSettings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ProfileContext.Provider 
      value={{ 
        profile, 
        settings, 
        setProfile, 
        updateProfile, 
        updateSettings, 
        isLoading 
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}; 