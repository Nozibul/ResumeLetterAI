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
        const errors = (result.error?.issues || []).map((err) => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation failed',
        }));

        const error = new AppError('Validation error', 400);
        error.errors = errors;
        return next(error);
      }

      req.body = result.data.body ?? req.body;
      req.params = result.data.params ?? req.params;
      req.query = result.data.query ?? req.query;

      next();
    } catch (err) {
      next(new AppError('Validation processing failed', 500));
    }
  };
};
