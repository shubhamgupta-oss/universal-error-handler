/**
 * USEASYNCDATA HOOK - Handle API calls with automatic error handling
 * Combines loading, error, and data state
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { UIError } from '../shared';
import { APIErrorParser } from './api-error-parser';

interface UseAsyncDataState<T> {
  data: T | null;
  error: UIError | null;
  isLoading: boolean;
}

export interface UseAsyncDataReturn<T> extends UseAsyncDataState<T> {
  execute: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing async data fetching with error handling
 */
export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  options: { autoExecute?: boolean } = {}
): UseAsyncDataReturn<T> {
  const [state, setState] = useState<UseAsyncDataState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState({ data: null, error: null, isLoading: true });
    try {
      const result = await asyncFn();
      if (isMountedRef.current) {
        setState({ data: result, error: null, isLoading: false });
      }
    } catch (error) {
      if (isMountedRef.current) {
        const parsed = APIErrorParser.parseAnyError(error);
        setState({ data: null, error: parsed, isLoading: false });
      }
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (options.autoExecute) {
      execute();
    }
  }, [execute, options.autoExecute]);

  return {
    ...state,
    execute,
    refetch: execute,
    reset,
  };
}
