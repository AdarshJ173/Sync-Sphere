import { Request, Response } from 'express';
import { Queue } from '../models/Queue';
import { Session } from '../models/Session';
import { YouTubeService } from '../services/YouTubeService';
import { logger } from '../utils/logger';

export const getQueue = async (req: Request, res: Response) => {
  try {
    const queue = await Queue.findBySessionId(req.params.sessionId);
    
    if (!queue) {
      return res.status(404).json({
        status: 'error',
        message: 'Queue not found'
      });
    }

    res.json({
      status: 'success',
      data: { queue }
    });
  } catch (error) {
    logger.error('Get queue error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching queue'
    });
  }
};

export const addToQueue = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { videoId } = req.body;

    // Check session exists and user is participant
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    if (!session.participants.includes(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not a session participant'
      });
    }

    // Get video details from YouTube
    const youtubeService = YouTubeService.getInstance();
    const videoDetails = await youtubeService.getVideoDetails(videoId);

    // Find or create queue
    let queue = await Queue.findBySessionId(sessionId);
    if (!queue) {
      queue = new Queue({
        sessionId,
        items: [],
        currentIndex: 0
      });
    }

    // Add item to queue
    await queue.addItem({
      videoId,
      title: videoDetails.title,
      duration: videoDetails.duration,
      thumbnail: videoDetails.thumbnail,
      addedBy: req.user._id
    });

    res.json({
      status: 'success',
      data: {
        queue: await Queue.findBySessionId(sessionId)
      }
    });
  } catch (error) {
    logger.error('Add to queue error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding to queue'
    });
  }
};

export const removeFromQueue = async (req: Request, res: Response) => {
  try {
    const { sessionId, index } = req.params;

    const queue = await Queue.findBySessionId(sessionId);
    if (!queue) {
      return res.status(404).json({
        status: 'error',
        message: 'Queue not found'
      });
    }

    // Check if user is host or added the item
    const session = await Session.findById(sessionId);
    const item = queue.items[parseInt(index)];
    
    if (!session || 
        (!session.host.equals(req.user._id) && 
         !item.addedBy.equals(req.user._id))) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to remove this item'
      });
    }

    await queue.removeItem(parseInt(index));

    res.json({
      status: 'success',
      data: {
        queue: await Queue.findBySessionId(sessionId)
      }
    });
  } catch (error) {
    logger.error('Remove from queue error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error removing from queue'
    });
  }
};

export const reorderQueue = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { fromIndex, toIndex } = req.body;

    const queue = await Queue.findBySessionId(sessionId);
    if (!queue) {
      return res.status(404).json({
        status: 'error',
        message: 'Queue not found'
      });
    }

    // Only host can reorder queue
    const session = await Session.findById(sessionId);
    if (!session || !session.host.equals(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only host can reorder queue'
      });
    }

    await queue.moveItem(fromIndex, toIndex);

    res.json({
      status: 'success',
      data: {
        queue: await Queue.findBySessionId(sessionId)
      }
    });
  } catch (error) {
    logger.error('Reorder queue error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error reordering queue'
    });
  }
};

export const searchVideos = async (req: Request, res: Response) => {
  try {
    const { query, pageToken } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const youtubeService = YouTubeService.getInstance();
    const searchResults = await youtubeService.searchVideos(
      query,
      pageToken as string | undefined
    );

    res.json({
      status: 'success',
      data: searchResults
    });
  } catch (error) {
    logger.error('Search videos error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error searching videos'
    });
  }
}; 