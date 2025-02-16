import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDB } from './config/database';
import { logger } from './utils/logger';
import { socketAuth } from './middleware/socket.middleware';
import { SocketManager } from './services/SocketManager';
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import relationshipRoutes from './routes/relationship.routes';
import queueRoutes from './routes/queue.routes';
import {
  IClientToServerEvents,
  IServerToClientEvents,
  IInterServerEvents,
  ISocketData
} from './types/socket.types';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server<
  IClientToServerEvents,
  IServerToClientEvents,
  IInterServerEvents,
  ISocketData
>(httpServer, {
  cors: {
    origin: config.cors.origin,
    credentials: true
  },
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
});

// Socket.IO middleware
io.use(socketAuth);

// Initialize socket manager
const socketManager = SocketManager.getInstance(io);

// Handle socket connections
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socketManager.initializeSocket(socket);
});

// Security Middleware
app.use(helmet());
app.use(cors(config.cors));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api', queueRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: config.env === 'development' ? err.message : 'Internal server error'
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found'
  });
});

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 