import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { Button } from '@/components/ui/Button';
import { Numpad } from '@/components/gift/Numpad';
import { findStock } from '@/data/stocks';
import { useTheme } from '@/constants/theme';
import { spacing, type, radius, fonts } from '@/constants/tokens';
import { formatINR, formatShares } from '@/utils/format';
import type { GiftUnit } from '@/types';

const QUICK_AMOUNTS = ['1000', '2000', '5000'];
const QUICK_SHARES = ['1', '5', '10'];

export default function ComposeGift() {
  const { symbol, price: priceParam } = useLocalSearchParams<{ symbol: string; price?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const stock = findStock(symbol ?? '');

  const [unit, setUnit] = useState<GiftUnit>('rupees');
  const [amount, setAmount] = useState('');

  // Cursor blink
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  // Amount scale punch on keypress
  const amountScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [cursorOpacity]);

  const punchAmount = () => {
    amountScale.setValue(0.95);
    Animated.spring(amountScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 350,
    }).start();
  };

  const livePrice = priceParam ? parseFloat(priceParam) : NaN;
  const pricePerShare =
    Number.isFinite(livePrice) && livePrice > 0 ? livePrice : stock?.pricePerShare ?? 0;

  if (!stock) {
    return (
      <Screen>
        <AppBar title="Send" showBack />
        <Text style={[type.bodyBase, { color: colors.contentPrimary }]}>Stock not found.</Text>
      </Screen>
    );
  }

  const subtitle = `${formatShares(stock.sharesHeld)} shares • ${formatINR(stock.investedValue)}`;
  const quickValues = unit === 'rupees' ? QUICK_AMOUNTS : QUICK_SHARES;
  const qty = parseFloat(amount);
  const canContinue = Number.isFinite(qty) && qty > 0;

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setAmount((prev) => prev.slice(0, -1));
      punchAmount();
      return;
    }
    if (key === '.') {
      if (unit === 'shares') return;
      if (amount.includes('.')) return;
      setAmount((prev) => (prev === '' ? '0.' : prev + '.'));
      punchAmount();
      return;
    }
    if (amount === '0') {
      setAmount(key);
      punchAmount();
      return;
    }
    if (amount.length >= 10) return;
    setAmount((prev) => prev + key);
    punchAmount();
  };

  const handleTabChange = (u: GiftUnit) => {
    if (u === unit) return;
    Haptics.selectionAsync();
    setUnit(u);
    setAmount('');
  };

  return (
    <Screen padded={false}>
      <AppBar title={stock.symbol} subtitle={subtitle} showBack />

      {/* Center content */}
      <View style={styles.body}>
        <View style={styles.centerContent}>
          {/* Amount / Quantity toggle */}
          <View
            style={[
              styles.segmentTrack,
              { backgroundColor: colors.backgroundSurfaceZ1, borderColor: colors.borderPrimary },
            ]}
          >
            {(['rupees', 'shares'] as const).map((u) => {
              const selected = unit === u;
              return (
                <Pressable
                  key={u}
                  onPress={() => handleTabChange(u)}
                  style={[
                    styles.segmentPill,
                    {
                      backgroundColor: selected ? colors.backgroundTertiary : 'transparent',
                      borderWidth: selected ? 1 : 0,
                      borderColor: selected ? colors.borderNeutral : 'transparent',
                    },
                  ]}
                >
                  <Text style={[type.bodySmallHeavy, { color: colors.contentPrimary }]}>
                    {u === 'rupees' ? 'Amount' : 'Quantity'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Prominent amount display */}
          <Animated.View
            style={[styles.amountRow, { transform: [{ scale: amountScale }] }]}
          >
            {unit === 'rupees' && (
              <Text style={[styles.amountText, { color: colors.contentPrimary }]}>₹</Text>
            )}
            {amount.length > 0 && (
              <Text style={[styles.amountText, { color: colors.contentPrimary }]}>{amount}</Text>
            )}
            <Animated.View
              style={[styles.cursor, { backgroundColor: colors.contentAccent, opacity: cursorOpacity }]}
            />
            {unit === 'shares' && amount.length > 0 && (
              <Text
                style={[type.bodyLargeHeavy, { color: colors.contentSecondary, alignSelf: 'flex-end', marginBottom: 6 }]}
              >
                {' shares'}
              </Text>
            )}
          </Animated.View>

          {/* Quick-select pills */}
          <View style={styles.quickRow}>
            {quickValues.map((v) => (
              <Pressable
                key={v}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAmount(v);
                  punchAmount();
                }}
                style={[
                  styles.quickPill,
                  { backgroundColor: colors.backgroundPrimary, borderColor: colors.borderPrimary },
                ]}
              >
                <Text style={[type.bodySmallHeavy, { color: colors.contentPrimary }]}>
                  {unit === 'rupees' ? formatINR(Number(v)) : `${v} shares`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Docked button + numpad */}
      <View style={[styles.bottomDock, { borderTopColor: colors.borderPrimary }]}>
        <View style={styles.buttonWrap}>
          <Button
            title="Continue"
            disabled={!canContinue}
            onPress={() =>
              router.push(
                `/send/message?symbol=${stock.symbol}&amount=${amount}&unit=${unit}&price=${pricePerShare}`
              )
            }
          />
        </View>
        <Numpad onKey={handleKey} mode={unit === 'rupees' ? 'amount' : 'quantity'} />
        <View style={{ height: insets.bottom }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xxxl,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segmentPill: {
    height: 32,
    paddingHorizontal: spacing.l,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  amountText: {
    fontFamily: fonts.heading,
    fontSize: 40,
    lineHeight: 48,
  },
  cursor: {
    width: 2,
    height: 44,
    marginLeft: 2,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.s,
    justifyContent: 'center',
  },
  quickPill: {
    height: 32,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomDock: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  buttonWrap: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
});
