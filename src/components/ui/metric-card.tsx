import { AppText } from '@/components/ui/app-text';
import { Card, type CardProps } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';

type MetricCardProps = CardProps & {
  label: string;
  value: string;
  supportingText?: string;
};

export function MetricCard({ label, value, supportingText, ...props }: MetricCardProps) {
  const theme = useTheme();

  return (
    <Card
      accessible
      accessibilityHint={supportingText}
      accessibilityLabel={`${label}: ${value}`}
      {...props}
    >
      <AppText variant="label" tone="secondary">
        {label}
      </AppText>
      <AppText selectable variant="metric" style={{ color: theme.colors.textPrimary }}>
        {value}
      </AppText>
      {supportingText ? (
        <AppText variant="helper" tone="secondary">
          {supportingText}
        </AppText>
      ) : null}
    </Card>
  );
}
