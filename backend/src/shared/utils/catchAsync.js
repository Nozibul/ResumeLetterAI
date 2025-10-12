/**
 * @file catchAsync.js
 * @description Wrapper for async route handlers to catch errors
 * @module utils/catchAsync
 * @author Nozibul Islam
 * @version 1.0.0
 *
 * Usage:
 * exports.login = catchAsync(async (req, res, next) => {
 *   // Your async code here
 * });
 */

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
