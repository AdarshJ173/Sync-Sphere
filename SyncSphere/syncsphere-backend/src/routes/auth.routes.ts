import express from 'express';
import { signup, login, logout, changePassword, getProfile } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupValidation, loginValidation, changePasswordValidation } from '../validations/auth.validation';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user: any) => {
  return jwt.sign({ id: user.id }, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn,
  });
};

// Public routes
router.post('/signup', validate(signupValidation), signup);
router.post('/login', validate(loginValidation), login);

// Protected routes
router.use(auth);
router.post('/logout', logout);
router.post('/change-password', validate(changePasswordValidation), changePassword);
router.get('/profile', getProfile);

// Google Auth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Facebook Auth Routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Apple Auth Routes
router.get('/apple',
  passport.authenticate('apple', { scope: ['email', 'name'] })
);

router.get('/apple/callback',
  passport.authenticate('apple', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export default router; 