import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/constants/theme';
import { radius, spacing, type } from '@/constants/tokens';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const { colors } = useTheme();

  // Per [[feedback_mint_text_on_accent.md]]: text/icons on accent backgrounds are WHITE (contentOnColour).
  const bg =
    disabled
      ? colors.backgroundDisabled
      : variant === 'primary'
        ? colors.backgroundAccent
        : variant === 'secondary'
          ? colors.backgroundTertiary
          : 'transparent';

  const fg =
    disabled
      ? colors.contentDisabled
      : variant === 'primary'
        ? colors.contentOnColour
        : colors.contentPrimary;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: pressed && !disabled ? 0.85 : 1 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[type.bodyLargeHeavy, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
  },
});
