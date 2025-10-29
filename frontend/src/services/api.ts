/**
 * API Service Layer
 * 
 * Centralized API client with error handling, interceptors, and type safety
 */

import { logger } from '../utils/logger';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export interface ApiError extends Error {
  code: string;
  status?: number;
  response?: any;
}

export class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private requestTimeout: number = 30000; // 30 seconds

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Make an API request with error handling and interceptors
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    options: {
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || this.requestTimeout
    );

    logger.logRequest(method, endpoint, options.body);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        logger.logError(method, endpoint, new Error(`HTTP ${response.status}`));
        throw this.createApiError(response.status, errorData);
      }

      // Parse and validate response
      const data = await response.json();
      logger.logResponse(method, endpoint, response.status, data);
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle network errors
      if (error instanceof TypeError) {
        logger.error(`Network error: ${error.message}`);
        const apiError: ApiError = new Error('Network error - unable to reach server') as ApiError;
        apiError.code = 'NETWORK_ERROR';
        apiError.status = 0;
        throw apiError;
      }

      // Handle abort/timeout errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        logger.warn(`Request timeout for ${endpoint}`);
        const apiError: ApiError = new Error('Request timeout') as ApiError;
        apiError.code = 'REQUEST_TIMEOUT';
        apiError.status = 408;
        throw apiError;
      }

      // Re-throw API errors
      if (error instanceof Error && (error as any).code) {
        throw error;
      }

      // Handle unknown errors
      const apiError: ApiError = new Error('Unknown error occurred') as ApiError;
      apiError.code = 'UNKNOWN_ERROR';
      throw apiError;
    }
  }

  /**
   * Parse error response from server
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return {
        code: 'INVALID_RESPONSE',
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  }

  /**
   * Create a typed API error
   */
  private createApiError(status: number, errorData: any): ApiError {
    let code = 'UNKNOWN_ERROR';
    let message = 'An error occurred';

    if (errorData?.error?.code) {
      code = errorData.error.code;
      message = errorData.error.message || message;
    } else if (errorData?.message) {
      message = errorData.message;
    }

    // Map HTTP status codes to error codes
    if (!code.includes('_')) {
      switch (status) {
        case 400:
          code = 'BAD_REQUEST';
          break;
        case 401:
          code = 'UNAUTHORIZED';
          break;
        case 403:
          code = 'FORBIDDEN';
          break;
        case 404:
          code = 'NOT_FOUND';
          break;
        case 409:
          code = 'CONFLICT';
          break;
        case 422:
          code = 'VALIDATION_ERROR';
          break;
        case 429:
          code = 'RATE_LIMITED';
          break;
        case 500:
          code = 'SERVER_ERROR';
          break;
        case 503:
          code = 'SERVICE_UNAVAILABLE';
          break;
        default:
          code = 'HTTP_ERROR';
      }
    }

    const error: ApiError = new Error(message) as ApiError;
    error.code = code;
    error.status = status;
    error.response = errorData;
    return error;
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: any): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  async post<T>(endpoint: string, body?: any, options?: any): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  async put<T>(endpoint: string, body?: any, options?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  async patch<T>(endpoint: string, body?: any, options?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  async delete<T>(endpoint: string, options?: any): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }
}

// Create singleton instance
export const apiClient = new ApiService('/api');
