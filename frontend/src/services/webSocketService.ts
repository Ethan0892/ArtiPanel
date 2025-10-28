/**
 * WebSocket Service
 * Real-time updates for server status, monitoring, and notifications
 */

import io, { Socket } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

interface MonitoringData {
  serverId: string;
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  status: 'online' | 'offline' | 'warning' | 'critical';
}

interface ServerStatusUpdate {
  serverId: string;
  status: 'running' | 'stopped' | 'restarting' | 'installing' | 'error';
  timestamp: Date;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface GameServerEvent {
  gameServerId: string;
  eventType: 'player_joined' | 'player_left' | 'server_crashed' | 'console_output';
  data: any;
  timestamp: Date;
}

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connected: boolean = false;

  /**
   * Initialize WebSocket connection
   */
  connect(token?: string) {
    if (this.socket?.connected) {
      return;
    }

    const socketOptions: any = {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    };

    if (token) {
      socketOptions.auth = { token };
    }

    this.socket = io(WS_URL, socketOptions);

    // Connection events
    this.socket.on('connect', () => {
      this.connected = true;
      console.log('✅ WebSocket connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('❌ WebSocket disconnected');
      this.emit('disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ WebSocket error:', error);
      this.emit('error', error);
    });

    // Real-time events
    this.socket.on('monitoring:update', (data: MonitoringData) => {
      this.emit('monitoring:update', data);
    });

    this.socket.on('server:status', (data: ServerStatusUpdate) => {
      this.emit('server:status', data);
    });

    this.socket.on('notification', (data: Notification) => {
      this.emit('notification', data);
    });

    this.socket.on('gameserver:event', (data: GameServerEvent) => {
      this.emit('gameserver:event', data);
    });

    this.socket.on('node:status', (data: any) => {
      this.emit('node:status', data);
    });

    this.socket.on('console:output', (data: any) => {
      this.emit('console:output', data);
    });

    this.socket.on('alert', (data: any) => {
      this.emit('alert', data);
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Subscribe to event
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    // Also listen on socket if already connected
    if (this.socket && event.includes(':')) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }

  /**
   * Send server command
   */
  serverCommand(serverId: string, command: string) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit('server:command', { serverId, command });
  }

  /**
   * Send game server console command
   */
  gameServerConsole(gameServerId: string, command: string) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit('gameserver:console', { gameServerId, command });
  }

  /**
   * Subscribe to server monitoring
   */
  subscribeToServer(serverId: string) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit('subscribe:server', { serverId });
  }

  /**
   * Unsubscribe from server monitoring
   */
  unsubscribeFromServer(serverId: string) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit('unsubscribe:server', { serverId });
  }

  /**
   * Subscribe to game server
   */
  subscribeToGameServer(gameServerId: string) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit('subscribe:gameserver', { gameServerId });
  }

  /**
   * Unsubscribe from game server
   */
  unsubscribeFromGameServer(gameServerId: string) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit('unsubscribe:gameserver', { gameServerId });
  }

  /**
   * Subscribe to node
   */
  subscribeToNode(nodeId: string) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit('subscribe:node', { nodeId });
  }

  /**
   * Unsubscribe from node
   */
  unsubscribeFromNode(nodeId: string) {
    if (!this.socket) throw new Error('WebSocket not connected');
    this.socket.emit('unsubscribe:node', { nodeId });
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
