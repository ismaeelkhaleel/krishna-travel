export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack || err);

  const statusCode = err.statusCode || 500;
  
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }

  // Handle Prisma specific errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Unique constraint failed',
      errors: [{ field: err.meta?.target, message: 'Already exists' }]
    });
  }
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};
