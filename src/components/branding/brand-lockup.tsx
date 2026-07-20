import { Image, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

type BrandLockupProps = {
  name: string;
  tagline?: string;
  compact?: boolean;
};

export function BrandLockup({ name, tagline, compact = false }: BrandLockupProps) {
  const theme = useTheme();
  const markSize = compact ? 52 : 64;

  return (
    <View
      accessible
      accessibilityLabel={tagline ? `${name}. ${tagline}` : name}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.brandSurface,
          borderCurve: 'continuous',
          borderRadius: theme.radius.md,
          height: markSize,
          justifyContent: 'center',
          overflow: 'hidden',
          width: markSize,
        }}
      >
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={require('../../../assets/brand/brand-mark.png')}
          style={{ height: markSize, width: markSize }}
        />
      </View>
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <AppText accessibilityRole="header" selectable variant={compact ? 'subtitle' : 'title'}>
          {name}
        </AppText>
        {tagline ? (
          <AppText selectable tone="secondary" variant="helper">
            {tagline}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
