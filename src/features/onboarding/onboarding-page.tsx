import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useTheme } from '@/hooks/use-theme';

import type { PropsWithChildren } from 'react';

type OnboardingPageProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  body: string;
  stepLabel: string;
  currentStep: number;
  totalSteps: number;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}>;

export function OnboardingPage({
  eyebrow,
  title,
  body,
  stepLabel,
  currentStep,
  totalSteps,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  children,
}: OnboardingPageProps) {
  const theme = useTheme();

  return (
    <Screen contentStyle={{ justifyContent: 'space-between', minHeight: '100%' }}>
      <View style={{ gap: theme.spacing.xl }}>
        <StepIndicator currentStep={currentStep} label={stepLabel} totalSteps={totalSteps} />
        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="label" tone="accent">
            {eyebrow}
          </AppText>
          <AppText accessibilityRole="header" selectable variant="display">
            {title}
          </AppText>
          <AppText selectable tone="secondary">
            {body}
          </AppText>
        </View>
        {children}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {secondaryLabel && onSecondaryPress ? (
          <Button label={secondaryLabel} onPress={onSecondaryPress} variant="secondary" />
        ) : null}
        <Button
          fullWidth
          label={primaryLabel}
          onPress={onPrimaryPress}
          testID="onboarding-primary"
        />
      </View>
    </Screen>
  );
}
