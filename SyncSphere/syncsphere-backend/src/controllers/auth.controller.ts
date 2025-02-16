import { Request, Response } from 'express';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating user'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user and select password (password field is not selected by default)
    const user = await User.findByEmail(email);
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // In a real-world application, you might want to blacklist the token
    // or implement a token revocation mechanism
    
    res.json({
      status: 'success',
      message: 'Successfully logged out'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout'
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password successfully updated'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error changing password'
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile'
    });
  }
}; 