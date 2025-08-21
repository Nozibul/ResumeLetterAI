// src/app/loading.jsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        {/* Spinning loader */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          ></div>
        </div>

        {/* Loading text */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading...</h2>
        <p className="text-gray-500">
          Please wait while we prepare your experience
        </p>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
