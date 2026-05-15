import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { radius, spacing, type } from '@/constants/tokens';
import { StockAvatar } from '@/components/ui/StockAvatar';
import type { Stock } from '@/types';
import { formatINR } from '@/utils/format';

type Props = {
  stock: Stock;
  onPress?: () => void;
};

export function StockListItem({ stock, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? colors.backgroundSurfaceZ2 : colors.backgroundSurfaceZ1,
          borderColor: colors.borderPrimary,
          borderRadius: radius.m,
        },
      ]}
    >
      <StockAvatar symbol={stock.symbol} />
      <View style={styles.text}>
        <Text style={[type.bodyLargeHeavy, { color: colors.contentPrimary }]} numberOfLines={1}>
          {stock.symbol}
        </Text>
        <Text style={[type.bodySmall, { color: colors.contentSecondary }]} numberOfLines={1}>
          {stock.name}
        </Text>
      </View>
      <Text style={[type.bodyBaseHeavy, { color: colors.contentPrimary }]}>
        {formatINR(stock.pricePerShare)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    padding: spacing.m,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1 },
});
