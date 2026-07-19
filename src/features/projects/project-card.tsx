import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import type { CostProject } from '@/domain';
import { useTheme } from '@/hooks/use-theme';

type ProjectCardProps = {
  project: CostProject;
  categoryLabel: string;
  statusLabel: string;
  amountLabel: string;
  openLabel: string;
  onPress: () => void;
};

export function ProjectCard({
  project,
  categoryLabel,
  statusLabel,
  amountLabel,
  openLabel,
  onPress,
}: ProjectCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={`${openLabel}: ${project.title}. ${categoryLabel}. ${statusLabel}. ${amountLabel}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      {({ pressed }) => (
        <Card elevated style={{ opacity: pressed ? 0.72 : 1 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            <Chip disabled label={categoryLabel} />
            <Chip disabled label={statusLabel} selected={project.status === 'complete'} />
          </View>
          <AppText variant="subtitle">{project.title}</AppText>
          <AppText selectable variant="metric">
            {amountLabel}
          </AppText>
        </Card>
      )}
    </Pressable>
  );
}
