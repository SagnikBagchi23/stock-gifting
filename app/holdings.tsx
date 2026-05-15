import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { StockAvatar } from '@/components/ui/StockAvatar';
import { useTheme } from '@/constants/theme';
import { spacing, type, radius } from '@/constants/tokens';
import { listMyHoldings } from '@/lib/gifts';
import { getDisplayName } from '@/lib/identity';
import { formatINR, formatShares } from '@/utils/format';
import type { Gift } from '@/types';

export default function Holdings() {
  const { colors } = useTheme();
  const [name, setName] = useState<string | null>(null);
  const [items, setItems] = useState<Gift[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const total = items.reduce((acc, g) => acc + Number(g.total_value || 0), 0);

  return (
    <Screen padded={false}>
      <AppBar title="My holdings" showBack />
      <FlatList
        data={items}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: spacing.l, gap: spacing.s }}
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
        renderItem={({ item }) => (
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
            <Text style={[type.bodyBaseHeavy, { color: colors.contentPrimary }]}>
              {formatINR(item.total_value)}
            </Text>
          </View>
        )}
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
