import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

function formatAmountDisplay(raw: string): string {
  if (!raw) return '';
  const [intRaw, decRaw] = raw.split('.');
  const intNum = parseInt(intRaw || '0', 10);
  const intFormatted = Number.isFinite(intNum) ? intNum.toLocaleString('en-IN') : intRaw;
  return decRaw !== undefined ? `${intFormatted}.${decRaw}` : intFormatted;
}
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

export default function ComposeGift() {
  const { symbol, price: priceParam } = useLocalSearchParams<{ symbol: string; price?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const stock = findStock(symbol ?? '');

  const unit: GiftUnit = 'shares';
  const [amount, setAmount] = useState('');
  const [hadError, setHadError] = useState(false);

  // Cursor blink
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  // Amount scale punch on keypress
  const amountScale = useRef(new Animated.Value(1)).current;
  // Shake for error feedback
  const shakeX = useRef(new Animated.Value(0)).current;
  // Error message fade
  const errorOpacity = useRef(new Animated.Value(0)).current;

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

  const triggerErrorFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    Animated.timing(errorOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const livePrice = priceParam ? parseFloat(priceParam) : NaN;
  const pricePerShare =
    Number.isFinite(livePrice) && livePrice > 0 ? livePrice : stock?.pricePerShare ?? 0;

  const qty = parseFloat(amount);
  const maxAllowed = stock?.sharesHeld ?? 0;
  const hasError = Boolean(stock) && Number.isFinite(qty) && qty > 0 && qty > maxAllowed;
  const canContinue = Number.isFinite(qty) && qty > 0 && !hasError;

  useEffect(() => {
    if (hasError && !hadError) {
      triggerErrorFeedback();
    } else if (!hasError && hadError) {
      Animated.timing(errorOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
    setHadError(hasError);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasError]);

  if (!stock) {
    return (
      <Screen>
        <AppBar title="Send" showBack />
        <Text style={[type.bodyBase, { color: colors.contentPrimary }]}>Stock not found.</Text>
      </Screen>
    );
  }

  const subtitle = `${formatShares(stock.sharesHeld)} shares • ${formatINR(stock.investedValue)}`;
  const quickValues = useMemo(() => {
    const held = stock?.sharesHeld ?? 0;
    return [0.1, 0.2, 0.5]
      .map((p) => Math.round(held * p))
      .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i);
  }, [stock?.sharesHeld]);

  const errorMsg = hasError ? `You only have ${formatShares(stock.sharesHeld)} qty` : '';

  const handleKey = (key: string) => {
    if (key !== '⌫' && hasError) return;
    if (key === '⌫') {
      setAmount((prev) => prev.slice(0, -1));
      punchAmount();
      return;
    }
    if (key === '.') return;
    if (amount === '0') {
      setAmount(key);
      punchAmount();
      return;
    }
    if (amount.length >= 10) return;
    setAmount((prev) => prev + key);
    punchAmount();
  };

  return (
    <Screen padded={false}>
      <AppBar title={stock.name} subtitle={subtitle} showBack />

      {/* Center content */}
      <View style={styles.body}>
        <View style={styles.centerContent}>
          {/* Eyebrow header */}
          <Text style={[type.headingEyebrow, { color: colors.contentSecondary }]}>Enter qty</Text>

          {/* Prominent amount display */}
          <Animated.View style={{ alignItems: 'center', gap: spacing.xs }}>
            <Animated.View
              style={[styles.amountRow, { transform: [{ scale: amountScale }, { translateX: shakeX }] }]}
            >
              {amount.length > 0 && (
                <Text style={[styles.amountText, { color: colors.contentPrimary }]}>
                  {formatAmountDisplay(amount)}
                </Text>
              )}
              <Animated.View
                style={[styles.cursor, { backgroundColor: colors.contentAccent, opacity: cursorOpacity }]}
            />
            </Animated.View>
            <Animated.Text
              style={[type.bodySmall, { color: colors.contentNegative, opacity: errorOpacity }]}
              numberOfLines={1}
            >
              {errorMsg}
            </Animated.Text>
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
                  {v} qty
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Docked button + numpad */}
      <View style={styles.bottomDock}>
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
  },
  buttonWrap: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xs,
  },
});
