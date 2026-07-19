import { sanitizeLogContext, type SafeLogContext } from './redaction';

import type { AppErrorCode } from './errors';

export type LogLevel = 'info' | 'warn' | 'error';

export type SafeLogEntry = Readonly<{
  level: LogLevel;
  code: AppErrorCode;
  context: SafeLogContext;
}>;

export class RedactingLogger {
  constructor(private readonly sink: (entry: SafeLogEntry) => void = () => undefined) {}

  write(level: LogLevel, code: AppErrorCode, context: Record<string, unknown> = {}): void {
    this.sink({ level, code, context: sanitizeLogContext(context) });
  }
}

export const logger = new RedactingLogger();
