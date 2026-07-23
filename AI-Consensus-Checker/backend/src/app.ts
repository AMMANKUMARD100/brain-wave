import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware'; // Use enhanced error middleware
import { timeoutMiddleware } from './middlewares/timeout.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware'; // Use enhanced requestId middleware
import { rateLimitMiddleware } from './middlewares/rateLimit.middleware';
import { env } from './config/env';
import { logger } from './utils/logger'; // Use enhanced logger

dotenv.config();

const app: Application = express();

// Apply middlewares
app.use(requestIdMiddleware);
app.use(timeoutMiddleware);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = env.CORS_ORIGIN.split(',').map((item) => item.trim());
      callback(null, allowedOrigins.includes(origin) ? true : new Error('Not allowed by CORS'));
    },
  }),
);

// Custom Morgan token for request ID
morgan.token('id', (req: Request) => req.requestId);
app.use(morgan(':id :method :url :status :response-time ms - :res[content-length]', {
  stream: {
    write: (message) => logger.info(message.trim(), { type: 'http' })
  }
}));

app.use(compression({ threshold: 1024, level: 6 }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimitMiddleware);

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check performed', { requestId: req.requestId });
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 Not Found handler
app.use((req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, { requestId: req.requestId });
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler - MUST be the last middleware
app.use(errorMiddleware);

export default app;
