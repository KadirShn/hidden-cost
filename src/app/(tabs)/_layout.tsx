import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.colors.surface}
      indicatorColor={theme.colors.surfaceMuted}
      tintColor={theme.colors.accent}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calculations">
        <NativeTabs.Trigger.Icon sf="doc.text" md="description" />
        <NativeTabs.Trigger.Label>{t('tabs.calculations')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="compare">
        <NativeTabs.Trigger.Icon sf="chart.bar.xaxis" md="compare" />
        <NativeTabs.Trigger.Label>{t('tabs.compare')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
        <NativeTabs.Trigger.Label>{t('tabs.settings')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
