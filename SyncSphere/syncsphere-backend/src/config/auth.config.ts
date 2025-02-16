import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: `${process.env.BACKEND_URL}/auth/facebook/callback`,
  },
  apple: {
    clientID: process.env.APPLE_CLIENT_ID || '',
    teamID: process.env.APPLE_TEAM_ID || '',
    keyID: process.env.APPLE_KEY_ID || '',
    callbackURL: `${process.env.BACKEND_URL}/auth/apple/callback`,
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d',
  },
}; 