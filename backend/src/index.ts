import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Routes
import authRoutes from './api/routes/auth';
import serverRoutes from './api/routes/servers';
import containerRoutes from './api/routes/containers';
import gamingRoutes from './api/routes/gaming';
import storageRoutes from './api/routes/storage';
import monitoringRoutes from './api/routes/monitoring';
import remoteAccessRoutes from './api/routes/remoteAccess';
import nodesRoutes from './api/routes/nodes';

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/gaming', gamingRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/remote', remoteAccessRoutes);
app.use('/api/nodes', nodesRoutes);

// WebSocket connections
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Server monitoring events
  socket.on('subscribe:server-stats', (serverId: string) => {
    socket.join(`server-${serverId}`);
    logger.info(`Client subscribed to server ${serverId}`);
  });

  socket.on('unsubscribe:server-stats', (serverId: string) => {
    socket.leave(`server-${serverId}`);
  });

  // Remote console events
  socket.on('remote:terminal-command', async (data: any) => {
    // Handle remote terminal commands
    io.to(`server-${data.serverId}`).emit('remote:terminal-output', {
      output: 'Command executed',
      timestamp: new Date(),
    });
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  logger.info(`ArtiPanel API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export { app, io };
