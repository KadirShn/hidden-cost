import { useCallback, useEffect, useState } from 'react';

import {
  DatabaseInitializationError,
  initializeApplication,
  type AppInitializationResult,
} from '@/features/app-initialization/initialize-application';

export type AppInitializationState =
  | Readonly<{ status: 'initializing' }>
  | Readonly<{ status: 'ready'; result: AppInitializationResult }>
  | Readonly<{ status: 'error'; kind: 'database' | 'unknown' }>;

export function useAppInitialization() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AppInitializationState>({ status: 'initializing' });

  useEffect(() => {
    let isActive = true;

    initializeApplication()
      .then((result) => {
        if (isActive) setState({ status: 'ready', result });
      })
      .catch((error: unknown) => {
        if (isActive)
          setState({
            status: 'error',
            kind: error instanceof DatabaseInitializationError ? 'database' : 'unknown',
          });
      });

    return () => {
      isActive = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'initializing' });
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  return { state, retry } as const;
}
