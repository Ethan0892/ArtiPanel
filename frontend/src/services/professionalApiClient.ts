/**
 * Professional API Client
 * Centralized HTTP client with error handling, retries, and logging
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiErrorHandler, ApiError } from './apiErrorHandler';

export interface RequestConfig extends AxiosRequestConfig {
  retryable?: boolean;
  maxRetries?: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor(baseURL: string = 'http://localhost:4000') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': process.env.REACT_APP_VERSION || '0.1.0-alpha.1',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(baseURL?: string): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(baseURL);
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authorization token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.debug('[API Request]', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
          });
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.debug('[API Response]', {
            status: response.status,
            url: response.config.url,
            duration: response.headers['x-response-time'],
          });
        }

        return response;
      },
      (error) => this.handleError(error)
    );
  }

  private handleError(error: AxiosError): Promise<never> {
    const apiError = ApiErrorHandler.handle(error);

    // Handle authentication errors
    if (apiError.isAuthenticationError()) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    // Log error
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        code: apiError.errorCode,
        status: apiError.statusCode,
        message: apiError.message,
      });
    }

    return Promise.reject(apiError);
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // GET request
  async get<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      if (config?.retryable) {
        return ApiErrorHandler.retryWithBackoff(
          () => this.client.get<T>(url, config),
          config.maxRetries || 3
        );
      }
      throw error;
    }
  }

  // POST request
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      if (config?.retryable) {
        return ApiErrorHandler.retryWithBackoff(
          () => this.client.post<T>(url, data, config),
          config.maxRetries || 3
        );
      }
      throw error;
    }
  }

  // PUT request
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // PATCH request
  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload
  async uploadFile<T = any>(
    url: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Batch requests
  async batch<T = any>(
    requests: Array<{ method: string; url: string; data?: any }>
  ): Promise<T[]> {
    const promises = requests.map((req) => {
      switch (req.method.toUpperCase()) {
        case 'GET':
          return this.get(req.url);
        case 'POST':
          return this.post(req.url, req.data);
        case 'PUT':
          return this.put(req.url, req.data);
        case 'DELETE':
          return this.delete(req.url);
        default:
          return Promise.reject(new Error(`Unknown method: ${req.method}`));
      }
    });

    return Promise.all(promises);
  }

  // Set authorization token
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  }

  // Clear authorization token
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }

  // Get raw axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export default ApiClient.getInstance();
