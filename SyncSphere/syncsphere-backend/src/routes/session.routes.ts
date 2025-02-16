import express from 'express';
import { auth } from '../middleware/auth';
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  endSession,
  joinSession,
  leaveSession,
  updateMediaState
} from '../controllers/session.controller';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Session management routes
router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.patch('/:id', updateSession);
router.post('/:id/end', endSession);

// Session participation routes
router.post('/:id/join', joinSession);
router.post('/:id/leave', leaveSession);

// Media state routes
router.patch('/:id/media-state', updateMediaState);

export default router; 