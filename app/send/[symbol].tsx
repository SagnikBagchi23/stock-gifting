import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

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
  // Content-aware scale: grows/shrinks with digit count
  const amountScale = useRef(new Animated.Value(1)).current;
  // Shake for error feedback
  const shakeX = useRef(new Animated.Value(0)).current;
  // Error message fade
  const errorOpacity = useRef(new Animated.Value(0)).current;
  // Current value fade (shown when qty is valid, hidden on error)
  const valueOpacity = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const len = formatAmountDisplay(amount).length;
    const target = len <= 3 ? 1.0 : len <= 5 ? 0.85 : len <= 7 ? 0.72 : 0.60;
    Animated.timing(amountScale, {
      toValue: target,
      duration: 180,
      easing: Easing.bezier(0.77, 0, 0.175, 1),
      useNativeDriver: true,
    }).start();
  }, [amount]);

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

  useEffect(() => {
    const show = Number.isFinite(qty) && qty > 0 && !hasError;
    Animated.timing(valueOpacity, {
      toValue: show ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, hasError]);

  if (!stock) {
    return (
      <Screen>
        <AppBar title="Send" showBack />
        <Text style={[type.bodyBase, { color: colors.contentPrimary }]}>Stock not found.</Text>
      </Screen>
    );
  }

  const subtitle = `${formatShares(stock.sharesHeld)} shares • ${formatINR(stock.sharesHeld * pricePerShare)}`;
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
      return;
    }
    if (key === '.') return;
    if (amount === '0') {
      setAmount(key);
      return;
    }
    if (amount.length >= 10) return;
    setAmount((prev) => prev + key);
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
            <View style={{ height: 18, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.Text
                style={[type.bodySmall, { color: colors.contentSecondary, opacity: valueOpacity, position: 'absolute' }]}
                numberOfLines={1}
              >
                {Number.isFinite(qty) && qty > 0 ? formatINR(qty * pricePerShare) : ''}
              </Animated.Text>
              <Animated.Text
                style={[type.bodySmall, { color: colors.contentNegative, opacity: errorOpacity, position: 'absolute' }]}
                numberOfLines={1}
              >
                {errorMsg}
              </Animated.Text>
            </View>
          </Animated.View>

          {/* Quick-select pills */}
          <View style={styles.quickRow}>
            {quickValues.map((v) => (
              <Pressable
                key={v}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAmount(String(v));
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
      <View style={[styles.bottomDock, { marginBottom: -insets.bottom }]}>
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
