import express, { Application } from 'express';
import config, { validateConfig } from './config';
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
      console.log(`✅ Environment validation passed`);
    } catch (error) {
      console.error(`❌ Environment validation failed:`, error);
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
    
    console.log(`✅ Middlewares initialized`);
  }

  private initializeRoutes(): void {
    this.app.use('/', routes);
    console.log(`✅ Routes initialized`);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
    
    console.log(`✅ Error handling initialized`);
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      console.log(`
🚀 Server is running!
📍 Environment: ${config.nodeEnv}
🌐 Port: ${config.port}
📡 API Base URL: http://localhost:${config.port}${config.api.prefix}/${config.api.version}
🏥 Health Check: http://localhost:${config.port}/health
📊 API Info: http://localhost:${config.port}${config.api.prefix}/${config.api.version}
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown);
    process.on('SIGINT', this.gracefulShutdown);
  }

  private gracefulShutdown = (signal: string): void => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    // Close server
    const server = this.app.listen();
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
}

export default App;
