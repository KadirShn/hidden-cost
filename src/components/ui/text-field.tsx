import { forwardRef, useEffect, useId } from 'react';
import { AccessibilityInfo, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  helperText?: string;
  errorText?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    helperText,
    errorText,
    style,
    accessibilityHint,
    accessibilityLabel,
    editable,
    ...props
  },
  ref,
) {
  const theme = useTheme();
  const nativeID = useId();
  const supportingText = errorText ?? helperText;

  useEffect(() => {
    if (errorText) AccessibilityInfo.announceForAccessibility(`${label}. ${errorText}`);
  }, [errorText, label]);

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AppText nativeID={`${nativeID}-label`} variant="label">
        {label}
      </AppText>
      <TextInput
        ref={ref}
        {...props}
        accessibilityHint={errorText ?? accessibilityHint}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityLabelledBy={`${nativeID}-label`}
        accessibilityState={{ disabled: editable === false }}
        editable={editable}
        placeholderTextColor={theme.colors.textSecondary}
        selectionColor={theme.colors.accent}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: errorText ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            color: theme.colors.textPrimary,
            paddingHorizontal: theme.spacing.lg,
          },
          style,
        ]}
      />
      {supportingText ? (
        <AppText
          accessibilityLiveRegion={errorText ? 'assertive' : 'none'}
          accessibilityRole={errorText ? 'alert' : undefined}
          nativeID={`${nativeID}-supporting`}
          selectable
          tone={errorText ? 'danger' : 'secondary'}
          variant="helper"
        >
          {supportingText}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  input: { borderWidth: 1, fontSize: 16, minHeight: 48 },
});
