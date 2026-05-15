import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AmountInput } from '@/components/gift/AmountInput';
import { StockAvatar } from '@/components/ui/StockAvatar';
import { findStock } from '@/data/stocks';
import { useTheme } from '@/constants/theme';
import { spacing, type, radius } from '@/constants/tokens';
import { formatINR } from '@/utils/format';
import { createGift } from '@/lib/gifts';
import { getDisplayName } from '@/lib/identity';
import type { GiftUnit } from '@/types';

export default function ComposeGift() {
  const { symbol, price: priceParam } = useLocalSearchParams<{ symbol: string; price?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const stock = findStock(symbol ?? '');
  const [unit, setUnit] = useState<GiftUnit>('rupees');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [senderName, setSenderName] = useState<string | null>(null);

  // Prefer live price passed from the list screen; fall back to catalog stale value
  const livePrice = priceParam ? parseFloat(priceParam) : NaN;
  const pricePerShare = Number.isFinite(livePrice) && livePrice > 0
    ? livePrice
    : (stock?.pricePerShare ?? 0);

  useEffect(() => {
    getDisplayName().then(setSenderName);
  }, []);

  const qty = parseFloat(amount);

  const totalValue = useMemo(() => {
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    return unit === 'shares' ? qty * pricePerShare : qty;
  }, [qty, unit, pricePerShare]);

  if (!stock) {
    return (
      <Screen>
        <AppBar title="Send" showBack />
        <Text style={[type.bodyBase, { color: colors.contentPrimary }]}>Stock not found.</Text>
      </Screen>
    );
  }

  const canSend = senderName && Number.isFinite(qty) && qty > 0 && !submitting;

  return (
    <Screen padded={false}>
      <AppBar title={`Gift ${stock.symbol}`} showBack />
      <ScrollView
        contentContainerStyle={{ padding: spacing.l, gap: spacing.l }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.stockHead,
            {
              backgroundColor: colors.backgroundSurfaceZ1,
              borderColor: colors.borderPrimary,
              borderRadius: radius.l,
            },
          ]}
        >
          <StockAvatar symbol={stock.symbol} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={[type.bodyLargeHeavy, { color: colors.contentPrimary }]}>
              {stock.symbol}
            </Text>
            <Text style={[type.bodySmall, { color: colors.contentSecondary }]} numberOfLines={1}>
              {stock.name}
            </Text>
          </View>
          <Text style={[type.bodyBaseHeavy, { color: colors.contentPrimary }]}>
            {formatINR(pricePerShare)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.s }}>
          <Chip
            label="By amount"
            selected={unit === 'rupees'}
            onPress={() => { setUnit('rupees'); setAmount(''); }}
          />
          <Chip
            label="By shares"
            selected={unit === 'shares'}
            onPress={() => { setUnit('shares'); setAmount(''); }}
          />
        </View>

        <AmountInput unit={unit} value={amount} onChange={setAmount} />

        {totalValue > 0 && (
          <Text style={[type.bodyBase, { color: colors.contentSecondary, textAlign: 'center' }]}>
            Total value:{' '}
            <Text style={{ color: colors.contentPrimary }}>{formatINR(totalValue)}</Text>
          </Text>
        )}

        <TextField
          label="Note (optional)"
          placeholder="Happy birthday!"
          value={note}
          onChangeText={setNote}
          maxLength={200}
          multiline
        />

        <Button
          title={submitting ? 'Sending…' : 'Send Gift'}
          loading={submitting}
          disabled={!canSend}
          onPress={async () => {
            if (!senderName) return;
            setSubmitting(true);
            const res = await createGift({
              senderName,
              stockSymbol: stock.symbol,
              unit,
              quantity: unit === 'shares' ? Math.floor(qty) : qty,
              note: note.trim() || undefined,
              pricePerShare,
            });
            setSubmitting(false);
            if ('error' in res) {
              Alert.alert('Could not send gift', res.error);
              return;
            }
            router.replace(`/send/sent?id=${res.id}`);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    padding: spacing.m,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
