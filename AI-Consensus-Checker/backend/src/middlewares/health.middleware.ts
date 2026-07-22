import { Request, Response } from 'express';

export function healthMiddleware(_req: Request, res: Response) {
  res.json({ status: 'ok' });
}
