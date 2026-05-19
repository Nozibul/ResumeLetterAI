'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/shared/store';
import ErrorBoundary from './ErrorBoundary';
import Loading from '@/app/loading';

export function ReduxProviders({ children }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
