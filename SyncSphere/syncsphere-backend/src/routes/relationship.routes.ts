import express from 'express';
import { auth } from '../middleware/auth';
import {
  sendFriendRequest,
  getFriends,
  getPendingRequests,
  respondToRequest,
  removeFriend,
  blockUser
} from '../controllers/relationship.controller';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Friend management routes
router.post('/requests', sendFriendRequest);
router.get('/friends', getFriends);
router.get('/requests/pending', getPendingRequests);
router.post('/requests/:id/respond', respondToRequest);
router.delete('/friends/:id', removeFriend);

// Blocking routes
router.post('/block/:userId', blockUser);

export default router; 