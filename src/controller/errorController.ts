import AppError from '../utils/appError';
import { Request, Response } from 'express';

const handleCastErrorDB = (error: any) => {
  const message = `Invalid ${error.path}: ${error.value}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error: any) => {
  const values = Object.values(error.keyValue);
  const message = `Duplicate field value ${values.join(
    ' '
  )}. Use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (error: any) => {
  const errors = Object.values(error.errors).map((err: any) => err.message);

  const message = `Invalid input data - ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again', 401);
};

const sendErrorDev = (error: any, req: Request, res: Response) => {
  const { status, statusCode, message, stack } = error;

  if (req.originalUrl.startsWith('/api')) {
    return res.status(statusCode).json({
      status,
      error,
      message,
      stack,
    });
  }
};

const sendErrorProd = (error: any, req: Request, res: Response) => {
  const { status, statusCode, message, isOperational } = error;

  if (req.originalUrl.startsWith('/api')) {
    if (isOperational) {
      return res.status(statusCode).json({
        status,
        message,
      });
    }

    console.log('Error 💥', error);

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      error,
    });
  }
};

export default (err: any, req: Request, res: Response, next: any) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.kind === 'ObjectId') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error._message?.includes('validation failed')) {
      error = handleValidationErrorDB(error);
    }

    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (err.name === 'TokenExpiredError') {
      error === handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};
