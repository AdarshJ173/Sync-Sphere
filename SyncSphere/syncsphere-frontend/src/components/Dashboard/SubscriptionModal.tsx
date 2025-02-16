import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  Fade,
  useTheme,
} from '@mui/material';
import { IoClose, IoCheckmark, IoStar, IoInfinite, IoTv, IoMusicalNotes, IoSparkles } from 'react-icons/io5';
import './SubscriptionModal.css';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  name: string;
  price: string;
  globalPrice: string;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
}

const plans: SubscriptionPlan[] = [
  {
    name: 'Free',
    price: '₹0',
    globalPrice: '$0',
    color: '#6E7187',
    features: [
      { text: 'Ad-supported YouTube/Spotify', included: true },
      { text: 'Basic chat features', included: true },
      { text: 'Limited video calls (480p)', included: true },
      { text: 'Single device support', included: true },
      { text: 'Ad-free experience', included: false },
      { text: 'Premium OTT platforms', included: false },
      { text: 'HD/4K streaming', included: false },
      { text: 'Multi-device support', included: false },
    ],
  },
  {
    name: 'Premium Lite',
    price: '₹199',
    globalPrice: '$9.99',
    color: '#7743DB',
    popular: true,
    features: [
      { text: 'Ad-free YouTube/Spotify', included: true },
      { text: 'Access to 2 OTT platforms', included: true },
      { text: 'HD video calls', included: true },
      { text: '2 device support', included: true },
      { text: 'Regional content focus', included: true },
      { text: 'Premium OTT platforms', included: false },
      { text: '4K streaming', included: false },
      { text: 'Unlimited devices', included: false },
    ],
  },
  {
    name: 'Premium Ultimate',
    price: '₹599',
    globalPrice: '$19.99',
    color: '#BC6FF1',
    features: [
      { text: 'All Premium Lite features', included: true },
      { text: 'All OTT platforms included', included: true },
      { text: '4K streaming quality', included: true },
      { text: 'Live event access', included: true },
      { text: 'Family plan (5 devices)', included: true },
      { text: 'Early access to features', included: true },
      { text: 'Priority support', included: true },
      { text: 'Exclusive content', included: true },
    ],
  },
];

const FeatureIcon = ({ feature }: { feature: string }) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Ad-supported': <IoTv />,
    'Ad-free': <IoTv />,
    'Basic chat': <IoMusicalNotes />,
    'Premium OTT': <IoStar />,
    'HD/4K': <IoSparkles />,
    'Multi-device': <IoInfinite />,
  };

  const icon = Object.entries(iconMap).find(([key]) => feature.includes(key))?.[1] || <IoCheckmark />;

  return (
    <Box className="feature-icon" sx={{ mr: 1 }}>
      {icon}
    </Box>
  );
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setAnimationComplete(false);
      setSelectedPlan(null);
      if (modalRef.current) {
        modalRef.current.style.display = 'none';
        void modalRef.current.offsetHeight;
        modalRef.current.style.display = '';
      }
      const timer = setTimeout(() => setAnimationComplete(true), 600);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (open && modalRef.current) {
      const elements = modalRef.current.getElementsByClassName('scroll-reveal');
      Array.from(elements).forEach((element) => {
        element.classList.add('visible');
      });
    }
  }, [open]);

  const handleScroll = () => {
    if (!modalRef.current) return;
    
    const elements = modalRef.current.getElementsByClassName('scroll-reveal');
    Array.from(elements).forEach((element) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
      if (isVisible) {
        element.classList.add('visible');
      }
    });
  };

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => modalElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    ripple.className = 'ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1A1C2A 0%, #25283D 100%)'
            : 'linear-gradient(135deg, #F8F9FE 0%, #FFFFFF 100%)',
          overflow: 'hidden',
          maxHeight: '90vh',
        },
      }}
    >
      <Box 
        ref={modalRef}
        className="subscription-modal-enter"
        sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div className="modal-background" />
        
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
            zIndex: 1,
          }}
        >
          <IoClose />
        </IconButton>

        <Box sx={{ p: 3, flexShrink: 0 }}>
          <Typography
            variant="h4"
            className="scroll-reveal"
            sx={{
              mb: 1,
              background: 'linear-gradient(45deg, #52057B, #892CDC, #BC6FF1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Choose Your Plan
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            className="scroll-reveal"
            sx={{ mb: 4 }}
          >
            Unlock the full potential of SyncSphere with our premium plans
          </Typography>
        </Box>

        <Box className="subscription-modal-content" sx={{ flex: 1, px: 3, pb: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ width: '100%' }}
          >
            {plans.map((plan, index) => (
              <Box
                key={plan.name}
                className={`plan-card scroll-reveal`}
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: plan.popular ? plan.color : 'divider',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
                  cursor: 'pointer',
                  animationDelay: `${index * 0.1}s`,
                  backgroundColor: selectedPlan === plan.name ? 
                    `${plan.color}0A` : 'transparent',
                }}
                onClick={() => setSelectedPlan(plan.name)}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    size="small"
                    className="popular-badge"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 24,
                      bgcolor: plan.color,
                      fontWeight: 600,
                    }}
                  />
                )}

                <Stack spacing={2}>
                  <Typography 
                    variant="h6" 
                    fontWeight={600}
                    className="feature-highlight"
                  >
                    {plan.name}
                  </Typography>

                  <Box className="price-container">
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      className="price-text"
                      sx={{ color: plan.color }}
                    >
                      {plan.price}
                      <Typography
                        component="span"
                        variant="subtitle1"
                        sx={{ ml: 1, color: 'text.secondary' }}
                      >
                        /month
                      </Typography>
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      Global: {plan.globalPrice}/month
                    </Typography>
                  </Box>

                  <Stack spacing={1.5}>
                    {plan.features.map((feature, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        className="feature-item"
                        sx={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: feature.included ? `${plan.color}20` : 'action.disabledBackground',
                            color: feature.included ? plan.color : 'text.disabled',
                          }}
                        >
                          <FeatureIcon feature={feature.text} />
                        </Box>
                        <Typography
                          variant="body2"
                          className="feature-highlight"
                          sx={{
                            color: feature.included ? 'text.primary' : 'text.disabled',
                          }}
                        >
                          {feature.text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    className="cta-button"
                    onClick={createRipple}
                    sx={{
                      mt: 2,
                      bgcolor: plan.popular ? plan.color : 'transparent',
                      borderColor: plan.color,
                      color: plan.popular ? 'white' : plan.color,
                      '&:hover': {
                        bgcolor: plan.popular ? plan.color : `${plan.color}20`,
                        borderColor: plan.color,
                      },
                    }}
                  >
                    {plan.name === 'Free' ? 'Current Plan' : 'Upgrade Now'}
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>

          <Box sx={{ mt: 4, textAlign: 'center' }} className="scroll-reveal">
            <Typography variant="body2" color="text.secondary">
              All plans include access to our core features. Upgrade anytime to unlock more benefits.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}; 