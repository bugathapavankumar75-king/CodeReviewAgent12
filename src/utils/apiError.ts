/**
 * Custom API Error Handler
 * Differentiates operational client errors from fatal internal server bugs.
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(statusCode: number, message: string, details?: unknown, isOperational = true) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Invalid request parameters', details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(403, message);
  }

  static notFound(resource = 'Resource', id?: string | number) {
    const msg = id ? `${resource} with ID '${id}' was not found` : `${resource} not found`;
    return new ApiError(404, msg);
  }

  static conflict(message = 'Resource conflict detected', details?: unknown) {
    return new ApiError(409, message, details);
  }

  static unprocessable(message = 'Validation failed', details?: unknown) {
    return new ApiError(422, message, details);
  }

  static internal(message = 'Internal server error occurred', details?: unknown) {
    return new ApiError(500, message, details, false);
  }
}
