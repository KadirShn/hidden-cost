import { type Href, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const categories = [
    t('home.categoryCar'),
    t('home.categoryMotorcycle'),
    t('home.categoryBoat'),
    t('home.categoryElectronics'),
    t('home.categorySubscription'),
    t('home.categoryCustom'),
  ];

  return (
    <Screen>
      <Card elevated style={{ backgroundColor: theme.colors.surfaceElevated }}>
        <AppText selectable variant="title">
          {t('home.greeting')}
        </AppText>
        <AppText selectable tone="secondary">
          {t('home.body')}
        </AppText>
        <Button
          label={t('home.newCalculation')}
          onPress={() => router.push('/calculations' as Href)}
        />
      </Card>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="subtitle">{t('home.categoriesTitle')}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {categories.map((category) => (
            <Chip disabled key={category} label={category} />
          ))}
        </View>
      </View>

      <Card>
        <AppText variant="label" tone="accent">
          {t('home.insightLabel')}
        </AppText>
        <AppText selectable>{t('home.insight')}</AppText>
      </Card>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="subtitle">{t('home.recentTitle')}</AppText>
        <View accessible={false} style={{ gap: theme.spacing.sm }}>
          <LoadingSkeleton accessibilityLabel={t('app.initializing')} height={12} width="38%" />
          <LoadingSkeleton accessibilityLabel={t('app.initializing')} height={72} />
        </View>
        <EmptyState message={t('home.recentEmptyBody')} title={t('home.recentEmptyTitle')} />
      </View>
    </Screen>
  );
}
