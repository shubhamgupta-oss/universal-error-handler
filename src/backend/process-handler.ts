/**
 * PROCESS-LEVEL ERROR HANDLERS
 * Catches unhandled exceptions and promise rejections
 */

import { UniversalError, ErrorNormalizer, ErrorCode } from '../shared';

export interface ProcessErrorHandlerOptions {
  logger?: (error: UniversalError) => void;
  isDevelopment?: boolean;
  gracefulShutdown?: () => Promise<void>;
}

export class ProcessErrorHandler {
  private static options: ProcessErrorHandlerOptions = {};

  /**
   * Initialize process-level error handlers
   * Call this once in your app's main file
   */
  static initialize(options: ProcessErrorHandlerOptions = {}) {
    this.options = options;

    /**
     * Handle uncaught exceptions (sync errors not caught)
     */
    process.on('uncaughtException', (error: Error) => {
      const normalized = ErrorNormalizer.normalize(error, {
        endpoint: 'PROCESS_UNCAUGHT_EXCEPTION',
      });

      this.handleFatalError(normalized, 'Uncaught Exception');
    });

    /**
     * Handle unhandled promise rejections
     */
    process.on('unhandledRejection', (reason: unknown) => {
      const normalized = ErrorNormalizer.normalize(reason, {
        endpoint: 'PROCESS_UNHANDLED_REJECTION',
      });

      this.handleFatalError(normalized, 'Unhandled Promise Rejection');
    });

    /**
     * Handle warnings
     */
    process.on('warning', (warning: Error) => {
      console.warn('Node.js Warning:', warning);
    });
  }

  /**
   * Handle fatal errors and graceful shutdown
   */
  private static handleFatalError(error: UniversalError, context: string) {
    // Log
    if (this.options.logger) {
      this.options.logger(error);
    } else {
      console.error(`[${context}] ${error.code}: ${error.message}`);
      if (this.options.isDevelopment) {
        console.error(error);
      }
    }

    // Graceful shutdown
    this.shutdown();
  }

  /**
   * Graceful shutdown sequence
   */
  private static async shutdown() {
    console.log('Initiating graceful shutdown...');

    try {
      if (this.options.gracefulShutdown) {
        await this.options.gracefulShutdown();
      }
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
    }

    process.exit(1);
  }
}
