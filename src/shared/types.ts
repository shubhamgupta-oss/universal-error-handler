/**
 * SHARED TYPES - Used by both Backend and Frontend
 */

import { ErrorCode } from './error-codes';

/**
 * Standard Error Response format
 * Returned from Backend API and parsed by Frontend
 */
export interface ErrorResponse {
  success: false;
  message: string; // Technical message, safe to log
  code: ErrorCode;
  details?: Record<string, any>; // Additional context
  traceId?: string; // Request correlation ID
  timestamp?: string; // ISO timestamp
}

/**
 * Success Response wrapper (for context)
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  traceId?: string;
  timestamp?: string;
}

/**
 * Generic API Response
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Serializable error object
 */
export interface SerializedError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  traceId?: string;
  timestamp: string;
  status: number;
}

/**
 * Error context for detailed tracking
 */
export interface ErrorContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  originalError?: Error;
  customData?: Record<string, any>;
}

/**
 * UI Error representation for Frontend
 */
export interface UIError {
  code: ErrorCode;
  technicalMessage: string; // From backend
  uiMessage: string; // Human-friendly message
  details?: Record<string, any>;
  traceId?: string;
}
