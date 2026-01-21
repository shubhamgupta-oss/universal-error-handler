/**
 * UI MESSAGE MAPPER - Convert error codes to human-friendly messages
 * Single source of truth for frontend error messages
 */

import { ErrorCode } from '../shared';

export type UIMessageConfig = Record<ErrorCode, string>;

const DEFAULT_UI_MESSAGES: UIMessageConfig = {
  // Generic
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',

  // Validation
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided. Please try again.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',

  // Authentication
  [ErrorCode.UNAUTHORIZED]: 'You need to sign in to continue.',
  [ErrorCode.AUTH_FAILED]: 'Authentication failed. Please try again.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid username or password. Please try again.',
  [ErrorCode.INVALID_TOKEN]: 'Your session is invalid. Please sign in again.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',

  // Authorization
  [ErrorCode.FORBIDDEN]: 'You don\'t have permission to perform this action.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions. Contact support if you believe this is an error.',

  // Resource
  [ErrorCode.NOT_FOUND]: 'Resource not found. It may have been deleted.',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested resource doesn\'t exist.',

  // Database
  [ErrorCode.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ErrorCode.DUPLICATE_KEY]: 'This item already exists. Please use a different value.',
  [ErrorCode.CAST_ERROR]: 'Invalid data format. Please check your input.',
  [ErrorCode.SCHEMA_VALIDATION_ERROR]: 'Data validation failed. Please check your input.',
  [ErrorCode.CONNECTION_ERROR]: 'Database connection failed. Please try again later.',

  // External APIs
  [ErrorCode.EXTERNAL_API_ERROR]: 'External service error. Please try again later.',
  [ErrorCode.PAYMENT_ERROR]: 'Payment processing failed. Please try again or use a different method.',
  [ErrorCode.EMAIL_ERROR]: 'Email service unavailable. Please try again later.',
  [ErrorCode.THIRD_PARTY_ERROR]: 'Third-party service error. Please try again later.',

  // Network
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ErrorCode.DNS_ERROR]: 'Connection failed. Please check your internet.',
  [ErrorCode.OFFLINE]: 'You\'re offline. Please check your internet connection.',

  // File Operations
  [ErrorCode.FILE_UPLOAD_ERROR]: 'File upload failed. Please try again.',
  [ErrorCode.FILE_SIZE_EXCEEDED]: 'File is too large. Please upload a smaller file.',
  [ErrorCode.INVALID_FILE_TYPE]: 'Invalid file type. Please upload a supported format.',

  // Frontend
  [ErrorCode.CHUNK_LOAD_ERROR]: 'Failed to load application resources. Please refresh the page.',
  [ErrorCode.BUILD_ERROR]: 'Application error. Please refresh the page.',
  [ErrorCode.RUNTIME_ERROR]: 'Application encountered an error. Please refresh the page.',
  [ErrorCode.UI_CRASH]: 'Application crashed. Please refresh the page.',

  // Business Logic
  [ErrorCode.BUSINESS_LOGIC_ERROR]: 'Operation failed. Please check your input and try again.',
  [ErrorCode.OPERATION_FAILED]: 'Operation failed. Please try again.',
  [ErrorCode.CONFLICT]: 'Action conflicts with current state. Please refresh and try again.',
};

export class UIMessageMapper {
  private static customMessages: Partial<UIMessageConfig> = {};

  /**
   * Get user-friendly message for error code
   */
  static getMessage(code: ErrorCode): string {
    return (
      this.customMessages[code] ||
      DEFAULT_UI_MESSAGES[code] ||
      'An unexpected error occurred. Please try again.'
    );
  }

  /**
   * Register custom messages (can override defaults)
   */
  static registerMessages(messages: Partial<UIMessageConfig>) {
    this.customMessages = { ...this.customMessages, ...messages };
  }

  /**
   * Reset to default messages
   */
  static resetToDefaults() {
    this.customMessages = {};
  }

  /**
   * Get all messages (for UI customization)
   */
  static getAllMessages(): UIMessageConfig {
    return { ...DEFAULT_UI_MESSAGES, ...this.customMessages };
  }
}
