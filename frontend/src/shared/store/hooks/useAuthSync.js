/**
 * @file store/hooks/useAuthSync.js
 * @description Sync Redux auth state with localStorage
 * @author Nozibul Islam
 */

import { useEffect } from 'react';
import { useAppDispatch } from './useAuth';
import { useIsAuthenticated } from './useAuth';
import { clearAuth } from '../slices/authSlice';
import { persistor } from '../index';

export const useAuthSync = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const syncAuthState = () => {
      // Check if persist data exists in localStorage
      const persistKey = 'persist:resumeLetterAI';
      const persistedData = localStorage.getItem(persistKey);

      // If localStorage cleared but Redux still has auth data
      if (!persistedData && isAuthenticated) {
        console.log('🔄 localStorage cleared, syncing Redux state...');
        dispatch(clearAuth());
        persistor.purge();
      }
    };

    // Initial sync check
    syncAuthState();

    // Listen to storage changes (cross-tab sync)
    window.addEventListener('storage', syncAuthState);

    // Poll every 2 seconds for same-tab detection
    const interval = setInterval(syncAuthState, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('storage', syncAuthState);
      clearInterval(interval);
    };
  }, [isAuthenticated, dispatch]);
};