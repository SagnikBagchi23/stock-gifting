import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/constants/theme';
import { radius, spacing, type } from '@/constants/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  const { colors } = useTheme();
  const bg = selected ? colors.backgroundAccent : colors.backgroundTertiary;
  const fg = selected ? colors.contentOnColour : colors.contentPrimary;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: bg }]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
    >
      <Text style={[type.bodyBaseHeavy, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 32,
    paddingHorizontal: spacing.l,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
