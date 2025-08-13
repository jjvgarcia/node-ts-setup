import { Request, Response, NextFunction } from 'express';
import { ErrorResponse, HttpStatus } from '../types';
import config from '../config';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation Error';
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Log error
  console.error(`Error ${statusCode}: ${message}`, {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    error: error.message,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId,
  };

  // Include stack trace only in development
  if (config.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.path}`,
    statusCode: HttpStatus.NOT_FOUND,
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId,
  };

  res.status(HttpStatus.NOT_FOUND).json(errorResponse);
};
