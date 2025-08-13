import { Request, Response } from 'express';

// Extended Request interface for custom properties
export interface CustomRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  requestId?: string;
}

// Standard API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
}

// Error response structure
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
  stack?: string; // Only in development
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Controller function type
export type ControllerFunction = (
  req: CustomRequest,
  res: Response
) => Promise<void> | void;

// Middleware function type
export type MiddlewareFunction = (
  req: CustomRequest,
  res: Response,
  next: Function
) => Promise<void> | void;

// HTTP Status codes enum
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// Example entity interfaces (can be extended based on your needs)
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
}
