import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { StockListItem } from '@/components/gift/StockListItem';
import { STOCKS } from '@/data/stocks';
import { fetchLivePrices } from '@/lib/prices';
import { spacing, type } from '@/constants/tokens';
import { useTheme } from '@/constants/theme';

export default function PickStock() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    fetchLivePrices(STOCKS.map((s) => s.symbol)).then((p) => {
      setPrices(p);
      setLoadingPrices(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return STOCKS;
    return STOCKS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(t) ||
        s.name.toLowerCase().includes(t),
    );
  }, [q]);

  const enriched = useMemo(
    () => filtered.map((s) => ({ ...s, pricePerShare: prices[s.symbol] ?? s.pricePerShare })),
    [filtered, prices],
  );

  return (
    <Screen padded={false}>
      <AppBar title="Pick a stock" showBack />

      {/* Sticky pill search bar — keyboard overlays the list, no KAV */}
      <View style={[styles.searchContainer, { paddingHorizontal: spacing.l, paddingBottom: spacing.s }]}>
        <View style={[styles.searchPill, { backgroundColor: colors.backgroundSurfaceZ1 }]}>
          <Text style={[styles.searchIcon, { color: colors.contentTertiary }]}>⌕</Text>
          <TextInput
            style={[type.bodyBase, styles.searchInput, { color: colors.contentPrimary }]}
            placeholder="Search here..."
            placeholderTextColor={colors.contentTertiary}
            value={q}
            onChangeText={setQ}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            selectionColor={colors.contentAccent}
          />
          {q.length > 0 && (
            <Text
              onPress={() => setQ('')}
              style={[styles.clearBtn, { color: colors.contentTertiary }]}
            >
              ✕
            </Text>
          )}
        </View>
      </View>

      {loadingPrices && (
        <View style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
          <ActivityIndicator color={colors.contentAccent} size="small" />
        </View>
      )}

      <FlatList
        data={enriched}
        keyExtractor={(s) => s.symbol}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.m }}
        renderItem={({ item }) => (
          <StockListItem
            stock={item}
            onPress={() => router.push(`/send/${item.symbol}?price=${item.pricePerShare}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[type.bodyBase, { color: colors.contentTertiary }]}>No stocks found</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingTop: spacing.s,
  },
  searchPill: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  clearBtn: {
    fontSize: 14,
    paddingHorizontal: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});
