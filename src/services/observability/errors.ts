export const APP_ERROR_CODES = [
  'app/initialization_failed',
  'calculation/invalid_input',
  'database/migration_failed',
  'database/local_export_failed',
  'database/local_delete_failed',
  'firebase/unavailable',
  'sync/failed',
  'account/delete_failed',
  'export/failed',
  'app_check/initialization_failed',
  'dev/test_non_fatal',
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export class AppError extends Error {
  constructor(
    readonly code: AppErrorCode,
    options?: { cause?: unknown },
  ) {
    super(code, options);
    this.name = 'AppError';
  }
}

export function toAppError(error: unknown, fallback: AppErrorCode): AppError {
  return error instanceof AppError ? error : new AppError(fallback, { cause: error });
}
