import Stack from 'expo-router/stack';

import { useTheme } from '@/hooks/use-theme';

export function TabStack({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerBackButtonDisplayMode: 'minimal',
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: { color: theme.colors.textPrimary },
      }}
    >
      <Stack.Screen name="index" options={{ title }} />
    </Stack>
  );
}
