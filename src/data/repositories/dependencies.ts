export type RepositoryDependencies = {
  now: () => string;
  createId: () => string;
  deviceId: string;
};

function fallbackId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const defaultRepositoryDependencies: RepositoryDependencies = {
  now: () => new Date().toISOString(),
  createId: () => globalThis.crypto?.randomUUID?.() ?? fallbackId(),
  deviceId: 'local-device',
};
