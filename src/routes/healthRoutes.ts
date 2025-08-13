import { Router } from 'express';
import { HealthController } from '../controllers';

const router = Router();
const healthController = new HealthController();

// Health check routes
router.get('/health', healthController.health);
router.get('/ping', healthController.ping);

export default router;
