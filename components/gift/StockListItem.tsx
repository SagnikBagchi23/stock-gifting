import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { spacing, type } from '@/constants/tokens';
import { StockAvatar } from '@/components/ui/StockAvatar';
import type { Stock } from '@/types';
import { formatINR } from '@/utils/format';

type Props = {
  stock: Stock;
  onPress?: () => void;
};

export function StockListItem({ stock, onPress }: Props) {
  const { colors } = useTheme();
  const currentValue = stock.pricePerShare * stock.sharesHeld;
  const currentValueColor =
    currentValue > stock.investedValue
      ? colors.contentPositive
      : currentValue < stock.investedValue
        ? colors.contentNegative
        : colors.contentPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.backgroundSurfaceZ1 : colors.backgroundPrimary },
      ]}
    >
      {/* Avatar */}
      <StockAvatar symbol={stock.symbol} size={40} />

      {/* Middle: name + shares */}
      <View style={styles.middle}>
        <Text
          style={[type.bodyBaseHeavy, { color: colors.contentPrimary }]}
          numberOfLines={1}
        >
          {stock.name}
        </Text>
        <Text
          style={[type.bodySmall, { color: colors.contentSecondary }]}
          numberOfLines={1}
        >
          {stock.sharesHeld.toLocaleString('en-IN')} shares
        </Text>
      </View>

      {/* End: current value + invested */}
      <View style={styles.end}>
        <Text
          style={[type.bodyBaseHeavy, { color: currentValueColor, textAlign: 'right' }]}
          numberOfLines={1}
        >
          {formatINR(currentValue)}
        </Text>
        <Text
          style={[type.bodySmall, { color: colors.contentSecondary, textAlign: 'right' }]}
          numberOfLines={1}
        >
          {formatINR(stock.investedValue)}
        </Text>
      </View>

      {/* Divider indented to align with text (16 pad + 40 avatar + 16 gap = 72) */}
      <View
        style={[styles.divider, { backgroundColor: colors.borderPrimary }]}
        pointerEvents="none"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    gap: spacing.l,
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  end: {
    maxWidth: 110,
    gap: 2,
    alignItems: 'flex-end',
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 72, // 16 (padding) + 40 (avatar) + 16 (gap)
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
