import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { IoEyeOutline, IoEyeOffOutline, IoLogoGoogle, IoLogoGithub } from 'react-icons/io5';

interface AuthData {
  email: string;
  password: string;
  name?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthData>({
    email: '',
    password: '',
    name: '',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      const expiryTime = localStorage.getItem('sessionExpiry');

      if (token && user && expiryTime) {
        // Check if the session is still valid
        if (Number(expiryTime) > Date.now()) {
          // Session is valid, update expiry and authenticate
          updateSessionExpiry();
          setIsAuthenticated(true);
          // Here you would typically redirect to the main app
          window.location.href = '/dashboard';
        } else {
          // Session expired, clear everything
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const updateSessionExpiry = () => {
    const newExpiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem('sessionExpiry', newExpiryTime.toString());
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = (user: User) => {
    const token = 'mock-jwt-token';
    const expiryTime = Date.now() + SESSION_DURATION;

    // Save all auth data
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('sessionExpiry', expiryTime.toString());
    
    setIsAuthenticated(true);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isLogin) {
        // Mock login success
        const mockUser = {
          id: '1',
          email: formData.email,
          name: 'John Doe',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
        };
        handleLoginSuccess(mockUser);
      } else {
        // Mock registration success
        const mockUser = {
          id: '1',
          email: formData.email,
          name: formData.name || 'New User',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
        };
        handleLoginSuccess(mockUser);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);

    try {
      // Simulate social login
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        id: '1',
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
      };
      
      handleLoginSuccess(mockUser);
    } catch (err) {
      setError(`${provider} login failed. Please try again.`);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #25283D 0%, #8F3985 100%)',
        }}
      >
        <CircularProgress size={48} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #25283D 0%, #8F3985 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '5%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: '#6E2594',
          filter: 'blur(180px)',
          opacity: 0.5,
          borderRadius: '50%',
          animation: 'pulse 15s infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '5%',
          right: '10%',
          width: '350px',
          height: '350px',
          background: '#A675A1',
          filter: 'blur(180px)',
          opacity: 0.4,
          borderRadius: '50%',
          animation: 'pulse 15s infinite reverse',
        },
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: 4,
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                mb: 1,
              }}
              src={formData.email ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}` : undefined}
            />
            <Typography
              component="h1"
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              {!isLogin && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="name"
                  label="Full Name"
                  type="text"
                  id="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(110, 37, 148, 0.3)',
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </Button>

              <Box sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Or continue with
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<IoLogoGoogle />}
                  onClick={() => handleSocialLogin('google')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  disabled={loading}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<IoLogoGithub />}
                  onClick={() => handleSocialLogin('github')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  disabled={loading}
                >
                  GitHub
                </Button>
              </Box>

              <Button
                fullWidth
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { color: 'white' },
                }}
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 