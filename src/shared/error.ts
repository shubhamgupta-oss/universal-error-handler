/**
 * UNIVERSAL ERROR CLASS - Single source of truth for error structure
 * Extends Error and provides normalized error shape across FE/BE
 */

import { ErrorCode, HTTP_STATUS_CODES } from './error-codes';
import { ErrorContext } from './types';

const SENSITIVE_DETAIL_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'set-cookie',
  'apiKey',
  'accessToken',
  'refreshToken',
];

export class UniversalError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, any>;
  public readonly context?: ErrorContext;
  public readonly traceId?: string;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, any>;
      context?: ErrorContext;
      traceId?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'UniversalError';
    this.code = code;
    this.status = HTTP_STATUS_CODES[code];
    this.details = options?.details;
    this.context = options?.context;
    this.traceId = options?.traceId;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, UniversalError.prototype);

    // Capture stack trace (Node.js V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error to API response format
   */
  toResponse() {
    return {
      success: false as const,
      message: this.message,
      code: this.code,
      details: UniversalError.sanitizeDetails(this.details),
      traceId: this.traceId,
      timestamp: this.timestamp,
    };
  }

  /**
   * Serialize error to JSON (safe, no stack trace)
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      details: UniversalError.sanitizeDetails(this.details),
      traceId: this.traceId,
      timestamp: this.timestamp,
    };
  }

  private static sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
    if (!details || typeof details !== 'object') {
      return details;
    }

    return this.sanitizeValue(details) as Record<string, any>;
  }

  private static sanitizeValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      const isSensitive = SENSITIVE_DETAIL_KEYS.some(
        (sensitiveKey) => key.toLowerCase() === sensitiveKey.toLowerCase()
      );

      sanitized[key] = isSensitive ? '[REDACTED]' : this.sanitizeValue(nestedValue);
    }

    return sanitized;
  }
}

/**
 * Type guard for UniversalError
 */
export function isUniversalError(error: unknown): error is UniversalError {
  return error instanceof UniversalError;
}
