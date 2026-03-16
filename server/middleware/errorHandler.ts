import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error 💥:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let status = err.status || 'error';
  let errors = null;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = `Resource not found. Invalid: ${err.path}`;
    statusCode = 404;
    status = 'fail';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const value = err.errmsg ? (err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown') : 'Duplicate field value';
    message = `Duplicate field value entered: ${value}. Please use another value.`;
    statusCode = 400;
    status = 'fail';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = err.errors ? Object.values(err.errors).map((val: any) => val.message) : [err.message];
    message = `Invalid input data. ${messages.join('. ')}`;
    statusCode = 400;
    status = 'fail';
    errors = messages;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.';
    statusCode = 401;
    status = 'fail';
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired. Please log in again.';
    statusCode = 401;
    status = 'fail';
  }

  res.status(statusCode).json({
    success: false,
    status,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(errors && { details: errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

