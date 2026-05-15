import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { radius, spacing, type } from '@/constants/tokens';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
};

export function TextField({ label, hint, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      {label && <Text style={[type.bodySmallHeavy, { color: colors.contentSecondary }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.contentTertiary}
        {...rest}
        style={[
          styles.input,
          {
            backgroundColor: colors.backgroundSurfaceZ1,
            borderColor: colors.borderPrimary,
            color: colors.contentPrimary,
            ...type.bodyLarge,
          },
          style,
        ]}
      />
      {hint && <Text style={[type.bodySmall, { color: colors.contentTertiary }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    minHeight: 48,
  },
});
