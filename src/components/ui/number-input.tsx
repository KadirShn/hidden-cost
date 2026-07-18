import { forwardRef } from 'react';

import { TextField, type TextFieldProps } from '@/components/ui/text-field';

import type { TextInput } from 'react-native';

export const NumberInput = forwardRef<TextInput, TextFieldProps>(function NumberInput(props, ref) {
  return <TextField ref={ref} inputMode="decimal" keyboardType="decimal-pad" {...props} />;
});
