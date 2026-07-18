import { forwardRef } from 'react';

import { TextField, type TextFieldProps } from '@/components/ui/text-field';

import type { TextInput } from 'react-native';

type MoneyInputProps = TextFieldProps & { currency: string };

export const MoneyInput = forwardRef<TextInput, MoneyInputProps>(function MoneyInput(
  { currency, ...props },
  ref,
) {
  return (
    <TextField
      ref={ref}
      accessibilityHint={props.accessibilityHint ?? currency}
      inputMode="decimal"
      keyboardType="decimal-pad"
      {...props}
    />
  );
});
