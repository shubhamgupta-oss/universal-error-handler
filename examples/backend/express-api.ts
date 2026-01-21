/**
 * BACKEND EXAMPLE - Express API with error handling
 * Shows complete usage of error handlers, middleware, and async patterns
 */

import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  asyncHandler,
  errorMiddleware,
  requestIdMiddleware,
  ProcessErrorHandler,
  ValidationErrorFactory,
  DatabaseErrorMapper,
  ExternalAPIErrorHandler,
} from 'universal-error-handler/backend';
import {
  UniversalError,
  ErrorCode,
} from 'universal-error-handler/shared';

const app = express();
const PORT = 3000;

//MIDDLEWARE SETUP

app.use(express.json());

// Add request ID to every request
app.use(requestIdMiddleware);

// Initialize process-level error handlers
ProcessErrorHandler.initialize({
  isDevelopment: process.env.NODE_ENV !== 'production',
  gracefulShutdown: async () => {
    // Close DB connections, etc.
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
});

//EXAMPLE ROUTES ============

// Validation with Zod
const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  age: z.number().min(18, 'Must be 18 or older'),
});

/**
 * POST /users - Create user with validation
 */
app.post(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const result = createUserSchema.safeParse(req.body);

    if (!result.success) {
      throw ValidationErrorFactory.fromZodError(result.error);
    }

    // Simulate database operation
    if (result.data.email === 'duplicate@test.com') {
      throw new UniversalError(
        ErrorCode.DUPLICATE_KEY,
        'User with this email already exists',
        {
          details: { field: 'email', value: result.data.email },
          context: { userId: (req as any).userId },
        }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        id: '123',
        email: result.data.email,
        name: result.data.name,
        age: result.data.age,
      },
    });
  })
);

/**
 * GET /users/:id - Get user (with 404 handling)
 */
app.get(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Simulate user fetch
    if (id === '404') {
      throw new UniversalError(
        ErrorCode.NOT_FOUND,
        'User not found'
      );
    }

    res.json({
      success: true,
      data: { id, email: 'user@example.com', name: 'John Doe' },
    });
  })
);

/**
 * POST /login - Authentication error handling
 */
app.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ValidationErrorFactory.missingField(email ? 'password' : 'email');
    }

    // Simulate auth failure
    if (password !== 'correct') {
      throw new UniversalError(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }

    res.json({
      success: true,
      data: { token: 'jwt_token_here' },
    });
  })
);

/**
 * POST /payments - External API error handling
 */
app.post(
  '/payments',
  asyncHandler(async (req: Request, res: Response) => {
    const { amount, cardToken } = req.body;

    try {
      // Simulate payment API call
      if (cardToken === 'invalid') {
        throw {
          type: 'card_error',
          message: 'Card declined',
          code: 'card_declined',
          decline_code: 'generic_decline',
        };
      }

      res.json({
        success: true,
        data: { transactionId: 'txn_123', amount },
      });
    } catch (error) {
      throw ExternalAPIErrorHandler.handlePaymentError(error);
    }
  })
);

/**
 * GET /data - Simulate database error
 */
app.get(
  '/data',
  asyncHandler(async (req: Request, res: Response) => {
    // Simulate MongoDB duplicate key error
    if (req.query.simulateDbError === 'true') {
      const mongoError = {
        code: 11000,
        keyPattern: { email: 1 },
        keyValue: { email: 'test@example.com' },
      };
      throw DatabaseErrorMapper.mapMongoError(mongoError);
    }

    res.json({ success: true, data: [] });
  })
);

/**
 * Sync error example (will be caught by process handler)
 */
app.get(
  '/sync-error',
  asyncHandler(async (req: Request, res: Response) => {
    // This will be caught
    JSON.parse('invalid json');
  })
);

/**
 * Async error that wasn't caught (process handler will catch)
 */
app.get(
  '/unhandled',
  asyncHandler(async (req: Request, res: Response) => {
    // Simulate unhandled promise rejection
    setTimeout(() => {
      throw new Error('This would normally be unhandled');
    }, 100);
  })
);

//ERROR MIDDLEWARE (MUST BE LAST)

app.use(
  errorMiddleware({
    isDevelopment: process.env.NODE_ENV !== 'production',
    logger: (error: UniversalError, req: Request) => {
      console.error(`[${error.code}] ${req.method} ${req.path} - ${error.message}`);
      if (error.context?.userId) {
        console.error(`User: ${error.context.userId}`);
      }
    },
  })
);

//START SERVER

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Try: POST http://localhost:${PORT}/users`);
  console.log(`Try: GET http://localhost:${PORT}/users/123`);
});
