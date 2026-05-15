import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { TextField } from '@/components/ui/TextField';
import { StockListItem } from '@/components/gift/StockListItem';
import { STOCKS } from '@/data/stocks';
import { fetchLivePrices } from '@/lib/prices';
import { spacing } from '@/constants/tokens';
import { useTheme } from '@/constants/theme';

export default function PickStock() {
  const router = useRouter();
  const { colors } = useTheme();
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
      (s) => s.symbol.toLowerCase().includes(t) || s.name.toLowerCase().includes(t),
    );
  }, [q]);

  // Merge live price into each stock; fall back to hardcoded if fetch failed
  const enriched = useMemo(
    () => filtered.map((s) => ({ ...s, pricePerShare: prices[s.symbol] ?? s.pricePerShare })),
    [filtered, prices],
  );

  return (
    <Screen padded={false}>
      <AppBar title="Pick a stock" showBack />
      <View style={{ padding: spacing.l, paddingBottom: spacing.s }}>
        <TextField
          placeholder="Search RELIANCE, TCS, Swiggy…"
          value={q}
          onChangeText={setQ}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>
      {loadingPrices && (
        <View style={{ alignItems: 'center', paddingVertical: spacing.m }}>
          <ActivityIndicator color={colors.contentAccent} />
        </View>
      )}
      <FlatList
        data={enriched}
        keyExtractor={(s) => s.symbol}
        contentContainerStyle={{ padding: spacing.l, paddingTop: spacing.s, gap: spacing.s }}
        renderItem={({ item }) => (
          <StockListItem
            stock={item}
            onPress={() => router.push(`/send/${item.symbol}?price=${item.pricePerShare}`)}
          />
        )}
      />
    </Screen>
  );
}
