import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    const validationMessage = err.errors.map((issue) => issue.message).join(', ');
    logger.error(validationMessage);
    return res.status(400).json({ success: false, message: validationMessage });
  }

  if (err instanceof Error) {
    logger.error(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }

  logger.error('Unexpected error');
  res.status(500).json({ success: false, message: 'Unexpected server error' });
};
