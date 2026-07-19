import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

export type SelectOption<T extends string> = Readonly<{ label: string; value: T }>;

type SelectFieldProps<T extends string> = {
  label: string;
  helperText?: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  modalTitle: string;
  cancelLabel: string;
  openAccessibilityLabel: string;
  selectedAccessibilityLabel: string;
};

export function SelectField<T extends string>({
  label,
  helperText,
  value,
  options,
  onChange,
  modalTitle,
  cancelLabel,
  openAccessibilityLabel,
  selectedAccessibilityLabel,
}: SelectFieldProps<T>) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const titleRef = useRef<Text>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  const focusTitle = () => {
    const node = findNodeHandle(titleRef.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  };

  if (!selectedOption) return null;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="label">{label}</AppText>
      <Pressable
        accessibilityLabel={openAccessibilityLabel}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          minHeight: 48,
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: theme.spacing.lg,
        })}
      >
        <AppText>{selectedOption.label}</AppText>
        <SymbolView
          name={{
            ios: 'chevron.up.chevron.down',
            android: 'unfold_more',
            web: 'unfold_more',
          }}
          size={18}
          tintColor={theme.colors.textSecondary}
        />
      </Pressable>
      {helperText ? (
        <AppText variant="helper" tone="secondary">
          {helperText}
        </AppText>
      ) : null}
      <Modal
        animationType={reducedMotion ? 'none' : 'fade'}
        onRequestClose={() => setIsOpen(false)}
        onShow={focusTitle}
        transparent
        visible={isOpen}
      >
        <View
          style={{
            backgroundColor: theme.colors.overlay,
            flex: 1,
            justifyContent: 'flex-end',
            padding: theme.spacing.lg,
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderCurve: 'continuous',
              borderRadius: theme.radius.xl,
              gap: theme.spacing.lg,
              maxHeight: '80%',
              padding: theme.spacing.xl,
            }}
          >
            <AppText ref={titleRef} accessibilityRole="header" variant="subtitle">
              {modalTitle}
            </AppText>
            <ScrollView contentInsetAdjustmentBehavior="automatic">
              {options.map((option, index) => {
                const selected = option.value === value;
                return (
                  <View key={option.value}>
                    <Pressable
                      accessibilityLabel={`${option.label}. ${selected ? selectedAccessibilityLabel : ''}`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      style={({ pressed }) => ({
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        minHeight: 52,
                        opacity: pressed ? 0.72 : 1,
                        paddingVertical: theme.spacing.sm,
                      })}
                    >
                      <AppText>{option.label}</AppText>
                      {selected ? (
                        <SymbolView
                          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                          size={20}
                          tintColor={theme.colors.accent}
                        />
                      ) : null}
                    </Pressable>
                    {index < options.length - 1 ? <Divider /> : null}
                  </View>
                );
              })}
            </ScrollView>
            <Button
              fullWidth
              label={cancelLabel}
              onPress={() => setIsOpen(false)}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
