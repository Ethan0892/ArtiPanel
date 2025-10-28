/**
 * WebSocket Event Handlers
 * Real-time communication with clients
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../utils/logger';

let io: SocketIOServer;
const subscriptions = new Map<string, Set<string>>();

/**
 * Initialize WebSocket handlers
 */
export function initializeWebSocketHandlers(socketIO: SocketIOServer) {
  io = socketIO;

  io.on('connection', (socket: Socket) => {
    logger.info(`✅ Client connected: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', (data: { token: string }) => {
      logger.debug(`🔐 User authenticated: ${socket.id}`);
    });

    // Handle server subscriptions
    socket.on('subscribe:server', (data: { serverId: string }) => {
      const key = `server:${data.serverId}`;
      if (!subscriptions.has(key)) {
        subscriptions.set(key, new Set());
      }
      subscriptions.get(key)?.add(socket.id);
      logger.debug(`📡 Client subscribed to server: ${data.serverId}`);
    });

    socket.on('unsubscribe:server', (data: { serverId: string }) => {
      const key = `server:${data.serverId}`;
      subscriptions.get(key)?.delete(socket.id);
      logger.debug(`📴 Client unsubscribed from server: ${data.serverId}`);
    });

    // Handle game server subscriptions
    socket.on('subscribe:gameserver', (data: { gameServerId: string }) => {
      const key = `gameserver:${data.gameServerId}`;
      if (!subscriptions.has(key)) {
        subscriptions.set(key, new Set());
      }
      subscriptions.get(key)?.add(socket.id);
      logger.debug(`📡 Client subscribed to game server: ${data.gameServerId}`);
    });

    socket.on('unsubscribe:gameserver', (data: { gameServerId: string }) => {
      const key = `gameserver:${data.gameServerId}`;
      subscriptions.get(key)?.delete(socket.id);
      logger.debug(`📴 Client unsubscribed from game server: ${data.gameServerId}`);
    });

    // Handle node subscriptions
    socket.on('subscribe:node', (data: { nodeId: string }) => {
      const key = `node:${data.nodeId}`;
      if (!subscriptions.has(key)) {
        subscriptions.set(key, new Set());
      }
      subscriptions.get(key)?.add(socket.id);
      logger.debug(`📡 Client subscribed to node: ${data.nodeId}`);
    });

    socket.on('unsubscribe:node', (data: { nodeId: string }) => {
      const key = `node:${data.nodeId}`;
      subscriptions.get(key)?.delete(socket.id);
      logger.debug(`📴 Client unsubscribed from node: ${data.nodeId}`);
    });

    // Handle server commands
    socket.on('server:command', (data: { serverId: string; command: string }) => {
      logger.info(`⚙️ Server command: ${data.command}`);
      broadcastToSubscribers(`server:${data.serverId}`, 'console:output', {
        serverId: data.serverId,
        line: `[COMMAND] ${data.command}`,
        timestamp: new Date(),
      });
    });

    // Handle game server console
    socket.on('gameserver:console', (data: { gameServerId: string; command: string }) => {
      logger.info(`⚙️ Game server console: ${data.command}`);
      broadcastToSubscribers(`gameserver:${data.gameServerId}`, 'console:output', {
        gameServerId: data.gameServerId,
        line: `> ${data.command}`,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`❌ Client disconnected: ${socket.id}`);

      // Clean up subscriptions
      subscriptions.forEach((clients) => {
        clients.delete(socket.id);
      });
    });

    socket.on('error', (error: any) => {
      logger.error(`❌ WebSocket error for ${socket.id}:`, error);
    });
  });
}

/**
 * Broadcast monitoring update to all subscribed clients
 */
export function broadcastMonitoringUpdate(serverId: string, stats: any) {
  broadcastToSubscribers(`server:${serverId}`, 'monitoring:update', {
    serverId,
    ...stats,
  });
}

/**
 * Broadcast server status change
 */
export function broadcastServerStatus(serverId: string, status: string) {
  io?.emit('server:status', {
    serverId,
    status,
    timestamp: new Date(),
  });
}

/**
 * Broadcast notification
 */
export function broadcastNotification(notification: {
  type: string;
  title: string;
  message: string;
}) {
  io?.emit('notification', {
    id: Date.now().toString(),
    ...notification,
    timestamp: new Date(),
    read: false,
  });
}

/**
 * Broadcast game server event
 */
export function broadcastGameServerEvent(
  gameServerId: string,
  eventType: string,
  data: any
) {
  broadcastToSubscribers(`gameserver:${gameServerId}`, 'gameserver:event', {
    gameServerId,
    eventType,
    data,
    timestamp: new Date(),
  });
}

/**
 * Broadcast node status
 */
export function broadcastNodeStatus(nodeId: string, status: any) {
  broadcastToSubscribers(`node:${nodeId}`, 'node:status', {
    nodeId,
    ...status,
    timestamp: new Date(),
  });
}

/**
 * Broadcast console output
 */
export function broadcastConsoleOutput(serverId: string, line: string) {
  broadcastToSubscribers(`server:${serverId}`, 'console:output', {
    serverId,
    line,
    timestamp: new Date(),
  });
}

/**
 * Broadcast alert
 */
export function broadcastAlert(alert: any) {
  io?.emit('alert', {
    id: Date.now().toString(),
    ...alert,
    timestamp: new Date(),
  });
}

/**
 * Helper: Broadcast to specific subscribers
 */
function broadcastToSubscribers(key: string, event: string, data: any) {
  const subscribers = subscriptions.get(key);
  if (subscribers) {
    subscribers.forEach((clientId) => {
      io?.to(clientId).emit(event, data);
    });
  }
}

/**
 * Get connected clients count
 */
export function getConnectedClientsCount(): number {
  return io?.engine.clientsCount || 0;
}

/**
 * Get subscriptions info
 */
export function getSubscriptionsInfo() {
  const info: any = {};
  subscriptions.forEach((clients, key) => {
    info[key] = clients.size;
  });
  return info;
}

export default {
  initializeWebSocketHandlers,
  broadcastMonitoringUpdate,
  broadcastServerStatus,
  broadcastNotification,
  broadcastGameServerEvent,
  broadcastNodeStatus,
  broadcastConsoleOutput,
  broadcastAlert,
  getConnectedClientsCount,
  getSubscriptionsInfo,
};
