import { ERROR_CODES, type ErrorCode } from "./errorCodes";

export type ErrorDetail = { field: string; message: string };

export class AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: unknown;
  isOperational = true;

  constructor(
    message: string,
    statusCode = 500,
    code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string, code: ErrorCode = ERROR_CODES.VALIDATION_FAILED, details?: unknown) {
    return new AppError(message, 400, code, details);
  }
  static unauthorized(message = "Not authenticated", code: ErrorCode = ERROR_CODES.AUTH_TOKEN_INVALID) {
    return new AppError(message, 401, code);
  }
  static forbidden(message = "Forbidden", code: ErrorCode = ERROR_CODES.AUTH_FORBIDDEN) {
    return new AppError(message, 403, code);
  }
  static notFound(message = "Resource not found", code: ErrorCode = ERROR_CODES.RESOURCE_NOT_FOUND) {
    return new AppError(message, 404, code);
  }
  static conflict(message: string, code: ErrorCode = ERROR_CODES.RESOURCE_CONFLICT) {
    return new AppError(message, 409, code);
  }
  static unprocessable(message: string, code: ErrorCode = ERROR_CODES.VALIDATION_FAILED, details?: unknown) {
    return new AppError(message, 422, code, details);
  }
}
