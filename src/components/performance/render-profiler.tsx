import { Fragment, Profiler } from 'react';

import { performanceMonitor } from '@/services/performance/performance-monitor';

import type { PropsWithChildren } from 'react';

export function RenderProfiler({ id, children }: PropsWithChildren<{ id: string }>) {
  if (!__DEV__) return <Fragment>{children}</Fragment>;

  return (
    <Profiler
      id={id}
      onRender={(profileId, _phase, actualDuration) => {
        performanceMonitor.recordRender(profileId, actualDuration);
      }}
    >
      {children}
    </Profiler>
  );
}
