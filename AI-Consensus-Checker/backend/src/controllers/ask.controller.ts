import { Request, Response, NextFunction } from 'express';
import { AskSchema } from '../validators/ask.validator';
import { createQuestionResponse } from '../services/ask.service';
import { formatResponse } from '../utils/responseFormatter';

export async function askController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = AskSchema.parse(req.body);
    const questionResponse = await createQuestionResponse(parsed.question);
    res.status(200).json(formatResponse({ data: questionResponse }));
  } catch (error) {
    next(error);
  }
}
