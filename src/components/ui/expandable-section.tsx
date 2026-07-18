import { useState, type PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

type ExpandableSectionProps = PropsWithChildren<{
  title: string;
  expandLabel: string;
  collapseLabel: string;
}>;

export function ExpandableSection({
  title,
  expandLabel,
  collapseLabel,
  children,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        overflow: 'hidden',
      }}
    >
      <Pressable
        accessibilityLabel={expanded ? collapseLabel : expandLabel}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.72 : 1,
          padding: theme.spacing.lg,
        })}
      >
        <AppText variant="subtitle">{title}</AppText>
      </Pressable>
      {expanded ? (
        <View style={{ gap: theme.spacing.md, padding: theme.spacing.lg, paddingTop: 0 }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}
