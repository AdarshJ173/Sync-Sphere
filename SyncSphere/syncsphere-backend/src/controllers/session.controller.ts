import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Session, IMediaState } from '../models/Session';
import { UserRelationship } from '../models/UserRelationship';
import { logger } from '../utils/logger';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { title, description, mediaUrl, mediaType, maxParticipants, isPrivate, password } = req.body;

    const session = new Session({
      title,
      description,
      host: req.user._id,
      mediaUrl,
      mediaType,
      maxParticipants,
      isPrivate,
      password,
      participants: [req.user._id] // Host is automatically a participant
    });

    await session.save();

    res.status(201).json({
      status: 'success',
      data: {
        session: await Session.findById(session._id)
          .populate('host participants', 'firstName lastName email')
      }
    });
  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating session'
    });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;
    const query: any = {};

    // Filter by status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'ended') {
      query.isActive = false;
    }

    // Filter by type (hosted/participated)
    if (type === 'hosted') {
      query.host = req.user._id;
    } else if (type === 'participated') {
      query.participants = req.user._id;
    } else {
      // Default: show sessions where user is either host or participant
      query.$or = [
        { host: req.user._id },
        { participants: req.user._id }
      ];
    }

    const sessions = await Session.find(query)
      .populate('host participants', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { sessions }
    });
  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching sessions'
    });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('host participants', 'firstName lastName email');

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    // Check if user has access to private session
    if (session.isPrivate && 
        !session.participants.some(p => p._id.toString() === req.user._id.toString()) &&
        session.host._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to private session'
      });
    }

    res.json({
      status: 'success',
      data: { session }
    });
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching session'
    });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    // Only host can update session details
    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only host can update session'
      });
    }

    const allowedUpdates = ['title', 'description', 'mediaUrl', 'mediaType', 'maxParticipants', 'isPrivate', 'password'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {} as any);

    Object.assign(session, updates);
    await session.save();

    res.json({
      status: 'success',
      data: {
        session: await Session.findById(session._id)
          .populate('host participants', 'firstName lastName email')
      }
    });
  } catch (error) {
    logger.error('Update session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating session'
    });
  }
};

export const endSession = async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    // Only host can end session
    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only host can end session'
      });
    }

    session.isActive = false;
    session.endTime = new Date();
    await session.save();

    res.json({
      status: 'success',
      data: {
        session: await Session.findById(session._id)
          .populate('host participants', 'firstName lastName email')
      }
    });
  } catch (error) {
    logger.error('End session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error ending session'
    });
  }
};

export const joinSession = async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    if (!session.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Session has ended'
      });
    }

    // Check password for private sessions
    if (session.isPrivate) {
      const { password } = req.body;
      const sessionWithPassword = await Session.findById(session._id).select('+password');
      
      if (!password || password !== sessionWithPassword?.password) {
        return res.status(403).json({
          status: 'error',
          message: 'Invalid session password'
        });
      }
    }

    // Add participant
    try {
      await session.addParticipant(req.user._id);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.json({
      status: 'success',
      data: {
        session: await Session.findById(session._id)
          .populate('host participants', 'firstName lastName email')
      }
    });
  } catch (error) {
    logger.error('Join session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error joining session'
    });
  }
};

export const leaveSession = async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    // Host can't leave their own session
    if (session.host.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Host cannot leave session'
      });
    }

    await session.removeParticipant(req.user._id);

    res.json({
      status: 'success',
      data: {
        session: await Session.findById(session._id)
          .populate('host participants', 'firstName lastName email')
      }
    });
  } catch (error) {
    logger.error('Leave session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error leaving session'
    });
  }
};

export const updateMediaState = async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    // Only host can update media state
    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only host can update media state'
      });
    }

    const { currentTime, isPlaying, volume, playbackRate } = req.body;
    await session.updateMediaState({
      currentTime,
      isPlaying,
      volume,
      playbackRate
    });

    res.json({
      status: 'success',
      data: {
        mediaState: session.mediaState
      }
    });
  } catch (error) {
    logger.error('Update media state error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating media state'
    });
  }
}; 