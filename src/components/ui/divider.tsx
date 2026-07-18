import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function Divider({ style, ...props }: ViewProps) {
  const theme = useTheme();
  return <View style={[{ backgroundColor: theme.colors.border, height: 1 }, style]} {...props} />;
}
