import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { StockListItem } from '@/components/gift/StockListItem';
import { STOCKS } from '@/data/stocks';
import { fetchLivePrices } from '@/lib/prices';
import { radius, spacing, type } from '@/constants/tokens';
import { useTheme } from '@/constants/theme';

export default function PickStock() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
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

  const enriched = useMemo(() => {
    const mapped = filtered.map((s) => ({ ...s, pricePerShare: prices[s.symbol] ?? s.pricePerShare }));
    mapped.sort((a, b) => b.pricePerShare * b.sharesHeld - a.pricePerShare * a.sharesHeld);
    return mapped;
  }, [filtered, prices]);

  return (
    <Screen padded={false}>
      <AppBar title="Pick a stock" showBack />

      {/* Search input — styled like the welcome screen's text field */}
      <View style={[styles.searchContainer, { paddingHorizontal: spacing.l, paddingBottom: spacing.s }]}>
        <View
          style={[
            styles.searchField,
            {
              borderColor: searchFocused ? colors.borderNeutral : colors.borderPrimary,
              backgroundColor: colors.backgroundPrimary,
            },
          ]}
        >
          <Feather name="search" size={20} color={colors.contentTertiary} />
          <TextInput
            style={[type.bodyBase, styles.searchInput, { color: colors.contentPrimary }]}
            placeholder="Search here..."
            placeholderTextColor={colors.contentTertiary}
            value={q}
            onChangeText={setQ}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            selectionColor={colors.contentAccent}
          />
          {q.length > 0 && (
            <Feather
              name="x"
              size={18}
              color={colors.contentTertiary}
              onPress={() => setQ('')}
            />
          )}
        </View>
      </View>

      {loadingPrices && (
        <View style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
          <ActivityIndicator color={colors.contentAccent} size="small" />
        </View>
      )}

      {/* Header row: stock count left, column labels right */}
      <View style={[styles.listHeader, { paddingHorizontal: spacing.l }]}>
        <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
          {enriched.length} stock{enriched.length !== 1 ? 's' : ''}
        </Text>
        <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
          Current / Invested
        </Text>
      </View>

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
    paddingTop: spacing.m,
  },
  searchField: {
    height: 56,
    borderRadius: radius.l,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    gap: spacing.s,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});
