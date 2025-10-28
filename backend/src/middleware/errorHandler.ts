import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Comprehensive error handler middleware for production use
 * Provides detailed error tracking, logging, and standardized error responses
 */

export class ApplicationError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorCode?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';

  // Log error with full context
  logger.error(`Error ID: ${errorId}`, {
    statusCode,
    message,
    errorCode: err.errorCode,
    path: _req.path,
    method: _req.method,
    ip: _req.ip,
    userAgent: _req.get('user-agent'),
    stack: err.stack,
    details: err.details,
  });

  // Send standardized error response
  res.status(statusCode).json({
    error: {
      id: errorId,
      code: err.errorCode || 'INTERNAL_ERROR',
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.details,
      }),
    },
  });
};

/**
 * Async handler wrapper to catch promise rejections
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 */
export const handleValidationError = (errors: Record<string, string>) => {
  throw new ApplicationError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
};

/**
 * Authentication error handler
 */
export const handleAuthenticationError = (message: string = 'Authentication required') => {
  throw new ApplicationError(401, message, 'AUTHENTICATION_ERROR');
};

/**
 * Authorization error handler
 */
export const handleAuthorizationError = (message: string = 'Access denied') => {
  throw new ApplicationError(403, message, 'AUTHORIZATION_ERROR');
};

/**
 * Not found error handler
 */
export const handleNotFoundError = (resource: string) => {
  throw new ApplicationError(404, `${resource} not found`, 'RESOURCE_NOT_FOUND');
};

/**
 * Conflict error handler
 */
export const handleConflictError = (message: string) => {
  throw new ApplicationError(409, message, 'CONFLICT');
};

/**
 * Rate limit error handler
 */
export const handleRateLimitError = () => {
  throw new ApplicationError(429, 'Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested endpoint does not exist',
      path: _req.path,
      method: _req.method,
      status: 404,
      timestamp: new Date().toISOString(),
    },
  });
};
