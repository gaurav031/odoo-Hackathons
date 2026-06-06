import AppError from '../utils/AppError.js';

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific MongoDB/Mongoose errors if needed here (like CastError, DuplicateKey)
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.message = Object.values(err.errors).map((val) => val.message).join('. ');
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
