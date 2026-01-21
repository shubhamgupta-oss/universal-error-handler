/**
 * DATABASE ERROR MAPPER - Converts DB-specific errors to UniversalError
 * Supports: MongoDB, SQL (Prisma, TypeORM, etc.)
 */

import { UniversalError } from '../shared';
import { ErrorCode } from '../shared';

export class DatabaseErrorMapper {
  /**
   * Map MongoDB errors
   */
  static mapMongoError(error: any): UniversalError {
    const { name, code, message, keyPattern, keyValue } = error;

    // Duplicate key error
    if (code === 11000 || code === 11001) {
      const field = Object.keys(keyPattern || {})[0] || 'field';
      return new UniversalError(
        ErrorCode.DUPLICATE_KEY,
        `${field} already exists`,
        {
          details: {
            field,
            value: keyValue?.[field],
            index: keyPattern,
          },
        }
      );
    }

    // Cast error (invalid ObjectId, type mismatch)
    if (name === 'CastError') {
      return new UniversalError(
        ErrorCode.CAST_ERROR,
        `Invalid ${error.kind || 'value'}: ${error.value}`,
        {
          details: {
            path: error.path,
            value: error.value,
            kind: error.kind,
          },
        }
      );
    }

    // Validation error
    if (name === 'ValidationError') {
      const errors: Record<string, string> = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return new UniversalError(
        ErrorCode.SCHEMA_VALIDATION_ERROR,
        'Document validation failed',
        { details: { errors } }
      );
    }

    // Version error (optimistic locking)
    if (name === 'VersionError') {
      return new UniversalError(
        ErrorCode.CONFLICT,
        'Document was modified. Please reload and try again.',
        { details: { expectedVersion: error.expectedVersion } }
      );
    }

    // Connection error
    if (message.includes('connection') || message.includes('ECONNREFUSED')) {
      return new UniversalError(
        ErrorCode.CONNECTION_ERROR,
        'Database connection failed',
        { details: { originalMessage: message } }
      );
    }

    // Generic database error
    return new UniversalError(
      ErrorCode.DATABASE_ERROR,
      message || 'Database operation failed',
      { details: { errorName: name } }
    );
  }

  /**
   * Map SQL errors (Prisma, TypeORM, etc.)
   */
  static mapSqlError(error: any): UniversalError {
    const code = error.code || '';
    const message = error.message || '';
    const meta = error.meta || {};

    // Prisma errors
    if (error.constructor?.name === 'PrismaClientKnownRequestError') {
      // Unique constraint violation
      if (code === 'P2002') {
        const field = meta.target?.[0] || 'field';
        return new UniversalError(
          ErrorCode.DUPLICATE_KEY,
          `${field} already exists`,
          { details: { field, target: meta.target } }
        );
      }

      // Record not found
      if (code === 'P2025') {
        return new UniversalError(
          ErrorCode.NOT_FOUND,
          'Record not found',
          { details: meta }
        );
      }

      // Foreign key constraint
      if (code === 'P2003') {
        return new UniversalError(
          ErrorCode.CONFLICT,
          'Invalid foreign key reference',
          { details: meta }
        );
      }
    }

    // TypeORM errors
    if (message.includes('duplicate key') || message.includes('UNIQUE')) {
      const match = message.match(/Key \((.*?)\)/);
      const field = match?.[1] || 'field';
      return new UniversalError(
        ErrorCode.DUPLICATE_KEY,
        `${field} already exists`,
        { details: { message } }
      );
    }

    if (message.includes('connection') || message.includes('ECONNREFUSED')) {
      return new UniversalError(
        ErrorCode.CONNECTION_ERROR,
        'Database connection failed',
        { details: { message } }
      );
    }

    // Generic SQL error
    return new UniversalError(
      ErrorCode.DATABASE_ERROR,
      'Database operation failed',
      { details: { code, message } }
    );
  }

  /**
   * Auto-detect and map database error
   */
  static map(error: any): UniversalError {
    // MongoDB
    if (error.name && ['MongoError', 'MongoServerError', 'CastError', 'ValidationError'].includes(error.name)) {
      return this.mapMongoError(error);
    }

    // Check for MongoDB code
    if (error.code && [11000, 11001].includes(error.code)) {
      return this.mapMongoError(error);
    }

    // Prisma
    if (error.constructor?.name?.includes('PrismaClient')) {
      return this.mapSqlError(error);
    }

    // Generic SQL by code pattern
    if (error.code?.match(/^P\d{4}$/)) {
      return this.mapSqlError(error);
    }

    // TypeORM
    if (error.driver || error.driverError) {
      return this.mapSqlError(error);
    }

    // Fallback to generic database error
    return new UniversalError(
      ErrorCode.DATABASE_ERROR,
      error.message || 'Database error',
      { details: { originalError: error.toString() } }
    );
  }
}
