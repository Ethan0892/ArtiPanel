/**
 * Logging Utility
 * 
 * Centralized logging with different levels and optional backend logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {
    this.isDevelopment = typeof import.meta !== 'undefined' ? (import.meta as any).env?.DEV : process.env.NODE_ENV === 'development';
  }

  private createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    if (data instanceof Error) {
      entry.stack = data.stack;
    }

    return entry;
  }

  private write(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const logFn = this.getConsoleMethod(entry.level);

    if (this.isDevelopment) {
      logFn(`${prefix} ${entry.message}`, entry.data || '');
    }

    // In production, you could send logs to backend
    // this.sendToBackend(entry);
  }

  private getConsoleMethod(level: LogLevel) {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      default:
        return console.log;
    }
  }

  debug(message: string, data?: any) {
    this.write(this.createEntry('debug', message, data));
  }

  info(message: string, data?: any) {
    this.write(this.createEntry('info', message, data));
  }

  warn(message: string, data?: any) {
    this.write(this.createEntry('warn', message, data));
  }

  error(message: string, data?: any) {
    this.write(this.createEntry('error', message, data));
  }

  /**
   * Log API request
   */
  logRequest(method: string, url: string, payload?: any) {
    this.debug(`[API] ${method} ${url}`, payload);
  }

  /**
   * Log API response
   */
  logResponse(method: string, url: string, status: number, data?: any) {
    this.debug(`[API] ${method} ${url} - ${status}`, data);
  }

  /**
   * Log API error
   */
  logError(method: string, url: string, error: Error) {
    this.error(`[API] ${method} ${url} - ${error.message}`, error);
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
