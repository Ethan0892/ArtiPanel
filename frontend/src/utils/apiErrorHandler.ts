/**
 * Professional API Error Handler
 * Centralized error handling, logging, and user feedback
 */

export interface ApiErrorResponse {
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  success?: boolean;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  getUserMessage(): string {
    const messages: Record<string, string> = {
      'BAD_REQUEST': 'The request contains invalid data. Please check your input.',
      'UNAUTHORIZED': 'Your session has expired. Please log in again.',
      'FORBIDDEN': 'You do not have permission to perform this action.',
      'NOT_FOUND': 'The requested resource was not found.',
      'CONFLICT': 'This action conflicts with an existing resource.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again later.',
      'INTERNAL_ERROR': 'An internal server error occurred. Please try again later.',
      'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable. Please try again later.',
      'VALIDATION_ERROR': 'Please check the highlighted fields and try again.',
    };

    return messages[this.errorCode] || this.message;
  }

  isRetryable(): boolean {
    return [408, 429, 500, 502, 503, 504].includes(this.statusCode);
  }

  isAuthenticationError(): boolean {
    return this.statusCode === 401;
  }

  isAuthorizationError(): boolean {
    return this.statusCode === 403;
  }
}

export class ApiErrorHandler {
  static handle(error: any): ApiError {
    // Network error
    if (!error.response) {
      return new ApiError(
        0,
        'NETWORK_ERROR',
        'Network connection failed. Please check your internet connection.'
      );
    }

    const response = error.response;
    const data = response.data as ApiErrorResponse;

    // Parse error response
    const statusCode = response.status || 500;
    const errorCode = data.error?.code || 'UNKNOWN_ERROR';
    const message = data.error?.message || 'An unknown error occurred';
    const details = data.error?.details;

    // Log error for debugging
    console.error('[API Error]', {
      statusCode,
      errorCode,
      message,
      details,
      url: error.config?.url,
      method: error.config?.method,
    });

    return new ApiError(statusCode, errorCode, message, details);
  }

  static getErrorDetails(error: ApiError): {
    title: string;
    message: string;
    isRetryable: boolean;
    isAuthError: boolean;
  } {
    return {
      title: this.getTitleForErrorCode(error.errorCode),
      message: error.getUserMessage(),
      isRetryable: error.isRetryable(),
      isAuthError: error.isAuthenticationError() || error.isAuthorizationError(),
    };
  }

  private static getTitleForErrorCode(code: string): string {
    const titles: Record<string, string> = {
      'BAD_REQUEST': 'Invalid Request',
      'UNAUTHORIZED': 'Authentication Required',
      'FORBIDDEN': 'Access Denied',
      'NOT_FOUND': 'Not Found',
      'CONFLICT': 'Conflict',
      'RATE_LIMIT_EXCEEDED': 'Rate Limited',
      'INTERNAL_ERROR': 'Server Error',
      'SERVICE_UNAVAILABLE': 'Service Unavailable',
      'VALIDATION_ERROR': 'Validation Failed',
      'NETWORK_ERROR': 'Connection Error',
    };

    return titles[code] || 'Error';
  }

  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        const apiError = error instanceof ApiError ? error : this.handle(error);

        if (!apiError.isRetryable() || attempt === maxAttempts) {
          throw apiError;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Max retry attempts exceeded');
  }
}

/**
 * Validation error formatter for form feedback
 */
export function formatValidationErrors(details?: Record<string, any>): Record<string, string> {
  if (!details) return {};

  const formatted: Record<string, string> = {};

  Object.entries(details).forEach(([key, value]) => {
    if (typeof value === 'string') {
      formatted[key] = value;
    } else if (Array.isArray(value)) {
      formatted[key] = value.join(', ');
    } else if (typeof value === 'object') {
      formatted[key] = JSON.stringify(value);
    }
  });

  return formatted;
}
