export const ZEGO_CONFIG = {
  appID: Number(import.meta.env.VITE_ZEGO_APP_ID) || 0,
  serverSecret: import.meta.env.VITE_ZEGO_SERVER_SECRET || '',
  // Token expiration time in seconds (default: 3600 seconds / 1 hour)
  tokenExpirationTime: 3600,
  // Default room settings
  roomConfig: {
    maxUsers: 100,
    maxMessageHistory: 100,
  },
  // Message configuration
  messageConfig: {
    maxTextLength: 2000,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'audio/webm'],
  },
};

export default ZEGO_CONFIG; 