import express, { Application } from 'express';
import { Server } from 'http';
import swaggerUi from 'swagger-ui-express';
import config, { validateConfig } from './config';
import logger from '@config/logger';
import { swaggerSpec } from '@config/swagger';
import routes from './routes';
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  compressionMiddleware,
  securityHeaders,
  httpLogger,
  requestId,
  responseTime,
  errorHandler,
  notFoundHandler,
} from './middlewares';

class App {
  public app: Application;
  private server?: Server;

  constructor() {
    this.app = express();
    this.validateEnvironment();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private validateEnvironment(): void {
    try {
      validateConfig();
      logger.info('✅ Environment validation passed');
    } catch (error) {
      logger.error({ err: error }, '❌ Environment validation failed');
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmetMiddleware);
    this.app.use(corsMiddleware);
    this.app.use(securityHeaders);

    // Rate limiting
    this.app.use(rateLimitMiddleware);

    // Compression
    this.app.use(compressionMiddleware);

    // Logging and request tracking
    this.app.use(requestId);
    this.app.use(responseTime);
    this.app.use(httpLogger);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    logger.info('✅ Middlewares initialized');
  }

  private initializeRoutes(): void {
    // Swagger documentation
    if (config.nodeEnv !== 'production') {
      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Node.js TypeScript API Documentation',
      }));

      // Swagger JSON endpoint
      this.app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
      });
    }

    this.app.use('/', routes);
    logger.info('✅ Routes initialized');
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    logger.info('✅ Error handling initialized');
  }

  public listen(): void {
    this.server = this.app.listen(config.port, () => {
      const urls: {
        environment: string;
        port: number;
        apiBaseUrl: string;
        healthCheck: string;
        apiInfo: string;
        documentation?: string;
      } = {
        environment: config.nodeEnv,
        port: config.port,
        apiBaseUrl: `http://localhost:${config.port}${config.api.prefix}/${config.api.version}`,
        healthCheck: `http://localhost:${config.port}/health`,
        apiInfo: `http://localhost:${config.port}${config.api.prefix}/${config.api.version}`,
      };

      if (config.nodeEnv !== 'production') {
        urls.documentation = `http://localhost:${config.port}/api-docs`;
      }

      logger.info(urls, '🚀 Server is running!');
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error: Error) => {
      logger.fatal({ err: error }, 'Uncaught Exception');
      this.gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.fatal({ reason, promise }, 'Unhandled Rejection');
      this.gracefulShutdown('unhandledRejection');
    });
  }

  private gracefulShutdown = (signal: string): void => {
    logger.info({ signal }, '🛑 Received signal. Starting graceful shutdown...');

    if (!this.server) {
      logger.warn('No server instance found, exiting immediately');
      process.exit(1);
    }

    // Stop accepting new connections
    this.server.close((err) => {
      if (err) {
        logger.error({ err }, 'Error during server shutdown');
        process.exit(1);
      }

      logger.info('✅ HTTP server closed gracefully');

      // Close database connections, cleanup resources, etc.
      this.cleanup()
        .then(() => {
          logger.info('✅ Cleanup completed');
          process.exit(0);
        })
        .catch((cleanupError) => {
          logger.error({ err: cleanupError }, 'Error during cleanup');
          process.exit(1);
        });
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  private async cleanup(): Promise<void> {
    logger.info('Performing cleanup...');

    try {
      // Close Prisma database connections
      const { prisma } = await import('./config/prisma');
      await prisma.$disconnect();
      logger.info('✅ Database connections closed');

      // Clear any intervals/timeouts
      // clearInterval(someInterval);

      // Close file handles
      // await fileHandle.close();

    } catch (error) {
      logger.error({ err: error }, 'Error during cleanup');
      throw error;
    }
  }
}

export default App;
