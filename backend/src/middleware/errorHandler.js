export const errorHandler = (error, req, res, next) => {
  console.error('API Error:', error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (error.message.includes('insufficient funds')) {
    statusCode = 400;
    message = 'Insufficient funds for transaction';
  } else if (error.message.includes('not authorized')) {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.message.includes('validation')) {
    statusCode = 400;
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};