/**
 * FRONTEND EXAMPLE - React component with comprehensive error handling
 * Shows hooks usage and error state management
 */

import React, { useState } from 'react';
import {
  useAPIError,
  useGlobalError,
  ErrorBoundary,
  useNetworkStatus,
  useAsyncData,
  APIErrorParser,
  UIMessageMapper,
} from 'universal-error-handler/frontend';
import { ErrorCode, UIError } from 'universal-error-handler/shared';

//USER CREATION FORM

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { error, isLoading, handleError, clearError, isValidationError } =
    useAPIError();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        handleError(data);
        return;
      }

      // Success
      setFormData({ name: '', email: '', age: '' });
      onSuccess?.();
    } catch (error) {
      handleError(error);
    }
  };

  // Display validation issues
  const validationIssues = error
    ? APIErrorParser.getValidationIssues(error)
    : [];

  return (
    <div style={{ maxWidth: '400px', margin: '20px' }}>
      <h2>Create User</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Name:
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={{ display: 'block', marginTop: '5px', width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Email:
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{ display: 'block', marginTop: '5px', width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Age:
            <input
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              style={{ display: 'block', marginTop: '5px', width: '100%' }}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Creating...' : 'Create User'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#991b1b',
          }}
        >
          <strong>Error:</strong> {error.uiMessage}
          {error.traceId && (
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              ID: {error.traceId}
            </div>
          )}

          {/* Show validation issues */}
          {isValidationError && validationIssues.length > 0 && (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {validationIssues.map((issue: any, i: number) => (
                <li key={i}>
                  {issue.path}: {issue.message}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={clearError}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

//DATA LOADING WITH HOOK

interface User {
  id: string;
  name: string;
  email: string;
}

export function UsersList() {
  const {
    data: users,
    error,
    isLoading,
    refetch,
  } = useAsyncData<User[]>(
    async () => {
      const response = await fetch('http://localhost:3000/users');
      if (!response.ok) {
        throw await response.json();
      }
      return response.json();
    },
    { autoExecute: true }
  );

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return (
      <div style={{ color: '#dc2626' }}>
        <p>Failed to load users: {error.uiMessage}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Users ({users?.length || 0})</h2>
      <ul>
        {users?.map((user: any) => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

//GLOBAL ERROR HANDLING

export function AppWithGlobalError() {
  const { error, clearError } = useGlobalError();
  const { isOnline, offlineMessage } = useNetworkStatus();

  return (
    <div>
      {/* Offline indicator */}
      {!isOnline && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#fbbf24',
            color: '#78350f',
            textAlign: 'center',
          }}
        >
          {offlineMessage}
        </div>
      )}

      {/* Global error toast */}
      {error && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '15px',
            borderRadius: '4px',
            zIndex: 9999,
            maxWidth: '400px',
          }}
        >
          <strong>Error:</strong> {error.uiMessage}
          <button
            onClick={clearError}
            style={{
              marginLeft: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <CreateUserForm />
      <UsersList />
    </div>
  );
}

//PP ROOT WITH ERROR BOUNDARY

export function App() {
  return (
    <ErrorBoundary
      level="global"
      fallback={({ uiMessage, traceId }: UIError) => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Application Error</h1>
          <p>{uiMessage}</p>
          {traceId && <p>Error ID: {traceId}</p>}
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )}
    >
      <AppWithGlobalError />
    </ErrorBoundary>
  );
}
