import { FatalErrorScreen } from '@/components/feedback/fatal-error-screen';
import { InitializationScreen } from '@/components/feedback/initialization-screen';
import { useAppInitialization } from '@/features/app-initialization/use-app-initialization';

import type { PropsWithChildren } from 'react';

export function AppInitializationGate({ children }: PropsWithChildren) {
  const { state, retry } = useAppInitialization();

  if (state.status === 'initializing') return <InitializationScreen />;
  if (state.status === 'error') return <FatalErrorScreen onRetry={retry} />;

  return children;
}
