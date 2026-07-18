import { useTranslation } from 'react-i18next';

import { TabStack } from '@/components/layout/tab-stack';

export default function HomeLayout() {
  const { t } = useTranslation();
  return <TabStack title={t('tabs.home')} />;
}
