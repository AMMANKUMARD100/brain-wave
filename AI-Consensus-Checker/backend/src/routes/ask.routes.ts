import { Router } from 'express';
import { askController } from '../controllers/ask.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.post('/', asyncHandler(askController));

export default router;
