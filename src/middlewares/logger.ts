import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

// Add request ID to all requests
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  (req as any).requestId = uuidv4();
  res.setHeader('X-Request-ID', (req as any).requestId);
  next();
};

// Custom morgan token for request ID
morgan.token('id', (req: Request) => (req as any).requestId);

// Custom morgan token for response time in ms
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Morgan format for different environments
const morganFormat = config.nodeEnv === 'production'
  ? ':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'
  : ':id :method :url :status :response-time ms - :res[content-length]';

export const httpLogger = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      // Remove trailing newline
      const logMessage = message.trim();
      console.log(`[HTTP] ${logMessage}`);
    },
  },
  skip: (req: Request) => {
    // Skip logging for health check endpoints
    return req.url === '/health' || req.url === '/ping';
  },
});

// Response time middleware
export const responseTime = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Set the header before the response is sent
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', duration);
    }
    return originalSend.call(this, data);
  };

  next();
};
