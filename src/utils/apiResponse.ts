/**
 * Standardized API Response Helper
 * Ensures uniform JSON payloads across all controllers.
 */

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  layerTrace?: string[];
  executionTimeMs?: number;
  [key: string]: unknown;
}

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta?: ApiResponseMeta;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(
    res: { status: (code: number) => { json: (payload: unknown) => void } },
    data: T,
    message = 'Request completed successfully',
    statusCode = 200,
    meta?: ApiResponseMeta
  ) {
    const payload: StandardApiResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(
    res: { status: (code: number) => { json: (payload: unknown) => void } },
    data: T,
    message = 'Resource created successfully',
    meta?: ApiResponseMeta
  ) {
    return this.success(res, data, message, 201, meta);
  }

  static noContent(res: { status: (code: number) => { send: () => void } }) {
    return res.status(204).send();
  }

  static paginated<T>(
    res: { status: (code: number) => { json: (payload: unknown) => void } },
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Data retrieved successfully',
    extraMeta?: Record<string, unknown>
  ) {
    const totalPages = Math.ceil(total / limit) || 1;
    return this.success(res, data, message, 200, {
      page,
      limit,
      total,
      totalPages,
      ...extraMeta,
    });
  }
}
