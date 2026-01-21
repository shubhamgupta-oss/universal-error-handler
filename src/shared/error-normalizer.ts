/**
 * ERROR NORMALIZER - Converts any error to UniversalError
 * Handles: native errors, validation errors, DB errors, API errors, etc.
 */

import { UniversalError } from './error';
import { ErrorCode } from './error-codes';
import { ErrorContext } from './types';

export class ErrorNormalizer {
  /**
   * Normalize any error to UniversalError
   * Detects error type and maps to appropriate code
   */
  static normalize(
    error: unknown,
    context?: ErrorContext
  ): UniversalError {
    // Already a UniversalError
    if (error instanceof UniversalError) {
      return error;
    }

    // Native Error
    if (error instanceof Error) {
      return this.normalizeNativeError(error, context);
    }

    // String
    if (typeof error === 'string') {
      return new UniversalError(
        ErrorCode.UNKNOWN_ERROR,
        error,
        { context }
      );
    }

    // Object (possible validation or structured error)
    if (typeof error === 'object' && error !== null) {
      return this.normalizeObjectError(error as Record<string, any>, context);
    }

    // Fallback
    return new UniversalError(
      ErrorCode.UNKNOWN_ERROR,
      'An unexpected error occurred',
      { context }
    );
  }

  /**
   * Normalize native JavaScript Error
   */
  private static normalizeNativeError(
    error: Error,
    context?: ErrorContext
  ): UniversalError {
    const name = error.name.toLowerCase();
    const message = error.message || 'An error occurred';

    // Type-specific handling
    if (name === 'syntaxerror') {
      return new UniversalError(ErrorCode.RUNTIME_ERROR, message, { context });
    }

    if (name === 'referenceerror') {
      return new UniversalError(ErrorCode.RUNTIME_ERROR, message, { context });
    }

    if (name === 'typeerror') {
      return new UniversalError(ErrorCode.RUNTIME_ERROR, message, { context });
    }

    if (name === 'rangeerror') {
      return new UniversalError(ErrorCode.RUNTIME_ERROR, message, { context });
    }

    if (name === 'urierror') {
      return new UniversalError(ErrorCode.INVALID_INPUT, message, { context });
    }

    // Network-related errors
    if (message.toLowerCase().includes('timeout')) {
      return new UniversalError(ErrorCode.TIMEOUT_ERROR, message, { context });
    }

    if (message.toLowerCase().includes('network')) {
      return new UniversalError(ErrorCode.NETWORK_ERROR, message, { context });
    }

    if (message.toLowerCase().includes('econnrefused')) {
      return new UniversalError(ErrorCode.CONNECTION_ERROR, message, { context });
    }

    if (message.toLowerCase().includes('enotfound')) {
      return new UniversalError(ErrorCode.DNS_ERROR, message, { context });
    }

    // Default
    return new UniversalError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      { context }
    );
  }

  /**
   * Normalize object errors (Zod, Joi, MongoDB, etc.)
   */
  private static normalizeObjectError(
    error: Record<string, any>,
    context?: ErrorContext
  ): UniversalError {
    // Zod validation error
    if (error.errors && Array.isArray(error.errors)) {
      return new UniversalError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        {
          details: {
            issues: error.errors.map((issue: any) => ({
              path: issue.path,
              message: issue.message,
              code: issue.code,
            })),
          },
          context,
        }
      );
    }

    // Joi validation error
    if (error._original && error.details && Array.isArray(error.details)) {
      return new UniversalError(
        ErrorCode.VALIDATION_ERROR,
        error.message || 'Validation failed',
        {
          details: {
            issues: error.details.map((detail: any) => ({
              path: detail.path,
              message: detail.message,
              type: detail.type,
            })),
          },
          context,
        }
      );
    }

    // MongoDB Error - Duplicate key
    if ((error.code === 11000 || error.code === 11001) && error.keyPattern) {
      const field = Object.keys(error.keyPattern)[0];
      return new UniversalError(
        ErrorCode.DUPLICATE_KEY,
        `${field} already exists`,
        {
          details: { field, value: error.keyValue?.[field] },
          context,
        }
      );
    }

    // MongoDB Error - Cast error
    if (error.name === 'CastError') {
      return new UniversalError(
        ErrorCode.CAST_ERROR,
        `Invalid ${error.kind}: ${error.value}`,
        {
          details: { path: error.path, value: error.value, kind: error.kind },
          context,
        }
      );
    }

    // MongoDB Error - Validation error
    if (error.name === 'ValidationError' && error.errors) {
      return new UniversalError(
        ErrorCode.SCHEMA_VALIDATION_ERROR,
        'Document validation failed',
        {
          details: {
            errors: Object.entries(error.errors).reduce(
              (acc, [key, val]: [string, any]) => {
                acc[key] = val.message;
                return acc;
              },
              {} as Record<string, string>
            ),
          },
          context,
        }
      );
    }

    // HTTP-like error object
    if (error.status || error.statusCode) {
      const code = error.code || ErrorCode.INTERNAL_SERVER_ERROR;
      return new UniversalError(
        code,
        error.message || 'An error occurred',
        {
          details: error.details || error.data,
          context,
        }
      );
    }

    // Generic error message
    const message = error.message || 'An unknown error occurred';
    return new UniversalError(ErrorCode.UNKNOWN_ERROR, message, {
      details: error,
      context,
    });
  }

  /**
   * Check if error is from specific category
   */
  static isNetworkError(error: UniversalError): boolean {
    return [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.DNS_ERROR,
      ErrorCode.CONNECTION_ERROR,
      ErrorCode.OFFLINE,
    ].includes(error.code);
  }

  static isValidationError(error: UniversalError): boolean {
    return [
      ErrorCode.VALIDATION_ERROR,
      ErrorCode.INVALID_INPUT,
      ErrorCode.MISSING_REQUIRED_FIELD,
      ErrorCode.CAST_ERROR,
      ErrorCode.SCHEMA_VALIDATION_ERROR,
    ].includes(error.code);
  }

  static isAuthError(error: UniversalError): boolean {
    return [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.AUTH_FAILED,
      ErrorCode.INVALID_CREDENTIALS,
      ErrorCode.INVALID_TOKEN,
      ErrorCode.TOKEN_EXPIRED,
    ].includes(error.code);
  }

  static isServerError(error: UniversalError): boolean {
    return error.status >= 500;
  }
}
