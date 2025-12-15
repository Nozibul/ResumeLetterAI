/**
 * @file DeleteAccountModal.jsx
 * @description Account deletion modal with proper error handling and toast notifications
 * @author Nozibul Islam
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { persistor } from '@/shared/store/index';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/shared/store/hooks/useAuth';
import { clearOperationError } from '@/shared/store/slices/authSlice';
import { deleteAccountUser } from '@/shared/store/actions/authActions';

export function DeleteAccountModal({ isOpen, onClose }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setLoading(false);
      dispatch(clearOperationError());
    }
  }, [isOpen, dispatch]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading, onClose]);

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      const errorMsg = 'Password is required';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);

    try {
      await dispatch(deleteAccountUser({ password })).unwrap();
      
      toast.success('Account deleted successfully', {
        position: 'top-center',
      });
      
      // Purge persisted state and redirect
      await persistor.purge();
      onClose();
      router.push('/');
      
    } catch (err) {
  
      let errorMessage = 'Failed to delete account';
      
      if (err?.response?.data?.message) {

        errorMessage = err.response.data.message;
      } else if (err?.message) {
        // Generic error message
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Show error in both UI and toast
      setError(errorMessage);
      toast.error(errorMessage,{
        position: 'top-center',
      } );
      
      // ❌ DON'T redirect, DON'T purge, DON'T close modal
      // Stay on the modal and show the error
      
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Warning Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Delete Account
          </h2>

          {/* Warning Message */}
          <p className="text-gray-600 text-center mb-6">
            This action <strong className="text-red-600">cannot be undone</strong>.
            All your data will be permanently deleted.
          </p>

          {/* Form */}
          <form onSubmit={handleDelete}>
            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password to confirm
              </label>
              <input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}