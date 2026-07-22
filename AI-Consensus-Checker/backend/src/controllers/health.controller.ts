import { Request, Response } from 'express';
import { formatResponse } from '../utils/responseFormatter';

export const healthCheckController = (_req: Request, res: Response) => {
  res.status(200).json(
    formatResponse({
      data: {
        status: 'ok',
        service: 'AI Consensus Checker API',
        timestamp: new Date().toISOString(),
      },
    }),
  );
};
