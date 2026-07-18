import { useEffect, useState } from 'react';
import { Animated, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

type LoadingSkeletonProps = {
  width?: ViewStyle['width'];
  height?: number;
  accessibilityLabel: string;
};

export function LoadingSkeleton({
  width = '100%',
  height = 20,
  accessibilityLabel,
}: LoadingSkeletonProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(0.45));

  useEffect(() => {
    if (reducedMotion) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { duration: 650, toValue: 0.85, useNativeDriver: true }),
        Animated.timing(opacity, { duration: 650, toValue: 0.45, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      style={{
        backgroundColor: theme.colors.skeleton,
        borderRadius: theme.radius.sm,
        height,
        opacity: reducedMotion ? 0.65 : opacity,
        width,
      }}
    />
  );
}
