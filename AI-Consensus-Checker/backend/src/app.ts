import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { timeoutMiddleware } from './middlewares/timeout.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { rateLimitMiddleware } from './middlewares/rateLimit.middleware';
import { env } from './config/env';

dotenv.config();

const app: Application = express();

app.use(requestIdMiddleware);
app.use(timeoutMiddleware);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(morgan('combined'));
app.use(compression({ threshold: 1024, level: 6 }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimitMiddleware);

app.use('/api', routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorMiddleware);

export default app;
