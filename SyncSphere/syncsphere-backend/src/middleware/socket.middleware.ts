import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { 
  IClientToServerEvents,
  IServerToClientEvents,
  IInterServerEvents,
  ISocketData
} from '../types/socket.types';

type SocketWithAuth = Socket<
  IClientToServerEvents,
  IServerToClientEvents,
  IInterServerEvents,
  ISocketData
>;

export const socketAuth = async (
  socket: SocketWithAuth,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwt.secret) as {
      id: string;
      email: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Attach user data to socket
    socket.data.user = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
}; 