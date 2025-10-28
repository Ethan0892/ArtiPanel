import { Response } from 'express';

/**
 * Standardized API Response Format
 * Ensures consistent response structure across all endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version: string;
  };
}

export class ResponseFormatter {
  /**
   * Success response with data
   */
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    message?: string
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '0.1.0-alpha.1',
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * List response with pagination metadata
   */
  static list<T>(
    res: Response,
    data: T[],
    total: number,
    page: number = 1,
    limit: number = 20,
    statusCode: number = 200
  ): Response {
    const response: any = {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '0.1.0-alpha.1',
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Error response
   */
  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details?: Record<string, any>
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '0.1.0-alpha.1',
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Created response (201)
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, 201, message);
  }

  /**
   * No content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Bad request error
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    details?: Record<string, any>
  ): Response {
    return this.error(res, 'BAD_REQUEST', message, 400, details);
  }

  /**
   * Unauthorized error
   */
  static unauthorized(
    res: Response,
    message: string = 'Authentication required'
  ): Response {
    return this.error(res, 'UNAUTHORIZED', message, 401);
  }

  /**
   * Forbidden error
   */
  static forbidden(
    res: Response,
    message: string = 'Access denied'
  ): Response {
    return this.error(res, 'FORBIDDEN', message, 403);
  }

  /**
   * Not found error
   */
  static notFound(
    res: Response,
    resource: string = 'Resource'
  ): Response {
    return this.error(res, 'NOT_FOUND', `${resource} not found`, 404);
  }

  /**
   * Conflict error
   */
  static conflict(
    res: Response,
    message: string = 'Conflict'
  ): Response {
    return this.error(res, 'CONFLICT', message, 409);
  }

  /**
   * Internal server error
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error',
    details?: Record<string, any>
  ): Response {
    return this.error(res, 'INTERNAL_ERROR', message, 500, details);
  }

  /**
   * Service unavailable error
   */
  static serviceUnavailable(
    res: Response,
    message: string = 'Service temporarily unavailable'
  ): Response {
    return this.error(res, 'SERVICE_UNAVAILABLE', message, 503);
  }
}
