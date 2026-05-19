import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
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

  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);
  const searchRef = useRef<TextInput>(null);
  const anchorPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    fetchLivePrices(STOCKS.map((s) => s.symbol)).then((p) => {
      anchorPrices.current = p;
      setPrices(p);
      setLoadingPrices(false);
    });
  }, []);

  // Tick every 1.5 s: ±0.15% jitter, clamped to ±2% of anchor
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next: Record<string, number> = {};
        for (const sym of Object.keys(prev)) {
          const anchor = anchorPrices.current[sym] ?? prev[sym];
          const jitter = (Math.random() - 0.5) * 0.003;
          const raw = prev[sym] * (1 + jitter);
          next[sym] = Math.max(anchor * 0.98, Math.min(anchor * 1.02, raw));
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Scroll to top when search is focused so the search bar becomes visible
  const handleSearchFocus = () => {
    setSearchFocused(true);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // AppBar handles its own scroll-aware bg/border via the scrollY prop.

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return STOCKS;
    return STOCKS.filter(
      (s) => s.symbol.toLowerCase().includes(t) || s.name.toLowerCase().includes(t),
    );
  }, [q]);

  const enriched = useMemo(() => {
    const mapped = filtered.map((s) => ({
      ...s,
      pricePerShare: prices[s.symbol] ?? s.pricePerShare,
    }));
    mapped.sort((a, b) => b.pricePerShare * b.sharesHeld - a.pricePerShare * a.sharesHeld);
    return mapped;
  }, [filtered, prices]);

  const ListHeader = (
    <View>
      {/* Search field — scrolls with the list */}
      <View style={{ paddingHorizontal: spacing.l, paddingTop: spacing.m, paddingBottom: spacing.s }}>
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
            ref={searchRef}
            style={[type.bodyBase, styles.searchInput, { color: colors.contentPrimary }]}
            placeholder="Search here..."
            placeholderTextColor={colors.contentTertiary}
            value={q}
            onChangeText={setQ}
            onFocus={handleSearchFocus}
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

      {/* Column labels */}
      <View style={[styles.listHeader, { paddingHorizontal: spacing.l }]}>
        <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
          {enriched.length} stock{enriched.length !== 1 ? 's' : ''}
        </Text>
        <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
          Current/Invested
        </Text>
      </View>
    </View>
  );

  return (
    <Screen padded={false}>
      <AppBar
        title="Pick a stock"
        showBack
        leftTitle
        scrollY={scrollY}
      />

      <Animated.FlatList
        ref={listRef}
        data={enriched}
        keyExtractor={(s) => s.symbol}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.m }}
        ListHeaderComponent={ListHeader}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <StockListItem
            stock={item}
            isLast={index === enriched.length - 1}
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
    paddingTop: spacing.l,
    paddingBottom: spacing.s,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});
