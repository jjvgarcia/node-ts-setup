import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from './errorHandler';

export interface ValidationSchemas {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}

/**
 * Generic validation middleware using Zod schemas
 */
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate request parameters
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params) as unknown as Request['params'];
        Object.assign(req.params, parsedParams);
      }

      // Validate query parameters
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query) as unknown as Request['query'];
        Object.assign(req.query as any, parsedQuery);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map(issue => {
          const field = Array.isArray(issue.path) ? issue.path.join('.') : 'unknown';
          return {
            field,
            message: issue.message || 'Invalid value',
            code: issue.code || 'invalid',
          };
        });

        const errorMessage =
          validationErrors.length > 0
            ? `Validation failed: ${validationErrors.map(err => `${err.field}: ${err.message}`).join(', ')}`
            : 'Validation failed';

        return next(new AppError(errorMessage, 400));
      }

      next(error);
    }
  };
};

/**
 * Sanitize string inputs to prevent XSS
 */
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Basic XSS prevention
      .slice(0, 10000); // Prevent extremely long strings
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
};
