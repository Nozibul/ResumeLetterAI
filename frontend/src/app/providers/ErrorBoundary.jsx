/**
 * @file app/providers/ErrorBoundary.jsx
 * @description React Error Boundary for crash prevention
 * @author Nozibul Islam
 *
 * Features:
 * - Catches React component errors
 * - Prevents entire app crash
 * - User-friendly error UI
 * - Error logging for debugging
 * - Reset functionality
 *
 * Performance:
 * - Minimal overhead
 * - Only active when error occurs
 *
 * Security:
 * - Doesn't expose sensitive error details to user
 * - Logs full error for developers
 */

'use client';

import React from 'react';
import PropTypes from 'prop-types';
import logger from '@/shared/lib/logger';

/**
 * ErrorBoundary Component
 * Wraps children and catches any rendering errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  // ==========================================
  // ERROR LIFECYCLE METHOD
  // ==========================================

  /**
   * Update state when error is caught
   */
  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details
   */
  componentDidCatch(error, errorInfo) {
    // Log error to console (development)
    logger.error('ErrorBoundary caught an error:', error);
    logger.error('Error info:', errorInfo);

    // Update state with error details
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // TODO: Send error to error tracking service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   sendErrorToService(error, errorInfo);
    // }
  }

  // ==========================================
  // RESET ERROR STATE
  // ==========================================

  /**
   * Reset error boundary (allows retry)
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      // Keep errorCount for tracking repeated errors
    });
  };

  /**
   * Reload page (last resort)
   */
  reloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  render() {
    const { hasError, error, errorCount } = this.state;
    const { children } = this.props;

    // If no error, render children normally
    if (!hasError) {
      return children;
    }

    // ==========================================
    // ERROR UI
    // ==========================================

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>

          <p className="text-gray-600 mb-6">
            We're sorry for the inconvenience. The application encountered an
            unexpected error.
          </p>

          {/* Error Count Warning */}
          {errorCount > 2 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ This error has occurred {errorCount} times. Consider
                reloading the page or clearing your browser cache.
              </p>
            </div>
          )}

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
                Show error details (dev only)
              </summary>
              <div className="bg-gray-100 rounded p-4 text-xs font-mono text-red-600 overflow-auto max-h-40">
                <p className="font-bold mb-2">Error:</p>
                <p className="mb-4">{error.toString()}</p>

                {this.state.errorInfo && (
                  <>
                    <p className="font-bold mb-2">Component Stack:</p>
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Try Again Button */}
            <button
              onClick={this.resetError}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            {/* Reload Page Button */}
            <button
              onClick={this.reloadPage}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </button>
          </div>

          {/* Contact Support Link */}
          <p className="mt-6 text-sm text-gray-500">
            If this problem persists, please{' '}
            <a
              href="mailto:support@resumeletterai.com"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    );
  }
}

// ==========================================
// PROP TYPES
// ==========================================

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
