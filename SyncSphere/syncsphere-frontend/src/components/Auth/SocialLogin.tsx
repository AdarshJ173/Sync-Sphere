import React from 'react';
import { Button, Stack, Typography, Divider } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { styled } from '@mui/material/styles';

const SocialButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(2),
  },
}));

const FacebookButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1877F2',
  color: 'white',
  '&:hover': {
    backgroundColor: '#166FE5',
  },
}));

const AppleButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#000000',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1A1A1A',
  },
}));

interface SocialLoginProps {
  onSuccess: (token: string) => void;
  onError: (error: any) => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onSuccess, onError }) => {
  const handleGoogleLogin = () => {
    try {
      window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
    } catch (error) {
      onError(error);
    }
  };

  const handleFacebookLogin = () => {
    try {
      window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/facebook`;
    } catch (error) {
      onError(error);
    }
  };

  const handleAppleLogin = () => {
    try {
      window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/apple`;
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Stack spacing={2} width="100%">
      <Divider>
        <Typography variant="body2" color="text.secondary">
          OR CONTINUE WITH
        </Typography>
      </Divider>

      <SocialButton
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{ backgroundColor: '#ffffff', color: '#000000', '&:hover': { backgroundColor: '#f5f5f5' } }}
      >
        Continue with Google
      </SocialButton>

      <FacebookButton
        variant="contained"
        startIcon={<FaFacebook />}
        onClick={handleFacebookLogin}
        fullWidth
      >
        Continue with Facebook
      </FacebookButton>

      <AppleButton
        variant="contained"
        startIcon={<FaApple />}
        onClick={handleAppleLogin}
        fullWidth
      >
        Continue with Apple
      </AppleButton>
    </Stack>
  );
};

export default SocialLogin; 