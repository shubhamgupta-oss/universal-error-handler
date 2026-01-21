/**
 * EXTERNAL API ERROR HANDLER - Handle third-party API errors
 * Supports: Payment gateways, email services, etc.
 */

import { UniversalError, ErrorCode } from '../shared';

export class ExternalAPIErrorHandler {
  /**
   * Handle payment API errors (Stripe, PayPal, RazorPay, etc.)
   */
  static handlePaymentError(error: any): UniversalError {
    const message = error.message || 'Payment processing failed';
    const errorType = error.type || '';

    // Common payment error codes
    if (errorType.includes('card_error')) {
      return new UniversalError(
        ErrorCode.PAYMENT_ERROR,
        error.message || 'Card payment failed',
        {
          details: {
            code: error.code,
            decline_code: error.decline_code,
            charge: error.charge,
          },
        }
      );
    }

    if (errorType.includes('rate_limit_error')) {
      return new UniversalError(
        ErrorCode.TIMEOUT_ERROR,
        'Payment service temporarily unavailable. Please try again.',
        { details: { error: error.code } }
      );
    }

    if (errorType.includes('authentication_error')) {
      return new UniversalError(
        ErrorCode.EXTERNAL_API_ERROR,
        'Payment service authentication failed',
        { details: { error: error.code } }
      );
    }

    if (errorType.includes('invalid_request_error')) {
      return new UniversalError(
        ErrorCode.INVALID_INPUT,
        error.message || 'Invalid payment information',
        { details: { param: error.param } }
      );
    }

    return new UniversalError(
      ErrorCode.PAYMENT_ERROR,
      message,
      { details: error }
    );
  }

  /**
   * Handle email service errors (SendGrid, Mailgun, AWS SES, etc.)
   */
  static handleEmailError(error: any): UniversalError {
    const message = error.message || 'Email service failed';

    if (error.code === 401 || message.includes('authentication')) {
      return new UniversalError(
        ErrorCode.EMAIL_ERROR,
        'Email service authentication failed',
        { details: { service: error.service } }
      );
    }

    if (error.code === 429 || message.includes('rate limit')) {
      return new UniversalError(
        ErrorCode.TIMEOUT_ERROR,
        'Email service rate limited. Please try again later.',
        { details: { retryAfter: error.retryAfter } }
      );
    }

    if (error.status === 400 || message.includes('invalid')) {
      return new UniversalError(
        ErrorCode.INVALID_INPUT,
        'Invalid email configuration',
        { details: error }
      );
    }

    return new UniversalError(
      ErrorCode.EMAIL_ERROR,
      message,
      { details: error }
    );
  }

  /**
   * Handle generic HTTP API errors
   */
  static handleHttpError(error: any): UniversalError {
    const status = error.status || error.statusCode || 500;
    const message = error.message || 'External service error';

    // Timeout
    if (status === 408 || error.code === 'ETIMEDOUT') {
      return new UniversalError(
        ErrorCode.TIMEOUT_ERROR,
        'External service request timed out',
        { details: { url: error.url } }
      );
    }

    // Bad request
    if (status === 400) {
      return new UniversalError(
        ErrorCode.INVALID_INPUT,
        message,
        { details: error.details }
      );
    }

    // Unauthorized
    if (status === 401 || status === 403) {
      return new UniversalError(
        ErrorCode.EXTERNAL_API_ERROR,
        'Service authentication failed',
        { details: { service: error.service } }
      );
    }

    // Not found
    if (status === 404) {
      return new UniversalError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'External resource not found',
        { details: { url: error.url } }
      );
    }

    // Rate limited
    if (status === 429 || status === 503) {
      return new UniversalError(
        ErrorCode.TIMEOUT_ERROR,
        'Service temporarily unavailable. Please try again later.',
        { details: { retryAfter: error.retryAfter } }
      );
    }

    // Server error
    if (status >= 500) {
      return new UniversalError(
        ErrorCode.EXTERNAL_API_ERROR,
        'External service error. Please try again later.',
        { details: { status, service: error.service } }
      );
    }

    return new UniversalError(
      ErrorCode.EXTERNAL_API_ERROR,
      message,
      { details: error }
    );
  }
}
