import { Response } from 'express';
import { BaseController } from './BaseController';
import { CustomRequest } from '../types';
import config from '../config';

export class HealthController extends BaseController {
  /**
   * Health check endpoint
   */
  public health = async (_req: CustomRequest, res: Response): Promise<void> => {
    try {
      const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: config.api.version,
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        },
        cpu: process.cpuUsage(),
      };

      this.sendSuccess(res, healthData, 'Service is healthy');
    } catch (error) {
      this.sendError(
        res,
        'Health check failed',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Simple ping endpoint
   */
  public ping = async (_req: CustomRequest, res: Response): Promise<void> => {
    this.sendSuccess(res, { pong: true }, 'Pong!');
  };
}
