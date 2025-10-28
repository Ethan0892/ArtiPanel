/**
 * React Hook for WebSocket
 * Provides real-time monitoring and updates
 */

import { useEffect, useCallback, useState } from 'react';
import { webSocketService } from '../services/webSocketService';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  token?: string;
}

/**
 * Hook to initialize WebSocket connection
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, token } = options;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (autoConnect) {
      webSocketService.connect(token);
    }

    // Listen to connection state
    webSocketService.on('connected', () => setConnected(true));
    webSocketService.on('disconnected', () => setConnected(false));

    return () => {
      webSocketService.disconnect();
    };
  }, [autoConnect, token]);

  return { connected };
}

/**
 * Hook for real-time server monitoring
 */
export function useServerMonitoring(serverId: string) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!serverId) return;

    // Subscribe to server
    webSocketService.subscribeToServer(serverId);

    // Listen for updates
    webSocketService.on(`monitoring:${serverId}`, (data) => {
      setStats(data);
    });

    return () => {
      webSocketService.unsubscribeFromServer(serverId);
    };
  }, [serverId]);

  return stats;
}

/**
 * Hook for real-time server status
 */
export function useServerStatus(serverId: string) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!serverId) return;

    webSocketService.on('server:status', (data) => {
      if (data.serverId === serverId) {
        setStatus(data.status);
      }
    });
  }, [serverId]);

  return status;
}

/**
 * Hook for real-time notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    webSocketService.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
    });
  }, []);

  return notifications;
}

/**
 * Hook for real-time game server events
 */
export function useGameServerEvents(gameServerId: string) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!gameServerId) return;

    webSocketService.subscribeToGameServer(gameServerId);

    webSocketService.on('gameserver:event', (event) => {
      if (event.gameServerId === gameServerId) {
        setEvents((prev) => [event, ...prev].slice(0, 100));
      }
    });

    return () => {
      webSocketService.unsubscribeFromGameServer(gameServerId);
    };
  }, [gameServerId]);

  return events;
}

/**
 * Hook for real-time node status
 */
export function useNodeStatus(nodeId: string) {
  const [nodeStatus, setNodeStatus] = useState<any>(null);

  useEffect(() => {
    if (!nodeId) return;

    webSocketService.subscribeToNode(nodeId);

    webSocketService.on('node:status', (data) => {
      if (data.nodeId === nodeId) {
        setNodeStatus(data);
      }
    });

    return () => {
      webSocketService.unsubscribeFromNode(nodeId);
    };
  }, [nodeId]);

  return nodeStatus;
}

/**
 * Hook for console output
 */
export function useConsoleOutput(serverId: string) {
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (!serverId) return;

    webSocketService.on('console:output', (data) => {
      if (data.serverId === serverId) {
        setOutput((prev) => [...prev, data.line].slice(-100)); // Keep last 100 lines
      }
    });
  }, [serverId]);

  const sendCommand = useCallback(
    (command: string) => {
      webSocketService.serverCommand(serverId, command);
    },
    [serverId]
  );

  return { output, sendCommand };
}

/**
 * Hook for game server console
 */
export function useGameServerConsole(gameServerId: string) {
  const [output, setOutput] = useState<string[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!gameServerId) return;

    webSocketService.subscribeToGameServer(gameServerId);

    webSocketService.on('console:output', (data) => {
      if (data.gameServerId === gameServerId) {
        setOutput((prev) => [...prev, data.line].slice(-100));
      }
    });

    webSocketService.on('gameserver:players', (data) => {
      if (data.gameServerId === gameServerId) {
        setPlayers(data.players);
      }
    });

    return () => {
      webSocketService.unsubscribeFromGameServer(gameServerId);
    };
  }, [gameServerId]);

  const sendCommand = useCallback(
    (command: string) => {
      webSocketService.gameServerConsole(gameServerId, command);
    },
    [gameServerId]
  );

  return { output, players, sendCommand };
}

/**
 * Hook for real-time alerts
 */
export function useAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    webSocketService.on('alert', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 100));
    });
  }, []);

  return alerts;
}

/**
 * Hook for server command execution
 */
export function useServerCommand(serverId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendCommand = useCallback(
    async (command: string) => {
      try {
        setLoading(true);
        setError(null);
        webSocketService.serverCommand(serverId, command);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [serverId]
  );

  return { sendCommand, loading, error };
}

/**
 * Hook for multiple server monitoring (dashboard)
 */
export function useDashboardMonitoring(serverIds: string[]) {
  const [allStats, setAllStats] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    // Subscribe to all servers
    serverIds.forEach((serverId) => {
      webSocketService.subscribeToServer(serverId);
    });

    // Listen for updates
    webSocketService.on('monitoring:update', (data) => {
      setAllStats((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.serverId, data);
        return newMap;
      });
    });

    return () => {
      serverIds.forEach((serverId) => {
        webSocketService.unsubscribeFromServer(serverId);
      });
    };
  }, [serverIds.join(',')]); // Re-subscribe if server list changes

  return Array.from(allStats.values());
}

export default {
  useWebSocket,
  useServerMonitoring,
  useServerStatus,
  useNotifications,
  useGameServerEvents,
  useNodeStatus,
  useConsoleOutput,
  useGameServerConsole,
  useAlerts,
  useServerCommand,
  useDashboardMonitoring,
};
