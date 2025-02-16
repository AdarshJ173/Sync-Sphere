import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserRelationship } from '../models/UserRelationship';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { recipientId } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipient not found'
      });
    }

    // Check if relationship already exists
    const existingRelationship = await UserRelationship.findRelationship(
      req.user._id,
      recipientId
    );

    if (existingRelationship) {
      return res.status(400).json({
        status: 'error',
        message: 'Relationship already exists'
      });
    }

    // Create new relationship
    const relationship = new UserRelationship({
      requester: req.user._id,
      recipient: recipientId
    });

    await relationship.save();

    res.status(201).json({
      status: 'success',
      data: {
        relationship: await UserRelationship.findById(relationship._id)
          .populate('requester recipient', 'firstName lastName email')
      }
    });
  } catch (error) {
    logger.error('Send friend request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending friend request'
    });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    const relationships = await UserRelationship.getFriends(req.user._id);

    const friends = relationships.map(rel => {
      const friend = rel.requester._id.toString() === req.user._id.toString()
        ? rel.recipient
        : rel.requester;
      return {
        id: friend._id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        email: friend.email,
        relationshipId: rel._id
      };
    });

    res.json({
      status: 'success',
      data: { friends }
    });
  } catch (error) {
    logger.error('Get friends error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching friends'
    });
  }
};

export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const relationships = await UserRelationship.getPendingRequests(req.user._id);

    res.json({
      status: 'success',
      data: {
        requests: relationships.map(rel => ({
          id: rel._id,
          requester: {
            id: rel.requester._id,
            firstName: rel.requester.firstName,
            lastName: rel.requester.lastName,
            email: rel.requester.email
          },
          createdAt: rel.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('Get pending requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching pending requests'
    });
  }
};

export const respondToRequest = async (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    const relationship = await UserRelationship.findById(req.params.id);

    if (!relationship) {
      return res.status(404).json({
        status: 'error',
        message: 'Friend request not found'
      });
    }

    // Verify recipient is current user
    if (relationship.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to respond to this request'
      });
    }

    if (relationship.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only respond to pending requests'
      });
    }

    if (action === 'accept') {
      await relationship.accept();
      
      res.json({
        status: 'success',
        data: {
          relationship: await UserRelationship.findById(relationship._id)
            .populate('requester recipient', 'firstName lastName email')
        }
      });
    } else if (action === 'reject') {
      await relationship.reject();
      
      res.json({
        status: 'success',
        message: 'Friend request rejected'
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Invalid action'
      });
    }
  } catch (error) {
    logger.error('Respond to request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error responding to friend request'
    });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    const relationship = await UserRelationship.findById(req.params.id);

    if (!relationship) {
      return res.status(404).json({
        status: 'error',
        message: 'Relationship not found'
      });
    }

    // Verify user is part of the relationship
    if (relationship.requester.toString() !== req.user._id.toString() &&
        relationship.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to modify this relationship'
      });
    }

    if (relationship.status !== 'accepted') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only remove accepted friends'
      });
    }

    await relationship.deleteOne();

    res.json({
      status: 'success',
      message: 'Friend removed successfully'
    });
  } catch (error) {
    logger.error('Remove friend error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error removing friend'
    });
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    let relationship = await UserRelationship.findRelationship(
      req.user._id,
      userId
    );

    if (!relationship) {
      // Create new blocked relationship
      relationship = new UserRelationship({
        requester: req.user._id,
        recipient: userId,
        status: 'blocked'
      });
    } else {
      await relationship.block();
    }

    await relationship.save();

    res.json({
      status: 'success',
      message: 'User blocked successfully'
    });
  } catch (error) {
    logger.error('Block user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error blocking user'
    });
  }
}; 