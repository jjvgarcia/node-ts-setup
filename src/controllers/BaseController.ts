import { Response } from 'express';
import { CustomRequest, ApiResponse, HttpStatus, PaginationParams } from '../types';

export abstract class BaseController {
  /**
   * Send success response
   */
  protected sendSuccess<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = HttpStatus.OK
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId: (res.req as any).requestId,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send created response
   */
  protected sendCreated<T>(
    res: Response,
    data?: T,
    message: string = 'Resource created successfully'
  ): void {
    this.sendSuccess(res, data, message, HttpStatus.CREATED);
  }

  /**
   * Send no content response
   */
  protected sendNoContent(res: Response): void {
    res.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      requestId: (res.req as any).requestId,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send bad request response
   */
  protected sendBadRequest(
    res: Response,
    message: string = 'Bad request',
    error?: string
  ): void {
    this.sendError(res, message, HttpStatus.BAD_REQUEST, error);
  }

  /**
   * Send not found response
   */
  protected sendNotFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    this.sendError(res, message, HttpStatus.NOT_FOUND);
  }

  /**
   * Send unauthorized response
   */
  protected sendUnauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): void {
    this.sendError(res, message, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Send forbidden response
   */
  protected sendForbidden(
    res: Response,
    message: string = 'Forbidden'
  ): void {
    this.sendError(res, message, HttpStatus.FORBIDDEN);
  }

  /**
   * Extract pagination parameters from request
   */
  protected getPaginationParams(req: CustomRequest): PaginationParams & { offset: number } {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 items per page
    const sortBy = req.query.sortBy as string;
    const sortOrder: 'asc' | 'desc' = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';

    return {
      page: Math.max(1, page),
      limit: Math.max(1, limit),
      sortBy,
      sortOrder,
      offset: (Math.max(1, page) - 1) * Math.max(1, limit),
    };
  }
}
