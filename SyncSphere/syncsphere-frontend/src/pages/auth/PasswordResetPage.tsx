import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { motion } from 'framer-motion';

export const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in reset mode (have a reset token)
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      setIsResetMode(true);
      setResetToken(token);
    }
  }, [location]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await AuthService.requestPasswordReset(email);
      setSuccess('Password reset instructions have been sent to your email.');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!resetToken) {
      setError('Invalid reset token. Please try requesting a new password reset.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await AuthService.resetPassword(resetToken, newPassword);
      setSuccess('Password has been successfully reset. You can now login with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component={motion.div}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom align="center">
            {isResetMode ? 'Reset Your Password' : 'Forgot Password'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={isResetMode ? handlePasswordReset : handleRequestReset}>
            {!isResetMode ? (
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
            ) : (
              <>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
              </>
            )}

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
              ) : isResetMode ? (
                'Reset Password'
              ) : (
                'Send Reset Instructions'
              )}
            </Button>

            <Button
              fullWidth
              color="primary"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Back to Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordResetPage; 