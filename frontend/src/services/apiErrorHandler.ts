export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
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
}
