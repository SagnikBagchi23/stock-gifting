import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { spacing, type } from '@/constants/tokens';
import { useRouter } from 'expo-router';

type Props = {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export function AppBar({ title, showBack, right }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={[styles.bar, { borderBottomColor: colors.borderPrimary }]}>
      <View style={styles.side}>
        {showBack && (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[type.bodyLargeHeavy, { color: colors.contentPrimary }]}>‹</Text>
          </Pressable>
        )}
      </View>
      <Text style={[type.headingSmall, { color: colors.contentPrimary }]} numberOfLines={1}>
        {title ?? ''}
      </Text>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 36, alignItems: 'flex-start' },
});
