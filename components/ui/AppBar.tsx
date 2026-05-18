import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import { spacing, type } from '@/constants/tokens';
import { useRouter } from 'expo-router';

type Props = {
  title?: string;
  subtitle?: string;
  /** Left-align the title (default: centered via space-between) */
  leftTitle?: boolean;
  showBack?: boolean;
  right?: React.ReactNode;
  /**
   * Scroll position driver. When provided, the bar fades from
   * (backgroundPrimary, no border) at the top to
   * (backgroundSurfaceZ1, borderPrimary) once content overflows.
   */
  scrollY?: Animated.Value;
  /** Override the resting background color (e.g. for tinted screens). */
  bgColor?: string;
};

export function AppBar({ title, subtitle, leftTitle, showBack, right, scrollY, bgColor }: Props) {
  const { colors } = useTheme();
  const router = useRouter();

  const withSubtitle = !!subtitle;
  const isLeftAligned = withSubtitle || !!leftTitle;

  const restingBg = bgColor ?? colors.backgroundPrimary;
  const bg = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 8],
        outputRange: [restingBg, colors.backgroundSurfaceZ1],
        extrapolate: 'clamp',
      })
    : restingBg;
  const border = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 8],
        outputRange: ['transparent', colors.borderPrimary],
        extrapolate: 'clamp',
      })
    : 'transparent';

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: bg, borderBottomColor: border },
        withSubtitle && styles.barTall,
      ]}
    >
      <View style={styles.side}>
        {showBack && (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={colors.contentPrimary} />
          </Pressable>
        )}
      </View>

      {withSubtitle ? (
        <View style={styles.titleBlock}>
          <Text style={[type.headingSmall, { color: colors.contentPrimary }]} numberOfLines={1}>
            {title ?? ''}
          </Text>
          <Text style={[type.bodySmall, { color: colors.contentSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      ) : isLeftAligned ? (
        <Text
          style={[type.headingSmall, { color: colors.contentPrimary, flex: 1 }]}
          numberOfLines={1}
        >
          {title ?? ''}
        </Text>
      ) : (
        <Text style={[type.headingSmall, { color: colors.contentPrimary }]} numberOfLines={1}>
          {title ?? ''}
        </Text>
      )}

      <View style={styles.side}>{right}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barTall: {
    height: 64,
  },
  side: { width: 36, alignItems: 'flex-start' },
  titleBlock: { flex: 1, gap: 2 },
});
