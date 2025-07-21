// Barakah AI Agents - Global Error Handler
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log the error
  logger.error('API Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Determine error response based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse: any = {
    success: false,
    error: error.message || 'Internal Server Error',
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Add stack trace in development
  if (isDevelopment) {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      isOperational,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    };
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    errorResponse.error = 'Validation Error';
    errorResponse.details = error.message;
  } else if (error.name === 'CastError') {
    errorResponse.error = 'Invalid ID Format';
  } else if (error.name === 'JsonWebTokenError') {
    errorResponse.error = 'Invalid Token';
  } else if (error.name === 'TokenExpiredError') {
    errorResponse.error = 'Token Expired';
  } else if (statusCode === 404) {
    errorResponse.error = 'Resource Not Found';
  } else if (statusCode === 429) {
    errorResponse.error = 'Too Many Requests';
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Create operational errors
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};