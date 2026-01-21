import { UniversalError, ErrorCode } from 'fault-handler/shared';
import {
  ValidationErrorFactory,
  DatabaseErrorMapper,
  ExternalAPIErrorHandler,
} from 'fault-handler/backend';

//VALIDATION ERRORS
export function validateEmail(email: string): void {
  if (!email.includes('@')) {
    throw ValidationErrorFactory.invalidInput('Invalid email format');
  }
}

export function validateAge(age: number): void {
  if (age < 18) {
    throw ValidationErrorFactory.invalidInput('Must be 18 or older', {
      age,
    });
  }
}

export function checkRequiredFields(data: any, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw ValidationErrorFactory.missingField(field);
    }
  }
}

//DATABASE ERRORS
export function handleMongoError(error: any): void {
  const mapped = DatabaseErrorMapper.mapMongoError(error);
  throw mapped;
}

export function handleSqlError(error: any): void {
  const mapped = DatabaseErrorMapper.mapSqlError(error);
  throw mapped;
}

//AUTHENTICATION ERRORS
export function throwUnauthorized(): void {
  throw new UniversalError(
    ErrorCode.UNAUTHORIZED,
    'Authentication required'
  );
}

export function throwInvalidToken(): void {
  throw new UniversalError(
    ErrorCode.INVALID_TOKEN,
    'Token is invalid or expired'
  );
}

export function throwInsufficientPermissions(): void {
  throw new UniversalError(
    ErrorCode.INSUFFICIENT_PERMISSIONS,
    'You do not have permission to perform this action'
  );
}

//BUSINESS LOGIC ERRORS
export function throwResourceNotFound(resource: string): void {
  throw new UniversalError(
    ErrorCode.NOT_FOUND,
    `${resource} not found`,
    { details: { resource } }
  );
}

export function throwDuplicateKey(field: string, value: any): void {
  throw new UniversalError(
    ErrorCode.DUPLICATE_KEY,
    `${field} already exists`,
    { details: { field, value } }
  );
}

export function throwConflict(reason: string): void {
  throw new UniversalError(
    ErrorCode.CONFLICT,
    reason,
    { details: { reason } }
  );
}

//EXTERNAL API ERRORS
export function handlePaymentError(error: any): void {
  const mapped = ExternalAPIErrorHandler.handlePaymentError(error);
  throw mapped;
}

export function handleEmailError(error: any): void {
  const mapped = ExternalAPIErrorHandler.handleEmailError(error);
  throw mapped;
}

export function handleThirdPartyError(error: any): void {
  const mapped = ExternalAPIErrorHandler.handleHttpError(error);
  throw mapped;
}
