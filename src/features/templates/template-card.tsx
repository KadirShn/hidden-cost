import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import type { TemplateDefinition } from '@/data/repositories/types';

type TemplateCardProps = {
  template: TemplateDefinition;
  title: string;
  description: string;
  openLabel: string;
  onPress: () => void;
};

export function TemplateCard({ title, description, openLabel, onPress }: TemplateCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${openLabel}: ${title}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      {({ pressed }) => (
        <Card elevated style={{ opacity: pressed ? 0.72 : 1 }}>
          <AppText variant="subtitle">{title}</AppText>
          <AppText selectable tone="secondary">
            {description}
          </AppText>
        </Card>
      )}
    </Pressable>
  );
}
