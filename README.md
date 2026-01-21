> **Production-grade, universal error-handling system for Node.js/Express + React**

A single, standardized npm package that provides comprehensive error handling across your full stack. Built with TypeScript, industry-proven patterns, and real-world error scenarios.

**What This Solves:**
- ❌ No more scattered error handling logic between frontend and backend
- ❌ No more translating technical errors into user-friendly messages manually
- ❌ No more inconsistent error response formats
- ✅ One standardized error format & contract for your entire application

## 🎯 Key Features

- ✅ **Single Shared Core** - One error contract used by both backend & frontend
- ✅ **Automatic Error Normalization** - Converts any error type to standard format
- ✅ **Backend Adapters** - Express middleware, asyncHandler, DB mappers, validation factories
- ✅ **Frontend Hooks** - React hooks for error management, recovery, offline detection, and data fetching
- ✅ **Type-Safe** - 100% TypeScript with strict mode for all utilities
- ✅ **Production-Ready** - Process-level handlers, graceful shutdown, request correlation
- ✅ **Human-Friendly Messages** - Automatic translation of technical errors into user-friendly copy
- ✅ **Comprehensive Coverage** - 40+ error codes for different scenarios (validation, DB, auth, payments, etc.)
- ✅ **Zero Configuration** - Works out-of-the-box with sensible defaults
- ✅ **Customizable** - Override messages, add custom error codes, extend behavior

## ⚙️ How It Works (The Flow)

### The Problem It Solves

```
WITHOUT smart-error-handler:
┌────────────────┐         ┌──────────────────┐
│ Backend Error  │────────→│ Raw JSON Response│
└────────────────┘         └──────────────────┘
                                    ↓
                           "Invalid syntax"  (Too technical!)
                           "Cast to ObjectId failed"
                           → All inconsistent formats & messaging


WITH smart-error-handler:
┌──────────────────────────┐
│ Backend Error (any type) │
└────────────┬─────────────┘
             ↓
    ┌────────────────────┐
    │ ErrorNormalizer    │ ← Converts to UniversalError
    └────────────────────┘
             ↓
    ┌──────────────────────────────────┐
    │ UniversalError                   │ ← Standard format
    │ {code, message, details, traceId}│   - code: "DUPLICATE_KEY"
    │                                  │   - message: "Email exists"
    └────────────┬─────────────────────┘   - traceId: "uuid"
                 ↓
    ┌────────────────────┐
    │ HTTP Response      │
    └────────────┬───────┘
                 ↓
    ┌────────────────────────────┐
    │ Frontend APIErrorParser    │ ← Receives structured error
    └────────────┬───────────────┘
                 ↓
    ┌────────────────────────────┐
    │ UIMessageMapper            │ ← Maps to friendly message:
    │ "DUPLICATE_KEY" →          │   "This email is already registered"
    └────────────┬───────────────┘
                 ↓
            Show to user! ✅
```

### Step-by-Step Example

**1. Backend throws standardized error:**
```typescript
// In your Express route handler
app.post('/users', asyncHandler(async (req, res) => {
  const existing = await User.findByEmail(req.body.email);
  if (existing) {
    throw new UniversalError(
      ErrorCode.DUPLICATE_KEY,
      "User with this email already exists"
    );
  }
  const user = await User.create(req.body);
  res.json({ success: true, data: user });
}));
```

**2. Error middleware catches and sends standardized response:**
```json
{
  "success": false,
  "code": "DUPLICATE_KEY",
  "message": "User with this email already exists",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-21T10:30:00.000Z"
}
```

**3. Frontend receives API response:**
```typescript
const res = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ email: 'john@example.com' })
});
const data = await res.json();
// data = { success: false, code: "DUPLICATE_KEY", ... }
```

**4. Frontend parses and converts to UI message:**
```typescript
const { error, handleError } = useAPIError();
handleError(data);

// error is now:
{
  code: "DUPLICATE_KEY",
  technicalMessage: "User with this email already exists",
  uiMessage: "This email is already registered.",
  traceId: "550e8400-e29b-41d4-a716-446655440000"
}
```

**5. Display to user:**
```tsx
{error && (
  <div className="error-message">
    {error.uiMessage} {/* Shows: "This email is already registered." ✅ */}
  </div>
)}
```

## 📦 Architecture

```
smart-error-handler/
├── src/
│   ├── shared/           # ← Used by Backend AND Frontend
│   │   ├── error-codes.ts       # Single source of truth for error codes
│   │   ├── types.ts             # Shared interfaces
│   │   ├── error.ts             # UniversalError class
│   │   └── error-normalizer.ts  # Converts any error to UniversalError
│   │
│   ├── backend/          # ← Node.js / Express only
│   │   ├── async-handler.ts           # Eliminates try-catch boilerplate
│   │   ├── error-middleware.ts        # Express error middleware
│   │   ├── db-error-mapper.ts         # MongoDB + SQL error mapping
│   │   ├── process-handler.ts         # Unhandled rejections, exceptions
│   │   ├── request-id-middleware.ts   # Request correlation
│   │   ├── validation-error-factory.ts # Zod, Joi, custom validators
│   │   └── external-api-error-handler.ts # Payment, email, 3rd-party APIs
│   │
│   └── frontend/         # ← React only
│       ├── ui-message-mapper.ts      # Error code → human-friendly message
│       ├── api-error-parser.ts       # Parse API responses
│       ├── use-api-error.ts          # React hook for API errors
│       ├── use-global-error.ts       # Global error context
│       ├── error-boundary.tsx        # Error boundary component
│       ├── use-network-status.ts     # Online/offline detection
│       └── use-async-data.ts         # Data fetching with error handling
│
└── examples/
    ├── backend/
    │   ├── express-api.ts      # Complete Express example
    │   └── error-patterns.ts   # How to throw errors
    └── frontend/
        ├── components.tsx      # React components with error handling
        └── error-config.ts     # Error message customization
```

## 📋 What's Included & How to Use Each Part

### Shared Core (Used by Both Frontend & Backend)

| Component | Purpose | How to Use |
|-----------|---------|-----------|
| **ErrorCode** (enum) | 40+ predefined error codes for different scenarios | `throw new UniversalError(ErrorCode.DUPLICATE_KEY, message)` |
| **UniversalError** (class) | Standardized error class with code, message, status, trace ID | Use instead of native `Error` class |
| **ErrorNormalizer** | Converts ANY error type (native JS, Zod, Joi, DB errors) to UniversalError | Auto-used in backend middleware; can be used manually |
| **error-codes.ts** | Maps error codes to HTTP status codes (400, 401, 403, 404, 500, etc.) | Reference for understanding which status each error returns |

### Backend Utilities (Node.js/Express)

| Utility | What It Does | How to Use | When to Use |
|---------|--------------|-----------|-----------|
| **requestIdMiddleware** | Adds unique trace ID to every request for correlation | `app.use(requestIdMiddleware)` (first middleware) | Every Express app (helps with debugging) |
| **asyncHandler** | Wraps route handlers to automatically catch errors | `app.post('/route', asyncHandler(async (req, res) => {...}))` | All route handlers (eliminates try-catch) |
| **errorMiddleware** | Express middleware that catches errors and sends standardized response | `app.use(errorMiddleware())` (last middleware) | All Express apps (required for error handling) |
| **ValidationErrorFactory** | Creates validation errors from Zod, Joi, or custom validators | `throw ValidationErrorFactory.fromZodError(zodError)` | Form validation, input validation |
| **DatabaseErrorMapper** | Converts MongoDB/SQL errors to UniversalError | `throw DatabaseErrorMapper.map(mongoError)` | Database operations that might fail |
| **ExternalAPIErrorHandler** | Handles errors from payment, email, and 3rd-party APIs | `throw ExternalAPIErrorHandler.handlePaymentError(stripeError)` | Payment processing, email sending, external API calls |
| **ProcessErrorHandler** | Global error handler for uncaught exceptions and rejections | `ProcessErrorHandler.initialize({...})` (once at startup) | Production safety net |

### Frontend Utilities (React)

| Hook/Component | What It Does | How to Use | When to Use |
|----------------|--------------|-----------|-----------|
| **useAPIError** | Manages error state for single API calls | `const {error, handleError} = useAPIError()` | When handling individual API requests |
| **useAsyncData** | Manages data fetching with built-in error handling | `const {data, error, isLoading} = useAsyncData(() => fetch(...), {autoExecute: true})` | Loading data from APIs with auto-fetch |
| **useGlobalError** | App-wide error state via Context API | `<GlobalErrorProvider><MyApp/></GlobalErrorProvider>` | Sharing errors across entire app |
| **ErrorBoundary** | React component that catches rendering errors | `<ErrorBoundary><App/></ErrorBoundary>` | Catching React component crashes |
| **useNetworkStatus** | Detects online/offline status | `const {isOnline} = useNetworkStatus()` | Showing offline banners |
| **APIErrorParser** | Parses API responses and converts to structured errors | `const error = APIErrorParser.parseError(response)` | Parsing API error responses |
| **UIMessageMapper** | Maps error codes to human-friendly UI messages | `UIMessageMapper.getMessage(ErrorCode.DUPLICATE_KEY)` | Converting codes to user messages |

## 🎯 Complete Step-by-Step Setup Guide

### Backend Setup (5 steps)

**Step 1: Install and import**
```typescript
import express from 'express';
import {
  requestIdMiddleware,
  ProcessErrorHandler,
  asyncHandler,
  errorMiddleware,
} from 'smart-error-handler/backend';
import { UniversalError, ErrorCode } from 'smart-error-handler/shared';
```

**Step 2: Add request ID middleware (FIRST)**
```typescript
const app = express();
app.use(express.json());
app.use(requestIdMiddleware); // ← Must be first to track all requests
```

**Step 3: Initialize process-level error handling (ONCE)**
```typescript
ProcessErrorHandler.initialize({
  isDevelopment: process.env.NODE_ENV !== 'production',
  logger: (error, req) => {
    // Optional: Send to monitoring service like Sentry, DataDog
    console.error(`[${error.code}] ${req.method} ${req.path}`);
  },
  gracefulShutdown: async () => {
    // Optional: Close DB connections, cleanup
    console.log('Shutting down gracefully...');
  },
});
```

**Step 4: Use asyncHandler for all routes**
```typescript
app.post('/api/users', asyncHandler(async (req, res) => {
  // NO try-catch needed! asyncHandler catches everything
  
  if (!req.body.email) {
    throw new UniversalError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      'Email is required'
    );
  }

  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
}));

app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new UniversalError(ErrorCode.NOT_FOUND, 'User not found');
  }
  res.json({ success: true, data: user });
}));
```

**Step 5: Add error middleware (LAST)**
```typescript
// Must be AFTER all routes
app.use(errorMiddleware({
  isDevelopment: process.env.NODE_ENV !== 'production',
}));

app.listen(3000, () => console.log('Server running on 3000'));
```

### Frontend Setup (4 steps)

**Step 1: Install and import**
```typescript
import React from 'react';
import {
  ErrorBoundary,
  GlobalErrorProvider,
  useAPIError,
} from 'smart-error-handler/frontend';
```

**Step 2: Wrap app with error providers (REQUIRED)**
```typescript
// In your root App component or main.tsx/index.tsx
function App() {
  return (
    <ErrorBoundary
      level="global"
      onError={(error) => {
        console.error('Caught error:', error.uiMessage);
      }}
    >
      <GlobalErrorProvider>
        <YourAppContent />
      </GlobalErrorProvider>
    </ErrorBoundary>
  );
}
```

**Step 3: Optional - Customize error messages**
```typescript
import { UIMessageMapper } from 'smart-error-handler/frontend';
import { ErrorCode } from 'smart-error-handler/shared';

// Do this once at app startup
UIMessageMapper.registerMessages({
  [ErrorCode.DUPLICATE_KEY]: 'This already exists in the system.',
  [ErrorCode.UNAUTHORIZED]: 'Please sign in to continue.',
  [ErrorCode.PAYMENT_ERROR]: 'Payment failed. Try another card.',
});
```

**Step 4: Use hooks in components**
```typescript
function LoginForm() {
  const { error, handleError, clearError, isLoading } = useAPIError();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Clear previous errors

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        handleError(data); // ← Converts to UI-friendly error
        return;
      }

      // Success - redirect
      navigate('/dashboard');
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error.uiMessage}
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

##  Detailed Usage

### Backend: Validation Errors

```typescript
import { ValidationErrorFactory } from 'smart-error-handler/backend';

// Zod
app.post('/users', asyncHandler(async (req, res) => {
  const result = createUserSchema.safeParse(req.body);
  if (!result.success) {
    throw ValidationErrorFactory.fromZodError(result.error);
  }
  // ...
}));

// Joi
try {
  await joiSchema.validateAsync(data);
} catch (error) {
  throw ValidationErrorFactory.fromJoiError(error);
}

// Custom fields
throw ValidationErrorFactory.fromFieldErrors({
  email: 'Invalid email format',
  age: 'Must be at least 18',
});

// Missing field
throw ValidationErrorFactory.missingField('password');

// Invalid input
throw ValidationErrorFactory.invalidInput('Age must be positive');
```

### Backend: Database Errors

```typescript
import { DatabaseErrorMapper } from 'smart-error-handler/backend';

// MongoDB
try {
  await User.create(userData);
} catch (error) {
  throw DatabaseErrorMapper.mapMongoError(error);
}

// SQL (Prisma, TypeORM, etc.)
try {
  await prisma.user.create({ data });
} catch (error) {
  throw DatabaseErrorMapper.mapSqlError(error);
}

// Auto-detect
try {
  // ... db operation
} catch (error) {
  throw DatabaseErrorMapper.map(error);
}
```

### Backend: External API Errors

```typescript
import { ExternalAPIErrorHandler } from 'smart-error-handler/backend';

// Payment errors
try {
  await stripe.charges.create({ ... });
} catch (error) {
  throw ExternalAPIErrorHandler.handlePaymentError(error);
}

// Email errors
try {
  await sendgrid.send({ ... });
} catch (error) {
  throw ExternalAPIErrorHandler.handleEmailError(error);
}

// Generic HTTP errors
try {
  await fetch('https://api.service.com/data').then(r => r.json());
} catch (error) {
  throw ExternalAPIErrorHandler.handleHttpError(error);
}
```

### Backend: Process-Level Handlers

```typescript
import { ProcessErrorHandler } from 'smart-error-handler/backend';

// Initialize ONCE in your app
ProcessErrorHandler.initialize({
  isDevelopment: process.env.NODE_ENV !== 'production',
  logger: (error) => {
    // Send to monitoring service (Sentry, DataDog, etc.)
    monitoringService.captureException(error);
  },
  gracefulShutdown: async () => {
    // Close DB connections, cleanup, etc.
    await db.disconnect();
    await redis.quit();
  },
});

// Automatically handles:
// - Uncaught exceptions
// - Unhandled promise rejections
// - Graceful shutdown
```

### Frontend: React Hooks

```typescript
// useAPIError - Single API call error handling
function LoginForm() {
  const { error, handleError, clearError } = useAPIError();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', { ... });
      const data = await res.json();
      if (!data.success) {
        handleError(data);
        return;
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <>
      {error && <ErrorToast message={error.uiMessage} />}
      <form onSubmit={handleSubmit}>...</form>
    </>
  );
}

// useAsyncData - Fetch with automatic error handling
function UserList() {
  const {
    data,
    error,
    isLoading,
    refetch,
    reset,
  } = useAsyncData(
    () => fetch('/api/users').then(r => r.json()),
    { autoExecute: true }
  );

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  return <div>{data.map(...)}</div>;
}

// useNetworkStatus - Offline detection
function App() {
  const { isOnline, offlineMessage } = useNetworkStatus();

  return (
    <>
      {!isOnline && <OfflineBanner message={offlineMessage} />}
      <MainContent />
    </>
  );
}

// useGlobalError - App-wide error state
function RootApp() {
  return (
    <GlobalErrorProvider>
      <ErrorToastContainer /> {/* Reads from useGlobalError */}
      <MyApp />
    </GlobalErrorProvider>
  );
}

// useErrorHandler - Catch runtime errors
function SafeComponent() {
  const { error } = useErrorHandler((error) => {
    // Send to monitoring service
    sentry.captureException(error);
  });

  if (error) return <Fallback />;
  return <MyContent />;
}
```

### Frontend: Error Boundary

```typescript
// Catches React rendering errors
<ErrorBoundary
  level="global"
  fallback={({ uiMessage, traceId }) => (
    <div>
      <h1>{uiMessage}</h1>
      <p>Error ID: {traceId}</p>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  )}
  onError={(error) => {
    // Send to monitoring service
    sentry.captureException(error);
  }}
>
  <App />
</ErrorBoundary>
```



## � Error Codes Reference

The package includes 40+ error codes covering all common scenarios:

### Generic Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `UNKNOWN_ERROR` | 500 | Error type can't be determined |

### Validation Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `VALIDATION_ERROR` | 400 | Input validation fails (from Zod, Joi, etc.) |
| `INVALID_INPUT` | 400 | User input is malformed or invalid |
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing from request |

### Authentication & Authorization
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `AUTH_FAILED` | 401 | Authentication attempt failed |
| `INVALID_CREDENTIALS` | 401 | Wrong username/password |
| `INVALID_TOKEN` | 401 | JWT or auth token is invalid |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `FORBIDDEN` | 403 | User authenticated but not authorized |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |

### Resource Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `RESOURCE_NOT_FOUND` | 404 | Specific resource not found |

### Database Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `DATABASE_ERROR` | 500 | Generic database error |
| `DUPLICATE_KEY` | 409 | Unique constraint violation (duplicate email, etc.) |
| `CAST_ERROR` | 400 | Invalid type for database field |
| `SCHEMA_VALIDATION_ERROR` | 400 | Data doesn't match database schema |
| `CONNECTION_ERROR` | 500 | Can't connect to database |

### External API Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `EXTERNAL_API_ERROR` | 502 | Generic 3rd-party API error |
| `PAYMENT_ERROR` | 502 | Payment processing failed |
| `EMAIL_ERROR` | 500 | Email sending failed |
| `THIRD_PARTY_ERROR` | 502 | Other 3rd-party service error |

### Network Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `NETWORK_ERROR` | 503 | Network is down or unreachable |
| `TIMEOUT_ERROR` | 504 | Request timeout |
| `DNS_ERROR` | 503 | DNS resolution failed |
| `OFFLINE` | N/A | Frontend is offline |

### File Operation Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `FILE_UPLOAD_ERROR` | 400 | File upload failed |
| `FILE_SIZE_EXCEEDED` | 413 | File is too large |
| `INVALID_FILE_TYPE` | 400 | File type not allowed |

### Frontend-Specific Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `CHUNK_LOAD_ERROR` | N/A | Failed to load JavaScript chunk |
| `BUILD_ERROR` | N/A | Frontend build failed |
| `RUNTIME_ERROR` | N/A | Runtime JavaScript error |
| `UI_CRASH` | N/A | React component crashed |

### Business Logic Errors
| Code | HTTP Status | Use When |
|------|-------------|----------|
| `BUSINESS_LOGIC_ERROR` | 400 | Business rule violated |
| `OPERATION_FAILED` | 400 | Operation couldn't complete |
| `CONFLICT` | 409 | State conflict (e.g., order already shipped) |

## 🔧 Advanced Usage

### Adding Custom Error Codes

**Step 1: Extend the enum in `src/shared/error-codes.ts`:**
```typescript
export enum ErrorCode {
  // ... existing codes
  CUSTOM_PAYMENT_ISSUE = 'CUSTOM_PAYMENT_ISSUE',
  INVENTORY_LOW = 'INVENTORY_LOW',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
}
```

**Step 2: Map to HTTP status in `HTTP_STATUS_CODES`:**
```typescript
export const HTTP_STATUS_CODES: Record<ErrorCode, number> = {
  // ... existing mappings
  [ErrorCode.CUSTOM_PAYMENT_ISSUE]: 402, // 402 = Payment Required
  [ErrorCode.INVENTORY_LOW]: 409, // 409 = Conflict
  [ErrorCode.SUBSCRIPTION_EXPIRED]: 403, // 403 = Forbidden
};
```

**Step 3: Use in backend:**
```typescript
throw new UniversalError(
  ErrorCode.INVENTORY_LOW,
  'Only 5 items left in stock',
  { details: { required: 10, available: 5 } }
);
```

**Step 4: Customize frontend message (optional):**
```typescript
UIMessageMapper.registerMessages({
  [ErrorCode.CUSTOM_PAYMENT_ISSUE]: 'Payment was declined. Try another card.',
  [ErrorCode.INVENTORY_LOW]: 'Not enough items in stock.',
  [ErrorCode.SUBSCRIPTION_EXPIRED]: 'Your subscription has expired.',
});
```

### Integration with Monitoring Services (Sentry, DataDog, etc.)

**Send all errors to Sentry:**
```typescript
import * as Sentry from "@sentry/node";

// Backend
ProcessErrorHandler.initialize({
  logger: (error, req) => {
    // Send to Sentry with context
    Sentry.captureException(error, {
      tags: {
        errorCode: error.code,
      },
      contexts: {
        request: {
          method: req.method,
          path: req.path,
          traceId: (req as any).id,
        },
      },
    });
  },
});
```

**Frontend error tracking:**
```typescript
import * as Sentry from "@sentry/react";

<ErrorBoundary
  onError={(error) => {
    Sentry.captureException(error, {
      tags: { errorCode: error.code },
    });
  }}
>
  <GlobalErrorProvider>
    <App />
  </GlobalErrorProvider>
</ErrorBoundary>
```

### Manual Error Context Tracking

Use `traceId` to correlate errors across frontend and backend:

**Backend:**
```typescript
const traceId = (req as any).id; // From requestIdMiddleware
const error = new UniversalError(ErrorCode.PAYMENT_ERROR, "Charge failed", {
  traceId, // Include for correlation
  details: { amount: 99.99, provider: 'stripe' }
});
```

**Frontend:**
```typescript
if (error) {
  // error.traceId is available
  console.error(`Error (${error.traceId}): ${error.uiMessage}`);
  
  // Send to support or logging service with traceId
  await sendToSupport({
    message: error.uiMessage,
    traceId: error.traceId,
    timestamp: error.timestamp,
  });
}
```

## �🔐 Production Best Practices

### Backend

1. **Never expose stack traces to clients:**
   ```typescript
   // ✅ Good
   throw new UniversalError(
     ErrorCode.DATABASE_ERROR,
     'Database operation failed'
   );

   // ❌ Bad
   throw new UniversalError(
     ErrorCode.DATABASE_ERROR,
     error.stack // Exposes internal details!
   );
   ```

2. **Use request IDs for correlation:**
   ```typescript
   const traceId = (req as any).id; // From requestIdMiddleware
   // Include in logs, monitoring, etc.
   ```

3. **Log sensitive info server-side only:**
   ```typescript
   errorMiddleware({
     logger: (error, req) => {
       // Log full error details only on backend
       if (process.env.NODE_ENV === 'development') {
         console.error(error); // Include stack trace
       } else {
         console.error(error.code, error.message); // Safe logging
       }
     },
   });
   ```

4. **Handle process-level errors:**
   ```typescript
   ProcessErrorHandler.initialize({
     gracefulShutdown: async () => {
       // Cleanup and exit cleanly
     },
   });
   ```

### Frontend

1. **Never show raw API responses:**
   ```typescript
   // ✅ Good
   const uiError = APIErrorParser.parseError(apiResponse);
   showToast(uiError.uiMessage);

   // ❌ Bad
   showToast(apiResponse.message); // May be too technical
   ```

2. **Use error boundaries:**
   ```typescript
   <ErrorBoundary>
     <App /> {/* Catches all rendering errors */}
   </ErrorBoundary>
   ```

3. **Monitor critical errors:**
   ```typescript
   <GlobalErrorProvider>
     <ErrorTracker /> {/* Send errors to Sentry, etc. */}
     <App />
   </GlobalErrorProvider>
   ```

4. **Handle offline gracefully:**
   ```typescript
   const { isOnline } = useNetworkStatus();
   if (!isOnline) {
     return <OfflineScreen />;
   }
   ```

## 📊 Error Coverage Checklist

### Backend Errors Handled ✓
- [x] Sync errors (SyntaxError, ReferenceError, etc.)
- [x] Async/Promise errors
- [x] Express route errors
- [x] Validation (Zod, Joi, custom)
- [x] Authentication (401)
- [x] Authorization (403)
- [x] Not found (404)
- [x] Database (MongoDB duplicate, cast, schema)
- [x] Database (SQL errors, Prisma, TypeORM)
- [x] Payment API errors
- [x] Email service errors
- [x] 3rd-party API errors
- [x] Timeout errors
- [x] Network/DNS errors
- [x] File upload errors
- [x] Business logic errors
- [x] Unhandled promise rejections
- [x] Uncaught exceptions (process-level)

### Frontend Errors Handled ✓
- [x] API response errors
- [x] Network offline
- [x] Request timeout
- [x] Runtime JS errors (useErrorHandler)
- [x] React rendering errors (ErrorBoundary)
- [x] Promise rejections
- [x] Form validation errors
- [x] Global app crashes (ErrorBoundary)
- [x] Graceful fallback UI
- [x] Error code → UI message mapping

## 🎨 Example: Full-Stack Feature

### Scenario: User Registration

**Backend:**
```typescript
app.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    // Validation
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      throw ValidationErrorFactory.fromZodError(result.error);
    }

    // Check duplicate
    try {
      const existing = await User.findByEmail(result.data.email);
      if (existing) {
        throw new UniversalError(
          ErrorCode.DUPLICATE_KEY,
          'Email already registered'
        );
      }

      // Create user
      const user = await User.create(result.data);

      // Send email (with error handling)
      try {
        await emailService.sendWelcome(user);
      } catch (error) {
        throw ExternalAPIErrorHandler.handleEmailError(error);
      }

      res.status(201).json({ success: true, data: { id: user.id } });
    } catch (error) {
      throw DatabaseErrorMapper.map(error);
    }
  })
);
```

**Frontend:**
```typescript
function RegisterForm() {
  const {
    error,
    isLoading,
    handleError,
    clearError,
    isValidationError,
  } = useAPIError();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        handleError(data);
        return;
      }

      // Success - redirect
      navigate('/login');
    } catch (error) {
      handleError(error);
    }
  };

  const validationIssues = error
    ? APIErrorParser.getValidationIssues(error)
    : [];

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />

      {error && isValidationError && (
        <ul style={{ color: 'red' }}>
          {validationIssues.map((issue) => (
            <li key={issue.path}>{issue.message}</li>
          ))}
        </ul>
      )}

      {error && !isValidationError && (
        <div style={{ color: 'red' }}>{error.uiMessage}</div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

**Result:**
- User enters invalid email → Validation error with field-level messages
- User enters duplicate email → "This email is already registered."
- Email service fails → "Email service unavailable. Try again later."
- Network timeout → "Request timed out. Please check your connection."
- Success → Redirected to login

## 🧪 Testing

```typescript
// Backend error testing
import { UniversalError, ErrorCode } from 'smart-error-handler/shared';

it('should throw duplicate key error', () => {
  expect(() => {
    throw new UniversalError(
      ErrorCode.DUPLICATE_KEY,
      'Email exists'
    );
  }).toThrow(UniversalError);
});

// Frontend error parsing testing
import { APIErrorParser } from 'smart-error-handler/frontend';

it('should parse API error correctly', () => {
  const response = {
    success: false,
    code: 'DUPLICATE_KEY',
    message: 'Email exists',
  };

  const uiError = APIErrorParser.parseError(response);
  expect(uiError.uiMessage).toBe('This email is already registered.');
});
```

## ❓ Common Questions & Troubleshooting

### Backend Questions

**Q: Do I need to wrap ALL routes with `asyncHandler`?**
> A: Yes. `asyncHandler` catches errors thrown in route handlers. Without it, errors won't be caught properly. It's a small wrapper that replaces try-catch boilerplate.

**Q: What if I forget to add `errorMiddleware` as the last middleware?**
> A: Errors won't be caught and sent as standardized responses. The middleware must be LAST in the middleware stack.

**Q: Can I use custom error codes?**
> A: Yes! Extend the `ErrorCode` enum in `src/shared/error-codes.ts`. The frontend will automatically handle new codes (falling back to a default message until you customize it).

**Q: What's the difference between `ValidationErrorFactory.missingField()` and `ValidationErrorFactory.invalidInput()`?**
> A: `missingField()` is for required fields that are missing. `invalidInput()` is for fields that are present but invalid. Both send a 400 status.

**Q: How do I log errors without exposing stack traces to clients?**
> A: Use the `logger` option in `errorMiddleware()`:
> ```typescript
> errorMiddleware({
>   logger: (error, req) => {
>     if (process.env.NODE_ENV === 'production') {
>       console.error(`[${error.code}] ${req.method} ${req.path}`); // Safe
>     } else {
>       console.error(error); // Include stack trace in dev
>     }
>   }
> })
> ```

**Q: What does `ProcessErrorHandler` actually do?**
> A: It catches unhandled promise rejections and uncaught exceptions at the process level. Without it, your app crashes silently. It's a safety net.

### Frontend Questions

**Q: What's the difference between `useAPIError`, `useAsyncData`, and `useGlobalError`?**
> A: 
> - `useAPIError`: For single API calls in one component
> - `useAsyncData`: For fetching data with automatic retry/loading
> - `useGlobalError`: For app-wide errors (multiple components)

**Q: Do I need both `ErrorBoundary` and `GlobalErrorProvider`?**
> A: Yes. `ErrorBoundary` catches React rendering crashes. `GlobalErrorProvider` manages API/async errors. They work together.

**Q: How do I show different messages for the same error code?**
> A: Use `UIMessageMapper.registerMessages()` to customize:
> ```typescript
> UIMessageMapper.registerMessages({
>   [ErrorCode.DUPLICATE_KEY]: 'This email is already in use.',
>   [ErrorCode.NETWORK_ERROR]: 'Check your internet connection.',
> });
> ```

**Q: How do I detect validation errors specifically?**
> A: Use `error.details?.issues` or `APIErrorParser.isValidationError(error)`:
> ```typescript
> if (APIErrorParser.isValidationError(error)) {
>   error.details?.issues?.forEach(issue => {
>     setFieldError(issue.path, issue.message);
>   });
> }
> ```

**Q: How do I handle offline mode?**
> A: Use `useNetworkStatus()`:
> ```typescript
> const { isOnline, offlineMessage } = useNetworkStatus();
> if (!isOnline) return <OfflinePage />;
> ```

### Integration Questions

**Q: Can I use this with Next.js?**
> A: Yes! Use for API routes (backend) and React components (frontend). The package works independently of the framework.

**Q: Can I use this with GraphQL?**
> A: Yes! Backend still uses `asyncHandler`. Frontend use the same hooks. Just adapt error parsing to your GraphQL response format.

**Q: What if my API doesn't return the standard format?**
> A: You can parse it manually and convert to the expected format before passing to hooks:
> ```typescript
> const customError = {
>   code: ErrorCode.CUSTOM_ERROR,
>   message: response.error_message,
>   traceId: response.request_id,
> };
> handleError(customError);
> ```

## ⚠️ Common Mistakes to Avoid

### Backend Mistakes

❌ **Mistake 1: Forgetting `asyncHandler` wrapper**
```typescript
// ❌ Wrong - Error not caught
app.post('/users', async (req, res) => {
  throw new UniversalError(...);
});

// ✅ Right
app.post('/users', asyncHandler(async (req, res) => {
  throw new UniversalError(...);
}));
```

❌ **Mistake 2: Putting `errorMiddleware` before routes**
```typescript
// ❌ Wrong - Won't catch route errors
app.use(errorMiddleware());
app.post('/users', asyncHandler(...));

// ✅ Right
app.post('/users', asyncHandler(...));
app.use(errorMiddleware());
```

❌ **Mistake 3: Exposing internal errors to clients**
```typescript
// ❌ Wrong - Exposes database details
throw new UniversalError(
  ErrorCode.DATABASE_ERROR,
  `MongoDB error: ${error.message}` // Exposed!
);

// ✅ Right
throw new UniversalError(
  ErrorCode.DATABASE_ERROR,
  'Database operation failed' // Safe
);
```

❌ **Mistake 4: Not initializing ProcessErrorHandler**
```typescript
// ❌ Wrong - No safety net for uncaught errors
app.listen(3000);

// ✅ Right
ProcessErrorHandler.initialize({ isDevelopment: true });
app.listen(3000);
```

### Frontend Mistakes

❌ **Mistake 1: Forgetting `ErrorBoundary`**
```typescript
// ❌ Wrong - React crash crashes entire app
export default function App() {
  return <MyApp />;
}

// ✅ Right
export default function App() {
  return (
    <ErrorBoundary>
      <GlobalErrorProvider>
        <MyApp />
      </GlobalErrorProvider>
    </ErrorBoundary>
  );
}
```

❌ **Mistake 2: Not checking response.success**
```typescript
// ❌ Wrong - Treats error response as success
const res = await fetch('/api/data');
const data = await res.json();
// data might have success: false, but you treat it as success

// ✅ Right
const res = await fetch('/api/data');
const data = await res.json();
if (!data.success) {
  handleError(data); // Parse as error
  return;
}
// Use data safely
```

❌ **Mistake 3: Showing raw `message` instead of `uiMessage`**
```typescript
// ❌ Wrong - Too technical for users
{error && <div>{error.message}</div>}
// Shows: "Cast to ObjectId failed"

// ✅ Right
{error && <div>{error.uiMessage}</div>}
// Shows: "Item not found"
```

❌ **Mistake 4: Not catching both API and network errors**
```typescript
// ❌ Wrong - Doesn't handle network failure
const data = await fetch('/api/data').then(r => r.json());
handleError(data); // Crashes if network fails

// ✅ Right
try {
  const res = await fetch('/api/data');
  const data = await res.json();
  if (!data.success) {
    handleError(data);
    return;
  }
} catch (err) {
  handleError(err); // Handle network errors too
}
```


## 📄 License

MIT

---

**Happy error handling! 🎯**
