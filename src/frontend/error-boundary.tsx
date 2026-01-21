/**
 * ERROR BOUNDARY - React Error Boundary for catching runtime errors
 * Class component implementation (required for error boundaries)
 */

import React, {
  ReactNode,
  Component,
  ErrorInfo,
} from 'react';
import { UIError } from '../shared';
import { ErrorCode } from '../shared';
import { UIMessageMapper } from './ui-message-mapper';

export interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: UIError) => void;
  fallback?: ReactNode | ((error: UIError) => ReactNode);
  level?: 'route' | 'component' | 'global';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: UIError | null;
}

/**
 * Error Boundary wrapper - for catching React errors
 * Class component (required for React error boundaries)
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: {
        code: ErrorCode.UI_CRASH,
        technicalMessage: error.message,
        uiMessage: UIMessageMapper.getMessage(ErrorCode.UI_CRASH),
        details: {
          componentStack: error.stack,
        },
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError && this.state.error) {
      this.props.onError(this.state.error);
    }
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error);
      }
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Hook-based error detection for async errors
 */
export function useErrorHandler(onError?: (error: UIError) => void) {
  const [error, setError] = React.useState<UIError | null>(null);
  const errorHandlerRef = React.useRef(onError);

  React.useEffect(() => {
    errorHandlerRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const uiError: UIError = {
        code: ErrorCode.RUNTIME_ERROR,
        technicalMessage: event.error?.message || 'Unknown error',
        uiMessage: UIMessageMapper.getMessage(ErrorCode.RUNTIME_ERROR),
      };
      setError(uiError);
      errorHandlerRef.current?.(uiError);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleRejection = React.useCallback((event: PromiseRejectionEvent) => {
    const uiError: UIError = {
      code: ErrorCode.RUNTIME_ERROR,
      technicalMessage: event.reason?.message || 'Unhandled promise rejection',
      uiMessage: UIMessageMapper.getMessage(ErrorCode.RUNTIME_ERROR),
    };
    setError(uiError);
    errorHandlerRef.current?.(uiError);
  }, []);

  React.useEffect(() => {
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, [handleRejection]);

  return { error, setError };
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ error }: { error: UIError }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '500px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>
          Oops, something went wrong
        </h1>
        <p style={{ color: '#666', margin: '0 0 20px 0' }}>
          {error.uiMessage}
        </p>
        {error.traceId && (
          <p style={{ fontSize: '12px', color: '#999', margin: '20px 0 0 0' }}>
            Error ID: {error.traceId}
          </p>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
