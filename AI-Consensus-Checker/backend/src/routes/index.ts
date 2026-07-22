import { Router } from 'express';
import healthRoutes from './health.routes';
import askRoutes from './ask.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/ask', askRoutes);

export default router;
