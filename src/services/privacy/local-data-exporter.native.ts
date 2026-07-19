import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { LocalDataSnapshot } from '@/data/repositories/types';

import type { LocalDataExportOutcome } from './local-data-exporter';

export async function exportLocalData(
  snapshot: LocalDataSnapshot,
): Promise<LocalDataExportOutcome> {
  const file = new File(Paths.cache, `hidden-cost-data-${snapshot.exportedAt.slice(0, 10)}.json`);
  try {
    file.write(JSON.stringify(snapshot, null, 2));
    if (!(await Sharing.isAvailableAsync())) return 'unavailable';
    await Sharing.shareAsync(file.uri, {
      dialogTitle: 'Hidden Cost data export',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
    return 'shared';
  } finally {
    if (file.exists) file.delete();
  }
}
