/**
 * EXPRESS ERROR MIDDLEWARE - Centralized error handling for all errors
 * Should be the LAST middleware in Express app
 */

import { Request, Response, NextFunction } from 'express';
import { UniversalError, ErrorNormalizer, isUniversalError, ErrorCode } from '../shared';

export interface ErrorMiddlewareOptions {
  logger?: (error: UniversalError, req: Request) => void;
  isDevelopment?: boolean;
}

/**
 * Express error middleware
 * Catches all errors and returns standardized response
 */
export function errorMiddleware(options: ErrorMiddlewareOptions = {}) {
  const { logger, isDevelopment = false } = options;

  return (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Generate trace ID if not exists
    function generateTraceId(): string {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    const traceId = (req as any).id || generateTraceId();
    (req as any).id = traceId;

    // Normalize error
    const normalized = isUniversalError(error)
      ? error
      : ErrorNormalizer.normalize(error, {
          userId: (req as any).userId,
          endpoint: req.path,
          method: req.method,
          requestId: traceId,
        });

    // Add trace ID if not already present
    if (!normalized.traceId) {
      (normalized as any).traceId = traceId;
    }

    // Log error (sensitive - don't log stack traces in production)
    if (logger) {
      logger(normalized, req);
    } else {
      console.error(
        `[${normalized.code}] ${normalized.message}`,
        isDevelopment ? normalized : { traceId, code: normalized.code }
      );
    }

    // Send response
    res.status(normalized.status).json(normalized.toResponse());
  };
}
