export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function formatSuccessResponse<T>(data: T, pagination?: PaginationMeta): ApiResponse<T> {
  if (pagination) {
    return { data, pagination };
  }
  return { data };
}

export function formatErrorResponse(code: string, message: string, details?: unknown): ApiErrorResponse {
  const response: ApiErrorResponse = {
    error: {
      code,
      message,
    },
  };
  if (details !== undefined) {
    response.error.details = details;
  }
  return response;
}
