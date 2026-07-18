import { forwardRef } from 'react';

import { TextField, type TextFieldProps } from '@/components/ui/text-field';
import { useSettings } from '@/features/settings/use-settings';
import { formatLocalizedMoneyInput } from '@/utils/format';

import type { TextInput } from 'react-native';

type MoneyInputProps = TextFieldProps & { currency: string };

export const MoneyInput = forwardRef<TextInput, MoneyInputProps>(function MoneyInput(
  { currency, onBlur, onChangeText, value, ...props },
  ref,
) {
  const { locale } = useSettings();

  return (
    <TextField
      ref={ref}
      accessibilityHint={props.accessibilityHint ?? currency}
      inputMode="decimal"
      keyboardType="decimal-pad"
      onBlur={(event) => {
        if (value && onChangeText) {
          const formatted = formatLocalizedMoneyInput(value, locale);
          if (formatted) onChangeText(formatted);
        }
        onBlur?.(event);
      }}
      onChangeText={onChangeText}
      value={value}
      {...props}
    />
  );
});
