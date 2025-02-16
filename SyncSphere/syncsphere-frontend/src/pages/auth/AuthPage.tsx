import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Stack, 
  IconButton, 
  InputAdornment, 
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress,
  Grid
} from '@mui/material';
import { IoEyeOutline, IoEyeOffOutline, IoLogoGoogle, IoMusicalNotesOutline, IoPlayOutline, IoPauseOutline } from 'react-icons/io5';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../../services/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' }
    },
    exit: { opacity: 0 }
  };

  const formVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { email, password } = formData;
      const result = isLogin
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);

      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Google Sign In Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AnimatePresence>
      <Box
        component={motion.div}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        sx={{
          minHeight: '100vh',
          width: '100vw',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #7743DB 0%, #CDC1FF 100%)',
        }}
      >
        {/* Enhanced Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          {/* Dynamic Music Bars */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '5%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              height: '30%',
              display: 'flex',
              justifyContent: 'center',
              gap: '4px',
              opacity: 0.15,
            }}
          >
            {[...Array(32)].map((_, i) => (
              <Box
                key={`bar-${i}`}
                sx={{
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #6E2594 0%, #A675A1 100%)',
                  animation: `musicBar ${2 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                  '@keyframes musicBar': {
                    '0%, 100%': {
                      height: `${20 + Math.random() * 30}%`,
                    },
                    '50%': {
                      height: `${50 + Math.random() * 50}%`,
                    },
                  },
                }}
              />
            ))}
          </Box>

          {/* Floating Music Notes */}
          {[...Array(12)].map((_, i) => (
            <Box
              key={`note-${i}`}
              sx={{
                position: 'absolute',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                color: 'rgba(255,255,255,0.1)',
                animation: `floatNote ${15 + Math.random() * 10}s linear infinite`,
                animationDelay: `${-Math.random() * 15}s`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 0.5})`,
                '@keyframes floatNote': {
                  '0%': {
                    transform: `translate(0, 0) rotate(${Math.random() * 360}deg)`,
                    opacity: 0,
                  },
                  '50%': {
                    opacity: 0.2,
                  },
                  '100%': {
                    transform: `translate(${-50 + Math.random() * 100}px, ${-200 - Math.random() * 200}px) rotate(${Math.random() * 360}deg)`,
                    opacity: 0,
                  },
                },
              }}
            >
              <IoMusicalNotesOutline size={24} />
            </Box>
          ))}

          {/* Gradient Orbs with Enhanced Colors */}
          {[...Array(4)].map((_, i) => (
            <Box
              key={`orb-${i}`}
              sx={{
                position: 'absolute',
                width: ['300px', '400px', '500px', '600px'][i],
                height: ['300px', '400px', '500px', '600px'][i],
                background: [
                  'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0) 70%)',
                  'radial-gradient(circle, rgba(110,37,148,0.15) 0%, rgba(110,37,148,0) 70%)',
                  'radial-gradient(circle, rgba(167,139,250,0.1) 0%, rgba(167,139,250,0) 70%)',
                  'radial-gradient(circle, rgba(91,33,182,0.1) 0%, rgba(91,33,182,0) 70%)',
                ][i],
                top: ['10%', '40%', '60%', '80%'][i],
                left: ['20%', '70%', '30%', '60%'][i],
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                animation: `float ${10 + i * 4}s ease-in-out infinite`,
                filter: 'blur(80px)',
                opacity: 0.5,
                '@keyframes float': {
                  '0%, 100%': {
                    transform: 'translate(-50%, -50%) scale(1)',
                  },
                  '50%': {
                    transform: 'translate(-50%, -50%) scale(1.1) translate(40px, -40px)',
                  },
                },
              }}
            />
          ))}

          {/* Animated Grid Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              animation: 'moveGrid 20s linear infinite',
              opacity: 0.2,
              '@keyframes moveGrid': {
                '0%': {
                  transform: 'translate(0, 0)',
                },
                '100%': {
                  transform: 'translate(40px, 40px)',
                },
              },
            }}
          />

          {/* Animated Lines with Enhanced Colors */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={`line-${i}`}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)',
                animation: `moveLine ${20 + i * 5}s linear infinite`,
                top: `${15 + i * 15}%`,
                opacity: 0.3,
                '@keyframes moveLine': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' },
                },
              }}
            />
          ))}

          {/* Radial Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, transparent 0%, rgba(15,23,42,0.4) 100%)',
              pointerEvents: 'none',
            }}
          />
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            {/* Left Section - Branding */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ p: 4 }}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Stack spacing={4} alignItems="flex-start">
                    <Box
                      sx={{
                        position: 'relative',
                        width: 120,
                        height: 120,
                      }}
                    >
                      <Box
                        component={motion.div}
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: '2px solid transparent',
                          borderTopColor: 'rgba(255,255,255,0.2)',
                          borderRightColor: 'rgba(255,255,255,0.2)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <IoMusicalNotesOutline size={60} color="white" />
                      </Box>
                    </Box>

                    <Typography
                      variant="h2"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        letterSpacing: -1,
                        background: 'linear-gradient(45deg, #FFFBF5, #7743DB)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      SyncSphere
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        maxWidth: 400,
                        lineHeight: 1.6,
                      }}
                    >
                      Experience music in perfect harmony with friends and family
                    </Typography>

                    {/* Animated Feature List */}
                    <Stack spacing={3} sx={{ mt: 4 }}>
                      {[
                        'Real-time music synchronization',
                        'Collaborative playlists',
                        'Cross-platform support',
                      ].map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.2 }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.1)',
                              }}
                            >
                              <IoPlayOutline color="white" size={18} />
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{ color: 'rgba(255,255,255,0.9)' }}
                            >
                              {feature}
                            </Typography>
                          </Stack>
                        </motion.div>
                      ))}
                    </Stack>
                  </Stack>
                </motion.div>
              </Box>
            </Grid>

            {/* Right Section - Auth Form */}
            <Grid item xs={12} md={6}>
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    background: 'linear-gradient(45deg, #FFFBF5, #7743DB)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                  }}
                >
                  <Stack spacing={4}>
                    {/* Form Header */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h4"
                        sx={{
                          color: 'white',
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                        }}
                      >
                        {isLogin
                          ? 'Sign in to continue your musical journey'
                          : 'Join the community and start sharing music'}
                      </Typography>
                    </Box>

                    {/* Error Alert */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Alert
                            severity="error"
                            sx={{
                              bgcolor: 'rgba(211,47,47,0.1)',
                              color: '#ff8a80',
                              '& .MuiAlert-icon': { color: '#ff8a80' },
                            }}
                          >
                            {error}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Auth Form */}
                    <form onSubmit={handleSubmit}>
                      <Stack spacing={3}>
                        <TextField
                          required
                          fullWidth
                          id="email"
                          label="Email Address"
                          name="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={loading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(255,255,255,0.03)',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.05)',
                              },
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.1)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#7743DB',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiOutlinedInput-input': {
                              color: 'white',
                            },
                          }}
                        />

                        <TextField
                          required
                          fullWidth
                          name="password"
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          autoComplete={isLogin ? 'current-password' : 'new-password'}
                          value={formData.password}
                          onChange={handleChange}
                          disabled={loading}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                                >
                                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(255,255,255,0.03)',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.05)',
                              },
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.1)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#7743DB',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiOutlinedInput-input': {
                              color: 'white',
                            },
                          }}
                        />

                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          type="submit"
                          disabled={loading}
                          sx={{ mt: 3, mb: 2 }}
                        >
                          {loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : isLogin ? (
                            'Sign In'
                          ) : (
                            'Sign Up'
                          )}
                        </Button>

                        {isLogin && (
                          <Button
                            fullWidth
                            color="primary"
                            onClick={() => navigate('/reset-password')}
                            disabled={loading}
                            sx={{ mb: 2 }}
                          >
                            Forgot Password?
                          </Button>
                        )}

                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          sx={{ my: 2 }}
                        >
                          <Divider sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            OR
                          </Typography>
                          <Divider sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                        </Stack>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<IoLogoGoogle />}
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          sx={{
                            borderColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': {
                              borderColor: 'rgba(255,255,255,0.3)',
                              bgcolor: 'rgba(255,255,255,0.05)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Continue with Google
                        </Button>

                        <Button
                          fullWidth
                          color="primary"
                          onClick={() => setIsLogin(!isLogin)}
                          disabled={loading}
                        >
                          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </AnimatePresence>
  );
};

export { AuthPage }; 