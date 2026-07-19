import type { AppCheckMode } from './app-protection-config';

export { resolveAppCheckMode } from './app-protection-config';
export type { AppCheckMode } from './app-protection-config';

export async function initializeAppProtection(): Promise<AppCheckMode> {
  return 'disabled';
}
