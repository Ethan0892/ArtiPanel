/**
 * API Client Service
 * Centralized HTTP client for all backend API calls
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Auth API endpoints
   */
  auth = {
    login: (email: string, password: string) =>
      this.post('/auth/login', { email, password }),
    register: (username: string, email: string, password: string, fullName: string) =>
      this.post('/auth/register', { username, email, password, fullName }),
    logout: () => this.post('/auth/logout'),
    me: () => this.get('/auth/me'),
  };

  /**
   * User API endpoints
   */
  users = {
    list: () => this.get('/users'),
    get: (id: string) => this.get(`/users/${id}`),
    update: (id: string, data: any) => this.put(`/users/${id}`, data),
    delete: (id: string) => this.delete(`/users/${id}`),
  };

  /**
   * Servers API endpoints
   */
  servers = {
    list: (userId?: string) =>
      this.get(`/servers${userId ? `?userId=${userId}` : ''}`),
    get: (id: string) =>
      this.get(`/servers/${id}`),
    create: (data: any) =>
      this.post('/servers', data),
    update: (id: string, data: any) =>
      this.put(`/servers/${id}`, data),
    delete: (id: string) =>
      this.delete(`/servers/${id}`),
    start: (id: string) =>
      this.post(`/servers/${id}/start`, {}),
    stop: (id: string) =>
      this.post(`/servers/${id}/stop`, {}),
    restart: (id: string) =>
      this.post(`/servers/${id}/restart`, {}),
    getStats: (id: string) =>
      this.get(`/servers/${id}/stats`),
  };

  /**
   * Nodes API endpoints
   */
  nodes = {
    list: () =>
      this.get('/nodes'),
    get: (id: string) =>
      this.get(`/nodes/${id}`),
    create: (data: any) =>
      this.post('/nodes', data),
    update: (id: string, data: any) =>
      this.put(`/nodes/${id}`, data),
    delete: (id: string) =>
      this.delete(`/nodes/${id}`),
    getStatus: (id: string) =>
      this.get(`/nodes/${id}/status`),
    getAllocations: (id: string) =>
      this.get(`/nodes/${id}/allocations`),
  };

  /**
   * Game Servers API endpoints
   */
  gameServers = {
    list: (userId?: string) =>
      this.get(`/gaming/servers${userId ? `?userId=${userId}` : ''}`),
    get: (id: string) =>
      this.get(`/gaming/servers/${id}`),
    create: (data: any) =>
      this.post('/gaming/servers', data),
    update: (id: string, data: any) =>
      this.put(`/gaming/servers/${id}`, data),
    delete: (id: string) =>
      this.delete(`/gaming/servers/${id}`),
    deploy: (data: any) =>
      this.post('/gaming/deploy', data),
    getPlayers: (id: string) =>
      this.get(`/gaming/servers/${id}/players`),
  };

  /**
   * Storage API endpoints
   */
  storage = {
    list: (serverId: string) =>
      this.get(`/storage/servers/${serverId}/files`),
    get: (serverId: string, path: string) =>
      this.get(`/storage/servers/${serverId}/files?path=${path}`),
    upload: (serverId: string, formData: FormData) =>
      this.post(`/storage/servers/${serverId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    download: (serverId: string, path: string) =>
      this.get(`/storage/servers/${serverId}/download?path=${path}`),
    delete: (serverId: string, path: string) =>
      this.delete(`/storage/servers/${serverId}/files?path=${path}`),
    createFolder: (serverId: string, path: string) =>
      this.post(`/storage/servers/${serverId}/folders`, { path }),
  };

  /**
   * Monitoring API endpoints
   */
  monitoring = {
    getStats: (serverId: string) =>
      this.get(`/monitoring/servers/${serverId}/stats`),
    getHistory: (serverId: string, hours: number = 24) =>
      this.get(`/monitoring/servers/${serverId}/history?hours=${hours}`),
    getAlerts: (serverId?: string) =>
      this.get(`/monitoring/alerts${serverId ? `?serverId=${serverId}` : ''}`),
    acknowledge: (alertId: string) =>
      this.post(`/monitoring/alerts/${alertId}/acknowledge`, {}),
  };

  /**
   * Remote Access API endpoints
   */
  remoteAccess = {
    console: (serverId: string) =>
      this.get(`/remote/servers/${serverId}/console`),
    sendCommand: (serverId: string, command: string) =>
      this.post(`/remote/servers/${serverId}/command`, { command }),
    vnc: (serverId: string) =>
      this.get(`/remote/servers/${serverId}/vnc`),
    ssh: (serverId: string) =>
      this.get(`/remote/servers/${serverId}/ssh`),
  };
}

export const apiClient = new APIClient();
export default apiClient;
