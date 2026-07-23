import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.requestId = String(requestId); // Attach to req object
  req.headers['x-request-id'] = String(requestId);
  res.setHeader('X-Request-Id', requestId);
  next();
}
