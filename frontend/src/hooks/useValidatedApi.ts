/**
 * Validated API Hook
 * 
 * Hook that combines API fetching with automatic response validation
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient, ApiError } from '../services/api';
import { Validator } from '../utils/validation';
import { z } from 'zod';

export interface UseValidatedApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and validating data
 */
export function useValidatedApi<T>(
  endpoint: string,
  schema: z.ZodSchema<T>,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options?.enabled === false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<T>(endpoint);

      // Validate response
      const validatedData = schema.parse(response);
      setData(validatedData);
    } catch (err) {
      let apiError: ApiError;

      if (err instanceof z.ZodError) {
        apiError = new Error('Response validation failed') as ApiError;
        apiError.code = 'VALIDATION_ERROR';
        (apiError as any).details = err.issues;
      } else {
        apiError = err instanceof Error ? (err as ApiError) : new Error(String(err)) as ApiError;
      }

      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [endpoint, schema, options?.enabled]);

  useEffect(() => {
    fetchData();

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
 * Hook for fetching list with validation
 */
export function useValidatedList<T>(
  endpoint: string,
  itemSchema: z.ZodSchema<T>,
  options?: any
) {
  const listSchema = z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  });

  return useValidatedApi(endpoint, listSchema, options);
}

/**
 * Hook for posting/putting with validation
 */
export function useValidatedMutation<T>(
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  responseSchema?: z.ZodSchema<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (endpoint: string, payload?: any): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        let response: any;

        if (method === 'POST') {
          response = await apiClient.post<T>(endpoint, payload);
        } else if (method === 'PUT') {
          response = await apiClient.put<T>(endpoint, payload);
        } else if (method === 'PATCH') {
          response = await apiClient.patch<T>(endpoint, payload);
        } else if (method === 'DELETE') {
          response = await apiClient.delete<T>(endpoint);
        }

        // Validate if schema provided
        if (responseSchema) {
          response = responseSchema.parse(response);
        }

        setData(response);
        return response;
      } catch (err) {
        let apiError: ApiError;

        if (err instanceof z.ZodError) {
          apiError = new Error('Response validation failed') as ApiError;
          apiError.code = 'VALIDATION_ERROR';
          (apiError as any).details = err.issues;
        } else {
          apiError = err instanceof Error ? (err as ApiError) : new Error(String(err)) as ApiError;
        }

        setError(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [method, responseSchema]
  );

  return {
    data,
    loading,
    error,
    execute,
  };
}
