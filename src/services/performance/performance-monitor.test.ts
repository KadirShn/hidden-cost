import { describe, expect, it } from '@jest/globals';

import { PerformanceMonitor } from './performance-monitor';

describe('PerformanceMonitor', () => {
  it('records startup and render samples without unbounded growth', () => {
    const monitor = new PerformanceMonitor();
    monitor.markStartup('root');
    expect(monitor.measureStartupFromMark('ui_ready', 'root')).toEqual(expect.any(Number));
    monitor.measureStartup('database', globalThis.performance.now());
    for (let index = 0; index < 60; index += 1) monitor.recordRender('root', index);

    const snapshot = monitor.snapshot();
    expect(snapshot.startupMarks.root).toEqual(expect.any(Number));
    expect(snapshot.samples).toHaveLength(50);
    expect(snapshot.samples.at(-1)).toMatchObject({ name: 'render.root', durationMs: 59 });
  });
});
