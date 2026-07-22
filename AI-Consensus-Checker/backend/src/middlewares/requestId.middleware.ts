import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.headers['x-request-id'] = String(requestId);
  res.setHeader('X-Request-Id', requestId);
  next();
}
