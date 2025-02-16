import express from 'express';
import { auth } from '../middleware/auth';
import { YouTubeService } from '../services/YouTubeService';
import {
  getQueue,
  addToQueue,
  removeFromQueue,
  reorderQueue,
  searchVideos
} from '../controllers/queue.controller';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Apply rate limiting to YouTube API routes
const rateLimiter = YouTubeService.createRateLimiter();

// Queue management routes
router.get('/sessions/:sessionId/queue', getQueue);
router.post('/sessions/:sessionId/queue', addToQueue);
router.delete('/sessions/:sessionId/queue/:index', removeFromQueue);
router.post('/sessions/:sessionId/queue/reorder', reorderQueue);

// YouTube search route with rate limiting
router.get('/youtube/search', rateLimiter, searchVideos);

export default router; 