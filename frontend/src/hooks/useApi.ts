/**
 * Custom React Hooks for API Data Fetching
 * Handles loading, error states, and caching
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data from API
 */
export function useFetch<T>(
  url: string,
  options?: { skip?: boolean; refetchInterval?: number }
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (options?.skip) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get<T>(url);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url, options?.skip]);

  useEffect(() => {
    fetchData();

    // Setup refetch interval if specified
    if (options?.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options?.refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching servers list
 */
export function useServers(userId?: string) {
  const url = userId ? `/servers?userId=${userId}` : '/servers';
  return useFetch(url, { refetchInterval: 30000 }); // Refetch every 30s
}

/**
 * Hook for fetching single server
 */
export function useServer(serverId: string) {
  return useFetch(`/servers/${serverId}`, { refetchInterval: 30000 });
}

/**
 * Hook for fetching server stats
 */
export function useServerStats(serverId: string) {
  return useFetch(`/servers/${serverId}/stats`, { refetchInterval: 5000 }); // Refetch every 5s
}

/**
 * Hook for fetching nodes list
 */
export function useNodes() {
  return useFetch('/nodes', { refetchInterval: 60000 }); // Refetch every 60s
}

/**
 * Hook for fetching single node
 */
export function useNode(nodeId: string) {
  return useFetch(`/nodes/${nodeId}`, { refetchInterval: 30000 });
}

/**
 * Hook for fetching node allocations
 */
export function useNodeAllocations(nodeId: string) {
  return useFetch(`/nodes/${nodeId}/allocations`);
}

/**
 * Hook for fetching game servers
 */
export function useGameServers(userId?: string) {
  const url = userId ? `/gaming/servers?userId=${userId}` : '/gaming/servers';
  return useFetch(url, { refetchInterval: 30000 });
}

/**
 * Hook for fetching game server players
 */
export function useGameServerPlayers(gameServerId: string) {
  return useFetch(`/gaming/servers/${gameServerId}/players`, { refetchInterval: 10000 });
}

/**
 * Hook for fetching storage files
 */
export function useStorageFiles(serverId: string, path: string = '/') {
  const url = `/storage/servers/${serverId}/files?path=${encodeURIComponent(path)}`;
  return useFetch(url);
}

/**
 * Hook for fetching monitoring stats
 */
export function useMonitoringStats(serverId: string) {
  return useFetch(`/monitoring/servers/${serverId}/stats`, { refetchInterval: 10000 });
}

/**
 * Hook for fetching monitoring history
 */
export function useMonitoringHistory(serverId: string, hours: number = 24) {
  return useFetch(`/monitoring/servers/${serverId}/history?hours=${hours}`, {
    refetchInterval: 60000,
  });
}

/**
 * Hook for fetching alerts
 */
export function useAlerts(serverId?: string) {
  const url = serverId ? `/monitoring/alerts?serverId=${serverId}` : '/monitoring/alerts';
  return useFetch(url, { refetchInterval: 30000 });
}

/**
 * Hook for current user info
 */
export function useCurrentUser() {
  return useFetch('/auth/me');
}

/**
 * Generic mutation hook for POST/PUT/DELETE operations
 */
interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useMutation<T>(
  method: 'post' | 'put' | 'patch' | 'delete',
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
) {
  const [state, setState] = useState<UseMutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (url: string, payload?: any): Promise<T | null> => {
      try {
        setState({ data: null, loading: true, error: null });

        let result: T;
        switch (method) {
          case 'post':
            result = await apiClient.post<T>(url, payload);
            break;
          case 'put':
            result = await apiClient.put<T>(url, payload);
            break;
          case 'patch':
            result = await apiClient.patch<T>(url, payload);
            break;
          case 'delete':
            result = await apiClient.delete<T>(url);
            break;
        }

        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState({ data: null, loading: false, error });
        onError?.(error);
        return null;
      }
    },
    [method, onSuccess, onError]
  );

  return { ...state, mutate };
}

/**
 * Hook for creating servers
 */
export function useCreateServer(onSuccess?: () => void) {
  const { mutate, ...state } = useMutation(
    'post',
    () => onSuccess?.()
  );

  return {
    ...state,
    createServer: (data: any) => mutate('/servers', data),
  };
}

/**
 * Hook for updating servers
 */
export function useUpdateServer(onSuccess?: () => void) {
  const { mutate, ...state } = useMutation(
    'put',
    () => onSuccess?.()
  );

  return {
    ...state,
    updateServer: (serverId: string, data: any) =>
      mutate(`/servers/${serverId}`, data),
  };
}

/**
 * Hook for deleting servers
 */
export function useDeleteServer(onSuccess?: () => void) {
  const { mutate, ...state } = useMutation(
    'delete',
    () => onSuccess?.()
  );

  return {
    ...state,
    deleteServer: (serverId: string) =>
      mutate(`/servers/${serverId}`),
  };
}

/**
 * Hook for server control operations
 */
export function useServerControl(serverId: string) {
  const { mutate: startServer } = useMutation('post');
  const { mutate: stopServer } = useMutation('post');
  const { mutate: restartServer } = useMutation('post');

  return {
    start: () => startServer(`/servers/${serverId}/start`),
    stop: () => stopServer(`/servers/${serverId}/stop`),
    restart: () => restartServer(`/servers/${serverId}/restart`),
  };
}

export default {
  useFetch,
  useServers,
  useServer,
  useServerStats,
  useNodes,
  useNode,
  useNodeAllocations,
  useGameServers,
  useGameServerPlayers,
  useStorageFiles,
  useMonitoringStats,
  useMonitoringHistory,
  useAlerts,
  useCurrentUser,
  useMutation,
  useCreateServer,
  useUpdateServer,
  useDeleteServer,
  useServerControl,
};
