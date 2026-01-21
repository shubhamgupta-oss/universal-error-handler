/**
 * USEGLOBALERROR HOOK - Global error state management with Context
 * Handles app-wide errors, crashes, and recovery
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  FC,
} from 'react';
import { UIError } from '../shared';
import { APIErrorParser } from './api-error-parser';
import { ErrorCode } from '../shared';

interface GlobalErrorContextType {
  error: UIError | null;
  handleError: (error: any) => void;
  clearError: () => void;
  hasError: boolean;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(
  undefined
);

/**
 * Provider component for global error handling
 */
export const GlobalErrorProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [error, setError] = useState<UIError | null>(null);

  const handleError = useCallback((error: any) => {
    const parsed = APIErrorParser.parseAnyError(error);
    setError(parsed);

    // Log to monitoring service in production
    if (parsed.code === ErrorCode.UI_CRASH || parsed.code === ErrorCode.RUNTIME_ERROR) {
      console.error('[CRITICAL ERROR]', parsed);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: GlobalErrorContextType = {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };

  return (
    <GlobalErrorContext.Provider value={value}>
      {children}
    </GlobalErrorContext.Provider>
  );
};

/**
 * Hook to access global error state
 */
export function useGlobalError(): GlobalErrorContextType {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error(
      'useGlobalError must be used within GlobalErrorProvider'
    );
  }
  return context;
}
