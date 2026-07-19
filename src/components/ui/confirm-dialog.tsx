import { useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Modal, Text, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const titleRef = useRef<Text>(null);

  const focusTitle = () => {
    const node = findNodeHandle(titleRef.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  };

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onCancel}
      onShow={focusTitle}
      transparent
      visible={visible}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.overlay,
          flex: 1,
          justifyContent: 'center',
          padding: theme.spacing.xl,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderCurve: 'continuous',
            borderRadius: theme.radius.xl,
            gap: theme.spacing.lg,
            maxWidth: 460,
            padding: theme.spacing.xl,
            width: '100%',
          }}
        >
          <AppText ref={titleRef} accessibilityRole="header" variant="subtitle">
            {title}
          </AppText>
          <AppText selectable tone="secondary">
            {message}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            <Button label={cancelLabel} onPress={onCancel} variant="secondary" />
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
