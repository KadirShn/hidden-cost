import { useCallback, useEffect, useState } from 'react';

import {
  initializeApplication,
  type AppInitializationResult,
} from '@/features/app-initialization/initialize-application';

export type AppInitializationState =
  | Readonly<{ status: 'initializing' }>
  | Readonly<{ status: 'ready'; result: AppInitializationResult }>
  | Readonly<{ status: 'error' }>;

export function useAppInitialization() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AppInitializationState>({ status: 'initializing' });

  useEffect(() => {
    let isActive = true;

    initializeApplication()
      .then((result) => {
        if (isActive) setState({ status: 'ready', result });
      })
      .catch(() => {
        if (isActive) setState({ status: 'error' });
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
