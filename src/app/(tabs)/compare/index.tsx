import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout/screen';
import { EmptyState } from '@/components/ui/empty-state';

export default function CompareScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <EmptyState message={t('compare.emptyBody')} title={t('compare.emptyTitle')} />
    </Screen>
  );
}
