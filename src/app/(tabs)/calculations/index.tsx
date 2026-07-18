import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout/screen';
import { EmptyState } from '@/components/ui/empty-state';

export default function CalculationsScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <EmptyState message={t('calculations.emptyBody')} title={t('calculations.emptyTitle')} />
    </Screen>
  );
}
