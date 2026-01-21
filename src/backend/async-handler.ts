/**
 * ASYNC HANDLER - Wraps route handlers to catch all errors
 * Eliminates try-catch boilerplate in Express routes
 */

import { Request, Response, NextFunction } from 'express';
import { UniversalError, ErrorNormalizer } from '../shared';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps async route handlers and automatically handles errors
 */
export function asyncHandler(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch((error) => {
      // Generate request ID if not exists
      function generateTraceId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      const traceId = (req as any).id || generateTraceId();
      (req as any).id = traceId;

      // Normalize error
      const normalized = ErrorNormalizer.normalize(error, {
        userId: (req as any).userId,
        endpoint: req.path,
        method: req.method,
        requestId: traceId,
      });

      // Pass to error middleware
      next(normalized);
    });
  };
}
