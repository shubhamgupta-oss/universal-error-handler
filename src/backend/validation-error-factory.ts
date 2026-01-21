/**
 * VALIDATION ERROR FACTORY - Create standardized validation errors
 * Works with Zod, Joi, or custom validators
 */

import { UniversalError, ErrorCode } from '../shared';

export class ValidationErrorFactory {
  /**
   * Create from Zod errors
   */
  static fromZodError(error: any): UniversalError {
    const issues = error.errors?.map((err: any) => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    })) || [];

    return new UniversalError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      {
        details: { issues },
      }
    );
  }

  /**
   * Create from Joi errors
   */
  static fromJoiError(error: any): UniversalError {
    const details = error.details?.map((d: any) => ({
      path: d.path.join('.'),
      message: d.message,
      type: d.type,
    })) || [];

    return new UniversalError(
      ErrorCode.VALIDATION_ERROR,
      error.message || 'Validation failed',
      { details: { issues: details } }
    );
  }

  /**
   * Create from custom field errors
   */
  static fromFieldErrors(errors: Record<string, string>): UniversalError {
    const issues = Object.entries(errors).map(([field, message]) => ({
      path: field,
      message,
    }));

    return new UniversalError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      { details: { issues } }
    );
  }

  /**
   * Create for missing required field
   */
  static missingField(fieldName: string): UniversalError {
    return new UniversalError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      `${fieldName} is required`,
      { details: { field: fieldName } }
    );
  }

  /**
   * Create for invalid input
   */
  static invalidInput(message: string, details?: Record<string, any>): UniversalError {
    return new UniversalError(
      ErrorCode.INVALID_INPUT,
      message,
      { details }
    );
  }
}
