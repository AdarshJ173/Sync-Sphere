import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Container, Box, Typography } from '@mui/material';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Store the token in localStorage
      localStorage.setItem('authToken', token);
      
      // Redirect to dashboard or home page
      navigate('/dashboard');
    } else {
      // Handle error case
      navigate('/login', { 
        state: { 
          error: 'Authentication failed. Please try again.' 
        } 
      });
    }
  }, [location, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          Completing authentication...
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthCallback; 