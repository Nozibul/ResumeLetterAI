/**
 * @file validate.js
 * @description Zod validation middleware
 * @module middleware/validate
 */

const { ZodError } = require('zod');
const AppError = require('../../shared/utils/AppError');

/**
 * Validate request using Zod schema
 * @param {Object} schema - Zod schema
 * @returns {Function} Express middleware
 */
exports.validate = (schema) => {
  return (req, _, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // ✅ ADD DETAILED LOGGING
        console.log('\n=== VALIDATION ERROR DETAILS ===');
        console.log('Zod Errors:', JSON.stringify(error.errors, null, 2));
        console.log('\n--- Request Body ---');
        console.log(JSON.stringify(req.body, null, 2));
        console.log('========================\n');

        const errors =
          error.errors?.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })) || [];

        const errorMessage =
          errors.length > 0
            ? `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
            : 'Validation failed';

        return next(new AppError(errorMessage, 400));
      }

      next(error);
    }
  };
};
