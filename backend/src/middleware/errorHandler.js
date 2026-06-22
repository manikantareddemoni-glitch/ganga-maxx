export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  
  if (error.name === 'ZodError' || error.issues) {
    const msg = error.issues && error.issues[0] ? `${error.issues[0].path.join('.')}: ${error.issues[0].message}` : 'Validation error';
    return res.status(400).json({ message: msg, details: error.issues });
  }

  console.error('[Global Error Handler]:', error);
  const status = error.status || 500;
  res.status(status).json({
    message: error.message,
    details: error.stack
  });
}
