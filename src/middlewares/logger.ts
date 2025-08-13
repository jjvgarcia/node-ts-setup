import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

// Add request ID to all requests
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  (req as any).requestId = uuidv4();
  res.setHeader('X-Request-ID', (req as any).requestId);
  next();
};

// Pino HTTP logger middleware
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req: Request) => (req as any).requestId || uuidv4(),
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  customSuccessMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req: Request, res: Response, err: Error) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customProps: (req: Request, _res: Response) => ({
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: (req as any).requestId,
  }),
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.headers['content-type'],
        'content-length': res.headers['content-length'],
      },
    }),
  },
  autoLogging: {
    ignore: (req: Request) => {
      // Skip logging for health check endpoints
      return req.url === '/health' || req.url === '/ping';
    },
  },
});

// Response time middleware
export const responseTime = (_req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Set the header before the response is sent
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', duration);
    }
    return originalSend.call(this, data);
  };

  next();
};
