/**
 * REQUEST ID MIDDLEWARE - Adds unique trace ID to every request
 * Enables error correlation across logs
 */

import { Request, Response, NextFunction } from 'express';

function generateUuid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use existing ID or generate new one
  const requestId = req.headers['x-request-id'] as string || generateUuid();
  (req as any).id = requestId;

  // Add to response headers
  res.setHeader('X-Request-ID', requestId);

  // Add to response locals for logging
  res.locals.requestId = requestId;

  next();
}
