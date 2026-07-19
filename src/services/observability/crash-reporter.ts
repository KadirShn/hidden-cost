import type { AppError } from './errors';
import type { SafeLogContext } from './redaction';

export interface CrashReporter {
  initialize(): Promise<void>;
  record(error: AppError, context?: SafeLogContext): Promise<void>;
  recordDevelopmentTest(): Promise<boolean>;
}

class NoOpCrashReporter implements CrashReporter {
  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  async record(): Promise<void> {
    return Promise.resolve();
  }

  async recordDevelopmentTest(): Promise<boolean> {
    return false;
  }
}

export const crashReporter: CrashReporter = new NoOpCrashReporter();
