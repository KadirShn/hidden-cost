export type PerformanceSample = Readonly<{
  name: string;
  durationMs: number;
  recordedAt: number;
}>;

const MAX_SAMPLES = 50;

function now(): number {
  return globalThis.performance?.now() ?? Date.now();
}

export class PerformanceMonitor {
  private readonly startupMarks = new Map<string, number>();
  private readonly samples: PerformanceSample[] = [];

  markStartup(name: string): void {
    if (!this.startupMarks.has(name)) this.startupMarks.set(name, now());
  }

  measureStartup(name: string, startedAt: number): number {
    const durationMs = Math.max(0, now() - startedAt);
    this.record(`startup.${name}`, durationMs);
    return durationMs;
  }

  measureStartupFromMark(name: string, startMark: string): number | undefined {
    const startedAt = this.startupMarks.get(startMark);
    if (startedAt === undefined) return undefined;
    return this.measureStartup(name, startedAt);
  }

  recordRender(name: string, durationMs: number): void {
    this.record(`render.${name}`, durationMs);
  }

  snapshot(): Readonly<{
    startupMarks: Readonly<Record<string, number>>;
    samples: readonly PerformanceSample[];
  }> {
    return {
      startupMarks: Object.freeze(Object.fromEntries(this.startupMarks)),
      samples: Object.freeze([...this.samples]),
    };
  }

  reset(): void {
    this.startupMarks.clear();
    this.samples.length = 0;
  }

  private record(name: string, durationMs: number): void {
    this.samples.push({ name, durationMs, recordedAt: now() });
    if (this.samples.length > MAX_SAMPLES) this.samples.shift();
  }
}

export const performanceMonitor = new PerformanceMonitor();
