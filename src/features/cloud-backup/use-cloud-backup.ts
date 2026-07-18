import { useContext } from 'react';

import { CloudBackupContext } from './cloud-backup-provider';

export function useCloudBackup() {
  const value = useContext(CloudBackupContext);
  if (!value) throw new Error('useCloudBackup must be used inside CloudBackupProvider');
  return value;
}
