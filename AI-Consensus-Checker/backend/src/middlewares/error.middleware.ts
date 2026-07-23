import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger'; // Assuming the enhanced logger is in this path

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const errorMiddleware = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  const childLogger = logger.child(req);

  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let errors: any[] | undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    childLogger.warn(`Validation Error: ${message}`, { errors, originalError: err.message });
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    childLogger.error(`API Error: ${message}`, err, { statusCode });
  } else if (err instanceof Error) {
    // Generic operational error
    statusCode = 500;
    message = err.message || 'Internal Server Error';
    childLogger.error(`Unhandled Error: ${message}`, err);
  } else {
    // Catch all for non-Error objects
    childLogger.error('Unknown Error Type', err);
  }

  // In production, avoid sending stack traces to the client
  const isProduction = process.env.NODE_ENV === 'production';
  const errorResponse: any = {
    success: false,
    message,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  if (!isProduction && err instanceof Error) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
