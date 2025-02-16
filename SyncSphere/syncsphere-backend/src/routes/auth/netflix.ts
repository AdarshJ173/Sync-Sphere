import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Netflix OAuth configuration
const NETFLIX_CLIENT_ID = process.env.NETFLIX_CLIENT_ID;
const NETFLIX_CLIENT_SECRET = process.env.NETFLIX_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.FRONTEND_URL}/auth/netflix/callback`;

// Store state for CSRF protection
const stateStore = new Map<string, { timestamp: number }>();

// Netflix login endpoint
router.get('/login', (req, res) => {
  const state = uuidv4();
  stateStore.set(state, { timestamp: Date.now() });

  const authUrl = `https://www.netflix.com/oauth/login?client_id=${NETFLIX_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${state}`;
  res.json({ authUrl });
});

// Netflix callback endpoint
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  // Verify state to prevent CSRF
  if (!state || !stateStore.has(state as string)) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.netflix.com/oauth/token', {
      grant_type: 'authorization_code',
      code,
      client_id: NETFLIX_CLIENT_ID,
      client_secret: NETFLIX_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // Clean up state
    stateStore.delete(state as string);

    // Send success message to parent window
    res.send(`
      <script>
        window.opener.postMessage({ 
          type: 'auth_callback',
          success: true,
          token: '${access_token}',
          refreshToken: '${refresh_token}'
        }, '${process.env.FRONTEND_URL}');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('Netflix auth error:', error);
    res.send(`
      <script>
        window.opener.postMessage({ 
          type: 'auth_callback',
          success: false,
          error: 'Authentication failed'
        }, '${process.env.FRONTEND_URL}');
        window.close();
      </script>
    `);
  }
});

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const response = await axios.post('https://api.netflix.com/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token,
      client_id: NETFLIX_CLIENT_ID,
      client_secret: NETFLIX_CLIENT_SECRET,
    });

    res.json({
      token: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
});

export default router; 