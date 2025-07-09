const config = require('../config');

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'Constraint violation',
      message: 'Cette opération viole une contrainte de base de données'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  // Default error response
  const isDevelopment = config.app.environment === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Une erreur interne s\'est produite',
    ...(isDevelopment && { stack: err.stack })
  });
}

// 404 handler
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: 'Page non trouvée'
  });
}

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};