import type { LocalDataSnapshot } from '@/data/repositories/types';

export type LocalDataExportOutcome = 'shared' | 'downloaded' | 'unavailable';

export async function exportLocalData(snapshot: LocalDataSnapshot): Promise<LocalDataExportOutcome> {
  if (typeof document === 'undefined') return 'unavailable';
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `hidden-cost-data-${snapshot.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
