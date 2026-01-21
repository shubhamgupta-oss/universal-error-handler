/**
 * FRONTEND EXAMPLE - Custom error message configuration
 * Shows how to customize UI messages for your app
 */

import { UIMessageMapper } from 'fault-handler/frontend';
import { ErrorCode } from 'fault-handler/shared';

/**
 * Configure custom error messages for your application
 * Call this during app initialization
 */
export function initializeErrorMessages() {
  UIMessageMapper.registerMessages({
    // Override default messages
    [ErrorCode.INTERNAL_SERVER_ERROR]:
      'Our team has been notified. We\'re working to fix this.',
    [ErrorCode.VALIDATION_ERROR]:
      'Please review the highlighted fields and try again.',
    [ErrorCode.UNAUTHORIZED]:
      'Please log in to continue.',
    [ErrorCode.FORBIDDEN]:
      'You don\'t have access to this feature. Contact support for help.',

    // Add company-specific messages
    [ErrorCode.PAYMENT_ERROR]:
      'Payment failed. Please check your card details and try again. If the problem persists, contact our support team.',
    [ErrorCode.EMAIL_ERROR]:
      'We couldn\'t send an email. Please try again later.',

    // Network-specific messages
    [ErrorCode.TIMEOUT_ERROR]:
      'The request took too long. Please check your connection and try again.',
    [ErrorCode.OFFLINE]:
      'You\'re currently offline. Please reconnect to the internet.',

    // Business logic
    [ErrorCode.DUPLICATE_KEY]:
      'This item already exists in your account.',
    [ErrorCode.NOT_FOUND]:
      'The resource you\'re looking for doesn\'t exist or has been deleted.',
  });
}

/**
 * Example: Log errors to monitoring service (Sentry, Datadog, etc.)
 */
export function setupErrorLogging() {
  // This would be called in your GlobalErrorProvider or error boundary
  if (typeof window !== 'undefined' && 'Sentry' in window) {
    // Example with Sentry
    const Sentry = (window as any).Sentry;

    // Log critical errors
    const originalConsoleError = console.error;
    console.error = function (...args) {
      if (args[0]?.includes?.('CRITICAL')) {
        Sentry.captureException(args[1]);
      }
      originalConsoleError.apply(console, args);
    };
  }
}
