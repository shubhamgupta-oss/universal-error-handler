/**
 * USEAPIERROR HOOK - React hook for handling API errors
 * Parses, categorizes, and manages error state
 */

import { useState, useCallback } from 'react';
import { UIError } from '../shared';
import { APIErrorParser } from './api-error-parser';

export interface UseAPIErrorReturn {
  error: UIError | null;
  isLoading: boolean;
  handleError: (error: any) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  isValidationError: boolean;
  isAuthError: boolean;
  isNetworkError: boolean;
  isServerError: boolean;
}

/**
 * Hook for handling API errors with categorization
 */
export function useAPIError(): UseAPIErrorReturn {
  const [error, setError] = useState<UIError | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleError = useCallback((error: any) => {
    const parsed = APIErrorParser.parseAnyError(error);
    setError(parsed);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    setLoading,
    isValidationError: error ? APIErrorParser.isValidationError(error) : false,
    isAuthError: error ? APIErrorParser.isAuthError(error) : false,
    isNetworkError: error ? APIErrorParser.isNetworkError(error) : false,
    isServerError: error ? APIErrorParser.isServerError(error) : false,
  };
}
