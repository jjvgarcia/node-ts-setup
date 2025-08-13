import { Request, Response, NextFunction } from 'express';
import slowDown from 'express-slow-down';
import { AppError } from './errorHandler';
import config from '../config';

/**
 * Slow down middleware for API endpoints
 */
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  validate: { delayMs: false }, // Disable warning
});

/**
 * Input size limiter middleware
 */
export const inputSizeLimiter = (req: Request, _res: Response, next: NextFunction): void => {
  const maxSize = 1024 * 1024; // 1MB

  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length'], 10);
    if (contentLength > maxSize) {
      throw new AppError('Request payload too large', 413);
    }
  }

  next();
};

/**
 * Request method validator
 */
export const methodValidator = (allowedMethods: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!allowedMethods.includes(req.method)) {
      throw new AppError(`Method ${req.method} not allowed`, 405);
    }
    next();
  };
};

/**
 * IP whitelist middleware
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.socket?.remoteAddress || '';

    if (config.nodeEnv === 'production' && !allowedIPs.includes(clientIP)) {
      throw new AppError('Access denied from this IP', 403);
    }

    next();
  };
};

/**
 * Content type validator
 */
export const contentTypeValidator = (allowedTypes: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const contentType = req.headers['content-type'];

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        throw new AppError('Invalid content type', 415);
      }
    }

    next();
  };
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        throw new AppError('Request timeout', 408);
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * SQL injection protection (basic)
 */
export const sqlInjectionProtection = (req: Request, _res: Response, next: NextFunction): void => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b).*?[=<>]/gi,
  ];

  const checkForSQLInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return sqlPatterns.some(pattern => pattern.test(obj));
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkForSQLInjection(value));
    }

    return false;
  };

  if (
    checkForSQLInjection(req.body) ||
    checkForSQLInjection(req.query) ||
    checkForSQLInjection(req.params)
  ) {
    throw new AppError('Potential SQL injection detected', 400);
  }

  next();
};

/**
 * NoSQL injection protection
 */
export const noSQLInjectionProtection = (req: Request, _res: Response, next: NextFunction): void => {
  const checkForNoSQLInjection = (obj: any): boolean => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          return true;
        }
        if (checkForNoSQLInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkForNoSQLInjection(req.body) || checkForNoSQLInjection(req.query)) {
    throw new AppError('Potential NoSQL injection detected', 400);
  }

  next();
};
