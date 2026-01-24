const AppError = require('../../shared/utils/AppError');

exports.validate = (schema) => {
  return (req, _, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      });

      if (!result.success) {
        const zodErrors = result.error?.issues || result.error?.errors || [];

        const errors = zodErrors.map((err) => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation failed',
        }));

        const error = new AppError('Validation error', 400);
        error.errors = errors; // ✅ Add errors array
        return next(error);
      }

      next();
    } catch (error) {
      console.error('Unexpected validation error:', error);
      next(new AppError('Validation processing failed', 500));
    }
  };
};
