import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { StockAvatar } from '@/components/ui/StockAvatar';
import { useTheme } from '@/constants/theme';
import { spacing, type, radius } from '@/constants/tokens';
import { listMyHoldings } from '@/lib/gifts';
import { getDisplayName } from '@/lib/identity';
import { formatINR, formatShares } from '@/utils/format';
import type { Gift } from '@/types';

// Deterministic simulated P&L: ~40% of holdings show a loss, ~60% show a gain.
// Uses a string hash of the gift ID so the result is stable across renders.
function simulatedCurrentValue(gift: Gift): number {
  let hash = 0;
  for (let i = 0; i < gift.id.length; i++) {
    hash = ((hash << 5) - hash + gift.id.charCodeAt(i)) | 0;
  }
  const n = ((hash & 0x7fffffff) % 1000) / 1000; // 0..1
  const multiplier = n < 0.4
    ? 1 - 0.05 - n * 0.375   // loss: -5% to -20%
    : 1 + 0.02 + (n - 0.4) * 0.383; // gain: +2% to +25%
  return Math.round(gift.total_value * multiplier * 100) / 100;
}

export default function Holdings() {
  const { colors } = useTheme();
  const [name, setName] = useState<string | null>(null);
  const [items, setItems] = useState<Gift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const refresh = useCallback(async (n: string) => {
    setRefreshing(true);
    setItems(await listMyHoldings(n));
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getDisplayName().then((n) => {
      setName(n);
      if (n) refresh(n);
    });
  }, [refresh]);

  const total = items.reduce((acc, g) => acc + simulatedCurrentValue(g), 0);

  return (
    <Screen padded={false} scrollY={scrollY}>
      <AppBar title="My holdings" showBack scrollY={scrollY} />
      <Animated.FlatList
        data={items}
        keyExtractor={(g: Gift) => g.id}
        contentContainerStyle={{ padding: spacing.l, gap: spacing.s }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => name && refresh(name)}
            tintColor={colors.contentAccent}
          />
        }
        ListHeaderComponent={
          <View
            style={[
              styles.portfolioCard,
              {
                backgroundColor: colors.backgroundAccentSubtle,
                borderRadius: radius.l,
                marginBottom: spacing.m,
              },
            ]}
          >
            <Text style={[type.headingEyebrow, { color: colors.contentAccent }]}>
              Portfolio value
            </Text>
            <Text style={[type.displayBase, { color: colors.contentPrimary }]}>
              {formatINR(total)}
            </Text>
            <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
              {items.length} stock{items.length === 1 ? '' : 's'} received as gifts
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={[type.bodyBase, { color: colors.contentSecondary }]}>
            No stocks yet. Ask a friend to gift you one!
          </Text>
        }
        renderItem={({ item }) => {
          const currentValue = simulatedCurrentValue(item);
          const isLoss = currentValue < item.total_value;
          return (
          <View
            style={[
              styles.row,
              {
                backgroundColor: colors.backgroundSurfaceZ1,
                borderColor: colors.borderPrimary,
                borderRadius: radius.m,
              },
            ]}
          >
            <StockAvatar symbol={item.stock_symbol} />
            <View style={{ flex: 1 }}>
              <Text style={[type.bodyLargeHeavy, { color: colors.contentPrimary }]}>
                {item.stock_symbol}
              </Text>
              <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
                {item.unit === 'shares'
                  ? `${formatShares(item.quantity)} share${item.quantity === 1 ? '' : 's'}`
                  : `${formatINR(item.quantity)} invested`}
                {' · from '}
                {item.sender_name}
              </Text>
            </View>
            <Text style={[type.bodyBaseHeavy, { color: isLoss ? colors.contentNegative : colors.contentPrimary }]}>
              {formatINR(currentValue)}
            </Text>
          </View>
        );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  portfolioCard: { padding: spacing.l, gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    padding: spacing.m,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
