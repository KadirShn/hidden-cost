import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';

type LegalDocument = 'privacy' | 'terms' | 'disclaimer';

function isLegalDocument(value: string): value is LegalDocument {
  return value === 'privacy' || value === 'terms' || value === 'disclaimer';
}

export function LegalScreen() {
  const { document = 'privacy' } = useLocalSearchParams<{ document: string }>();
  const { t } = useTranslation();
  const selected: LegalDocument = isLegalDocument(document) ? document : 'privacy';

  return (
    <Screen>
      <Stack.Screen options={{ title: t(`legal.${selected}Title`) }} />
      <AppText variant="title">{t(`legal.${selected}Title`)}</AppText>
      <Card>
        <AppText selectable>{t(`legal.${selected}Body`)}</AppText>
      </Card>
      <AppText selectable tone="warning" variant="helper">
        {t('legal.placeholderWarning')}
      </AppText>
    </Screen>
  );
}
