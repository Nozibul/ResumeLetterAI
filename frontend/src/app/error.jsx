// src/app/error.jsx
'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong!
          </h2>
          <p className="text-gray-600">
            An unexpected error occurred. Please try again.
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Try again
        </button>

        <div className="mt-4 text-sm text-gray-500">
          <details>
            <summary className="cursor-pointer hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 text-left text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error?.message || 'Unknown error'}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
