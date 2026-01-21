/**
 * API ERROR PARSER - Parse and extract errors from API responses
 */

import { ErrorResponse, UIError } from '../shared';
import { ErrorCode } from '../shared';
import { UIMessageMapper } from './ui-message-mapper';

export class APIErrorParser {
  /**
   * Check if response is an error
   */
  static isErrorResponse(response: any): response is ErrorResponse {
    return (
      response &&
      typeof response === 'object' &&
      response.success === false &&
      response.code &&
      response.message
    );
  }

  /**
   * Parse API error response to UIError
   */
  static parseError(errorResponse: ErrorResponse): UIError {
    return {
      code: errorResponse.code,
      technicalMessage: errorResponse.message,
      uiMessage: UIMessageMapper.getMessage(errorResponse.code),
      details: errorResponse.details,
      traceId: errorResponse.traceId,
    };
  }

  /**
   * Parse any error (from fetch/axios) to UIError
   */
  static parseAnyError(error: any): UIError {
    // Already a UIError
    if (this.isUIError(error)) {
      return error;
    }

    // API error response
    if (error?.response?.data && this.isErrorResponse(error.response.data)) {
      return this.parseError(error.response.data);
    }

    // Network timeout
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return {
        code: ErrorCode.TIMEOUT_ERROR,
        technicalMessage: 'Request timeout',
        uiMessage: UIMessageMapper.getMessage(ErrorCode.TIMEOUT_ERROR),
      };
    }

    // Network error
    if (!navigator.onLine || error?.message?.includes('network')) {
      return {
        code: ErrorCode.OFFLINE,
        technicalMessage: 'Network error',
        uiMessage: UIMessageMapper.getMessage(ErrorCode.OFFLINE),
      };
    }

    // Generic error
    const message = error?.message || 'An unexpected error occurred';
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      technicalMessage: message,
      uiMessage: UIMessageMapper.getMessage(ErrorCode.UNKNOWN_ERROR),
      details: error,
    };
  }

  /**
   * Type guard for UIError
   */
  private static isUIError(error: any): error is UIError {
    return (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'technicalMessage' in error &&
      'uiMessage' in error
    );
  }

  /**
   * Extract validation issues from error details
   */
  static getValidationIssues(error: UIError): Array<{ path: string; message: string }> {
    const issues = error.details?.issues;
    if (Array.isArray(issues)) {
      return issues;
    }
    return [];
  }

  /**
   * Check if error is validation error
   */
  static isValidationError(error: UIError): boolean {
    return error.code === ErrorCode.VALIDATION_ERROR;
  }

  /**
   * Check if error is auth error
   */
  static isAuthError(error: UIError): boolean {
    return [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.AUTH_FAILED,
      ErrorCode.INVALID_CREDENTIALS,
      ErrorCode.INVALID_TOKEN,
      ErrorCode.TOKEN_EXPIRED,
    ].includes(error.code);
  }

  /**
   * Check if error is network error
   */
  static isNetworkError(error: UIError): boolean {
    return [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.OFFLINE,
      ErrorCode.DNS_ERROR,
    ].includes(error.code);
  }

  /**
   * Check if error is server error
   */
  static isServerError(error: UIError): boolean {
    return [
      ErrorCode.INTERNAL_SERVER_ERROR,
      ErrorCode.DATABASE_ERROR,
      ErrorCode.EXTERNAL_API_ERROR,
    ].includes(error.code);
  }
}
