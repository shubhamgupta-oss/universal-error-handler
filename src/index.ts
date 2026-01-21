/**
 * MAIN ENTRY POINT - Barrel export for convenience
 * Imports: import {} from 'smart-error-handler'
 */

// Shared (Both Backend & Frontend)
export * from './shared/error-codes';
export * from './shared/types';
export * from './shared/error';
export * from './shared/error-normalizer';

// Backend (Node.js/Express)
export * from './backend/async-handler';
export * from './backend/error-middleware';
export * from './backend/request-id-middleware';
export * from './backend/db-error-mapper';
export * from './backend/validation-error-factory';
export * from './backend/external-api-error-handler';
export * from './backend/process-handler';

// Frontend (React)
export * from './frontend/ui-message-mapper';
export * from './frontend/api-error-parser';
export * from './frontend/use-api-error';
export * from './frontend/use-global-error';
export * from './frontend/error-boundary';
export * from './frontend/use-network-status';
export * from './frontend/use-async-data';
