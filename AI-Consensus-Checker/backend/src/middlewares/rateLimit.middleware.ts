import type { Request, Response, NextFunction } from 'express';

interface RateState {
  count: number;
  expiresAt: number;
}

const store = new Map<string, RateState>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);
  const key = String(req.headers['x-request-id'] || req.ip || 'anonymous');
  const now = Date.now();
  const state = store.get(key);

  if (!state || state.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return next();
  }

  if (state.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }

  state.count += 1;
  store.set(key, state);
  next();
}
