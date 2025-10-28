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
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Socket.IO with production-grade configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_URL.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
    maxAge: 86400,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000,
  maxHttpBufferSize: 1e6,
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production',
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

app.use(cors({
  origin: FRONTEND_URL.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Body Parser Middleware with size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request ID middleware for tracking
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Request-ID', `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  next();
});

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Advanced Rate limiting with adaptive thresholds
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => {
    // Higher limits for authenticated requests
    if (req.headers.authorization) return 500;
    return 100;
  },
  message: 'Rate limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => req.path === '/health',
});

app.use('/api/', limiter);

// Health check endpoint with detailed diagnostics
app.get('/health', (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)} minutes`,
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    },
    version: process.env.APP_VERSION || '0.1.0-alpha.1',
    environment: NODE_ENV,
  });
});

// API Routes - Organized by domain
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/gaming', gamingRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/remote', remoteAccessRoutes);
app.use('/api/nodes', nodesRoutes);

// WebSocket Connection Management
io.on('connection', (socket: any) => {
  const clientIP = socket.handshake.address;
  const socketID = socket.id;
  
  logger.info(`Client connected: ${socketID} from ${clientIP}`);

  // Namespace and room management
  socket.on('join:room', (roomName: string) => {
    socket.join(roomName);
    logger.debug(`Socket ${socketID} joined room: ${roomName}`);
  });

  socket.on('leave:room', (roomName: string) => {
    socket.leave(roomName);
    logger.debug(`Socket ${socketID} left room: ${roomName}`);
  });

  socket.on('disconnect', (reason: string) => {
    logger.info(`Client disconnected: ${socketID} - Reason: ${reason}`);
  });

  socket.on('error', (error: Error) => {
    logger.error(`WebSocket error for ${socketID}: ${error.message}`);
  });

  // Server monitoring subscription
  socket.on('subscribe:server-monitoring', (serverId: string) => {
    const room = `server-monitoring-${serverId}`;
    socket.join(room);
    socket.emit('subscription:confirmed', { serverId, room });
    logger.debug(`Socket ${socketID} subscribed to server monitoring: ${serverId}`);
  });

  socket.on('unsubscribe:server-monitoring', (serverId: string) => {
    const room = `server-monitoring-${serverId}`;
    socket.leave(room);
    logger.debug(`Socket ${socketID} unsubscribed from server monitoring: ${serverId}`);
  });

  // Terminal/Console event handling
  socket.on('console:command-execute', async (data: any) => {
    try {
      const { serverId, command } = data;
      const room = `server-console-${serverId}`;
      io.to(room).emit('console:command-received', {
        command,
        timestamp: new Date().toISOString(),
        sourceId: socketID,
      });
      logger.debug(`Console command executed on server ${serverId}`);
    } catch (error: any) {
      logger.error(`Console command error: ${error.message}`);
      socket.emit('console:error', { message: error.message });
    }
  });

  socket.on('console:output-stream', (data: any) => {
    const { serverId, output } = data;
    const room = `server-console-${serverId}`;
    io.to(room).emit('console:output-received', {
      output,
      timestamp: new Date().toISOString(),
    });
  });
});

// Error handling middleware with comprehensive logging
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  logger.error(`Error ID: ${errorId} - ${err.message}`, {
    stack: err.stack,
    path: _req?.path,
    method: _req?.method,
    status: err.status || 500,
  });

  res.status(err.status || 500).json({
    errorId,
    message: err.message || 'An internal server error occurred',
    status: err.status || 500,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler with helpful error information
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: _req.path,
    method: _req.method,
    status: 404,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info('========================================');
  logger.info('ArtiPanel Server Management System');
  logger.info('========================================');
  logger.info(`API Server: http://localhost:${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Frontend URL: ${FRONTEND_URL}`);
  logger.info(`Version: ${process.env.APP_VERSION || '0.1.0-alpha.1'}`);
  logger.info('========================================');
  logger.info('Server started successfully');
});

export { app, io, server };
