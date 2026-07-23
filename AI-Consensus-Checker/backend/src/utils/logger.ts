import { Request } from 'express';

// Define a custom interface for Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

interface LogMetadata {
  [key: string]: any;
  requestId?: string;
  errorStack?: string;
}

const formatMessage = (level: LogLevel, message: string, metadata?: LogMetadata) => {
  const logEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...(metadata || {}),
  };
  return JSON.stringify(logEntry);
};

export const logger = {
  info: (message: string, metadata?: LogMetadata) => {
    console.info(formatMessage('INFO', message, metadata));
  },
  error: (message: string, error?: Error | unknown, metadata?: LogMetadata) => {
    const errorMetadata: LogMetadata = { ...metadata };
    if (error instanceof Error) {
      errorMetadata.errorMessage = error.message;
      errorMetadata.errorStack = error.stack;
    } else if (typeof error === 'string') {
      errorMetadata.errorMessage = error;
    }
    console.error(formatMessage('ERROR', message, errorMetadata));
  },
  warn: (message: string, metadata?: LogMetadata) => {
    console.warn(formatMessage('WARN', message, metadata));
  },
  debug: (message: string, metadata?: LogMetadata) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('DEBUG', message, metadata));
    }
  },
  // Method to create a child logger with request-specific context
  child: (req: Request) => {
    const requestId = req.requestId || 'N/A';
    return {
      info: (message: string, metadata?: LogMetadata) =>
        logger.info(message, { ...metadata, requestId }),
      error: (message: string, error?: Error | unknown, metadata?: LogMetadata) =>
        logger.error(message, error, { ...metadata, requestId }),
      warn: (message: string, metadata?: LogMetadata) =>
        logger.warn(message, { ...metadata, requestId }),
      debug: (message: string, metadata?: LogMetadata) =>
        logger.debug(message, { ...metadata, requestId }),
    };
  },
};
