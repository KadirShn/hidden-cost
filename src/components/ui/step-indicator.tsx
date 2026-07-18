import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  label: string;
};

export function StepIndicator({ currentStep, totalSteps, label }: StepIndicatorProps) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      style={{ gap: theme.spacing.sm }}
    >
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={{
              backgroundColor:
                index < currentStep ? theme.colors.accent : theme.colors.surfaceMuted,
              borderRadius: theme.radius.pill,
              flex: 1,
              height: 5,
            }}
          />
        ))}
      </View>
      <AppText variant="helper" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}
