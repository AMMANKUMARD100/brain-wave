import { NextFunction, Request, Response } from 'express';

export function timeoutMiddleware(req: Request, res: Response, next: NextFunction) {
  const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 12000);
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ success: false, message: 'Request timed out.' });
    }
  }, timeoutMs);

  res.on('finish', () => clearTimeout(timeout));
  next();
}
