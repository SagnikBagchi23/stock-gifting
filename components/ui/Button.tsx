import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, ActivityIndicator, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
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
  const scale = useRef(new Animated.Value(1)).current;

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

  const handlePressIn = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      damping: 20,
      stiffness: 400,
      mass: 0.8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 400,
      mass: 0.8,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.btn, { backgroundColor: bg }, style]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <Text style={[type.bodyLargeHeavy, { color: fg }]}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
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
