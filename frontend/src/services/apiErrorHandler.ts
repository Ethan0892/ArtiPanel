export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isAuthenticationError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get errorCode(): string {
    return this.data?.code || 'UNKNOWN_ERROR';
  }

  get statusCode(): number {
    return this.status;
  }
}

export class ApiErrorHandler {
  static handle(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.response) {
      return new ApiError(
        error.response.status,
        error.response.data?.message || error.message,
        error.response.data
      );
    }

    if (error.request) {
      return new ApiError(0, 'No response from server', error);
    }

    return new ApiError(0, error.message || 'Unknown error', error);
  }

  static async retryWithBackoff(
    fn: () => Promise<any>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<any> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}
