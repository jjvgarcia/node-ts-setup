import { Router } from 'express';
import healthRoutes from './healthRoutes';
import userRoutes from './userRoutes';
import noteRoutes from './noteRoutes';
import config from '../config';

const router = Router();

// Mount routes
router.use('/', healthRoutes); // Health routes at root level
router.use(`${config.api.prefix}/${config.api.version}/users`, userRoutes);
router.use(`${config.api.prefix}/${config.api.version}/notes`, noteRoutes);

// API info route
router.get(`${config.api.prefix}/${config.api.version}`, (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    data: {
      name: 'Node.js TypeScript API',
      version: config.api.version,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
