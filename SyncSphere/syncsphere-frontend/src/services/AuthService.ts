import axios from 'axios';
import { User } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    // Initialize axios interceptors
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
      return response.data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      this.token = null;
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async checkSession(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      this.token = token;
      const response = await axios.get(`${API_URL}/auth/session`);
      return response.data.user;
    } catch (error) {
      console.error('Session check failed:', error);
      this.token = null;
      localStorage.removeItem('auth_token');
      return null;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/request-reset`, { email });
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }

  async refreshZegoToken(userId: string): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/auth/zego-token`, {
        userId,
      });
      return response.data.token;
    } catch (error) {
      console.error('Failed to refresh Zego token:', error);
      throw error;
    }
  }
}

export default AuthService.getInstance(); 