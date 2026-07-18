import 'expo-sqlite/localStorage/install';

import { useCallback, useSyncExternalStore } from 'react';

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

export const settingsStore = {
  get(key: string): string | null {
    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      globalThis.localStorage.setItem(key, value);
    } catch {
      // Preferences are non-critical; keep the app usable if storage is unavailable.
    } finally {
      notify(key);
    }
  },
  subscribe(key: string, listener: Listener): () => void {
    const keyListeners = listeners.get(key) ?? new Set<Listener>();
    keyListeners.add(listener);
    listeners.set(key, keyListeners);

    return () => {
      keyListeners.delete(listener);
    };
  },
};

export function usePersistentSetting<T extends string>(
  key: string,
  fallback: T,
  isValid: (value: string) => value is T,
) {
  const subscribe = useCallback(
    (listener: Listener) => settingsStore.subscribe(key, listener),
    [key],
  );
  const getSnapshot = useCallback(() => {
    const storedValue = settingsStore.get(key);
    return storedValue && isValid(storedValue) ? storedValue : fallback;
  }, [fallback, isValid, key]);
  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);
  const setValue = useCallback((nextValue: T) => settingsStore.set(key, nextValue), [key]);

  return [value, setValue] as const;
}
