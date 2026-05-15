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
  /** Animated or static style overrides for the bar container (e.g. animated bg) */
  animatedStyle?: Animated.WithAnimatedValue<object>;
};

export function AppBar({ title, subtitle, leftTitle, showBack, right, animatedStyle }: Props) {
  const { colors } = useTheme();
  const router = useRouter();

  const withSubtitle = !!subtitle;
  const isLeftAligned = withSubtitle || !!leftTitle;

  return (
    <Animated.View
      style={[
        styles.bar,
        { borderBottomColor: colors.borderPrimary, backgroundColor: colors.backgroundPrimary },
        withSubtitle && styles.barTall,
        animatedStyle,
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
