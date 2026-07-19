import { type Href } from 'expo-router';
import { TabList, TabSlot, Tabs, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

function WebTabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => ({
        backgroundColor: isFocused ? theme.colors.surfaceMuted : 'transparent',
        borderRadius: theme.radius.md,
        minHeight: 44,
        justifyContent: 'center',
        opacity: pressed ? 0.72 : 1,
        paddingHorizontal: theme.spacing.lg,
      })}
    >
      <AppText selectable={false} variant="label" tone={isFocused ? 'accent' : 'secondary'}>
        {children}
      </AppText>
    </Pressable>
  );
}

export default function WebTabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tabs style={{ height: '100%' }}>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            bottom: 0,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
            justifyContent: 'center',
            padding: theme.spacing.md,
            position: 'absolute',
            width: '100%',
          }}
        >
          <TabTrigger asChild href={'/home' as Href} name="home">
            <WebTabButton>{t('tabs.home')}</WebTabButton>
          </TabTrigger>
          <TabTrigger asChild href={'/calculations' as Href} name="calculations">
            <WebTabButton>{t('tabs.calculations')}</WebTabButton>
          </TabTrigger>
          <TabTrigger asChild href={'/compare' as Href} name="compare">
            <WebTabButton>{t('tabs.compare')}</WebTabButton>
          </TabTrigger>
          <TabTrigger asChild href={'/settings' as Href} name="settings">
            <WebTabButton>{t('tabs.settings')}</WebTabButton>
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}
