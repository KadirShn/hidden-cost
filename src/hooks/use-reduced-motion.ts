import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion() {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    let isActive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isActive) setIsReducedMotionEnabled(isEnabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotionEnabled,
    );

    return () => {
      isActive = false;
      subscription.remove();
    };
  }, []);

  return isReducedMotionEnabled;
}
