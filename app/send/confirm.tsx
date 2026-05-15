import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { DeviceMotion } from 'expo-sensors';

import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { findStock } from '@/data/stocks';
import { getStockLogo } from '@/data/stockLogos';
import { spacing, radius, fonts } from '@/constants/tokens';
import { formatINR } from '@/utils/format';

// Metro bundler requires literal require() paths
const GRADIENTS = [
  require('@/assets/preview-card/gradient 1.png'),
  require('@/assets/preview-card/gradient 2.png'),
  require('@/assets/preview-card/gradient 3.png'),
  require('@/assets/preview-card/gradient 4.png'),
  require('@/assets/preview-card/gradient 5.png'),
] as const;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const CARD_W = 328;
const CARD_H = 246;
const CARD_RADIUS = 24;
const SWATCH_SIZE = 40;
const MAX_TILT = 17; // degrees
const FLOAT_AMP = 8; // px
const FLOAT_MS = 2600;
const FADE_MS = 700;
const BLUR_PEAK = 35;

export default function PreviewGift() {
  const { symbol, amount, unit, message } = useLocalSearchParams<{
    symbol: string;
    amount: string;
    unit: string;
    price: string;
    message: string;
  }>();
  const stock = findStock(symbol ?? '');
  const stockLogo = stock ? getStockLogo(stock.symbol) : null;
  const qty = parseFloat(amount ?? '0');
  const displayAmount =
    unit === 'rupees' ? formatINR(qty) : `${Number.isFinite(qty) ? qty : 0} shares`;

  // ── Gradient cross-fade state ─────────────────────────────────────────────
  const [layerA, setLayerA] = useState(0);
  const [layerB, setLayerB] = useState(0);
  const [activeGradient, setActiveGradient] = useState(0);
  const fadeLocked = useRef(false);

  // ── Animated values ───────────────────────────────────────────────────────
  const fadeProgress = useSharedValue(0);    // 0=A visible, 1=B visible
  const blurIntensity = useSharedValue(0);   // swatch crossfade bridge
  const revealBlur = useSharedValue(0);      // initial content-reveal bridge
  const contentOpacity = useSharedValue(0);  // message + amount + logo
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const floatY = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  // ── Shareable URL (computed once, shown as QR + copy text) ────────────────
  // Two-layer URL strategy:
  //   exp://       → raw Expo deep link (works in QR scanners, opens Expo Go)
  //   https://     → tappable wrapper (works in iMessage/WhatsApp/etc., opens Expo Go)
  // The https wrapper requires a public host (Cloudflare Tunnel in dev,
  // an EAS Update channel in prod). We surface the tappable URL as the
  // primary share artifact.
  const shareUrl = useMemo(() => {
    const tunnelHost = process.env.EXPO_PUBLIC_TUNNEL_HOST;
    const lanHost = Constants.expoGoConfig?.debuggerHost;
    const host = tunnelHost ?? lanHost;
    const qs = [
      `amount=${encodeURIComponent(amount ?? '')}`,
      `unit=${encodeURIComponent(unit ?? '')}`,
      `message=${encodeURIComponent(message ?? '')}`,
      `gradient=${activeGradient}`,
    ].join('&');
    if (!host) {
      return Linking.createURL(`/receive/${symbol}`, {
        queryParams: {
          amount: amount ?? '',
          unit: unit ?? '',
          message: message ?? '',
          gradient: String(activeGradient),
        },
      });
    }
    // Strip protocol if user wrote https://… in env
    const cleanHost = host.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const expUrl = `exp://${cleanHost}/--/receive/${symbol}?${qs}`;
    // expo.dev/--/to-exp/<encoded> turns any exp:// URL into a tappable https link
    return `https://expo.dev/--/to-exp/${encodeURIComponent(expUrl)}`;
  }, [activeGradient, amount, message, symbol, unit]);

  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(shareUrl);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `You've got a stock gift! Tap to open: ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      // user cancelled — no-op
    }
  }, [shareUrl]);

  // ── Mount enter animation ─────────────────────────────────────────────────
  useEffect(() => {
    // 1. Card shell enters
    cardOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
    cardScale.value = withSpring(1, { damping: 14, stiffness: 180 });

    // 2. Blur ramps up just before card is fully visible (bridges the empty→content swap)
    revealBlur.value = withSequence(
      withTiming(0, { duration: 280 }), // wait for card to mostly appear
      withTiming(BLUR_PEAK, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) })
    );

    // 3. Content snaps visible at blur peak (invisible swap — blur hides it)
    contentOpacity.value = withSequence(
      withTiming(0, { duration: 460 }), // hold until blur is at peak
      withTiming(1, { duration: 20 })   // instant snap while blur masks it
    );
  }, []);

  // ── Levitation float loop ─────────────────────────────────────────────────
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-FLOAT_AMP, { duration: FLOAT_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: FLOAT_MS, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // ── Gyroscope tilt ────────────────────────────────────────────────────────
  // Calibration ref: first reading sets the neutral position
  const initialBeta = useRef<number | null>(null);

  useEffect(() => {
    let sub: ReturnType<typeof DeviceMotion.addListener> | undefined;

    DeviceMotion.isAvailableAsync().then((ok) => {
      if (!ok) return;
      DeviceMotion.setUpdateInterval(50);
      sub = DeviceMotion.addListener(({ rotation }) => {
        if (!rotation) return;
        // rotation.beta: X-axis tilt (pitch), rotation.gamma: Y-axis tilt (roll) — in degrees
        if (initialBeta.current === null) initialBeta.current = rotation.beta;
        const pitchDelta = rotation.beta - initialBeta.current;
        const rollDeg = rotation.gamma;
        const tx = Math.max(-MAX_TILT, Math.min(MAX_TILT, -pitchDelta));
        const ty = Math.max(-MAX_TILT, Math.min(MAX_TILT, rollDeg));
        tiltX.value = withSpring(tx, { damping: 22, stiffness: 160 });
        tiltY.value = withSpring(ty, { damping: 22, stiffness: 160 });
      });
    });

    return () => sub?.remove();
  }, []);

  // ── Unlock fade (called from UI thread via runOnJS) ───────────────────────
  const unlockFade = useCallback(() => {
    fadeLocked.current = false;
  }, []);

  // ── Gradient swap with cross-fade ─────────────────────────────────────────
  const handleSwatchPress = useCallback(
    (index: number) => {
      if (fadeLocked.current || index === activeGradient) return;
      fadeLocked.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setActiveGradient(index);
      setLayerB(index);

      // Blur ramps up to peak at the crossover midpoint, then dissolves
      blurIntensity.value = withSequence(
        withTiming(BLUR_PEAK, { duration: FADE_MS * 0.5, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: FADE_MS * 0.5, easing: Easing.inOut(Easing.quad) })
      );

      fadeProgress.value = withTiming(
        1,
        { duration: FADE_MS, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setLayerA)(index);
            runOnJS(setLayerB)(index);
            fadeProgress.value = 0;
            runOnJS(unlockFade)();
          }
        }
      );
    },
    [activeGradient, unlockFade]
  );

  // ── Animated styles ───────────────────────────────────────────────────────
  const cardWrapStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { perspective: 1000 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${tiltY.value}deg` },
      { translateY: floatY.value },
      { scale: cardScale.value },
    ],
  }));

  const layerAStyle = useAnimatedStyle(() => ({
    opacity: interpolate(fadeProgress.value, [0, 1], [1, 0]),
  }));

  const layerBStyle = useAnimatedStyle(() => ({
    opacity: interpolate(fadeProgress.value, [0, 1], [0, 1]),
  }));

  const blurProps = useAnimatedProps(() => ({
    intensity: blurIntensity.value + revealBlur.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <Screen padded={false}>
      <AppBar
        title="Preview"
        showBack
        leftTitle
        animatedStyle={{ backgroundColor: '#060809', borderBottomWidth: 0 }}
      />

      <View style={styles.body}>
        {/* Gift card — 3D tilt + levitation */}
        <Animated.View style={cardWrapStyle}>
          <View style={styles.card}>
            {/* Layer A — current gradient */}
            <Animated.View style={[StyleSheet.absoluteFill, layerAStyle]}>
              <ImageBackground
                source={GRADIENTS[layerA]}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </Animated.View>

            {/* Layer B — incoming gradient (fades in) */}
            <Animated.View style={[StyleSheet.absoluteFill, layerBStyle]}>
              <ImageBackground
                source={GRADIENTS[layerB]}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </Animated.View>

            {/* Blur bridge overlay — peaks at crossover midpoint (Emil's technique) */}
            {/* Wrapping View is required: BlurView ignores borderRadius on iOS, the parent View clips it */}
            <View style={[StyleSheet.absoluteFill, styles.blurOverlay]} pointerEvents="none">
              <AnimatedBlurView
                animatedProps={blurProps}
                tint="default"
                style={StyleSheet.absoluteFill}
              />
            </View>

            {/* Card content — fades in after card shell, bridged by revealBlur */}
            <Animated.View style={[StyleSheet.absoluteFill, contentStyle]} pointerEvents="none">
              {/* Occasion message */}
              <Text style={styles.messageText} numberOfLines={2}>
                {message ?? ''}
              </Text>

              {/* Bottom row: gift amount + stock logo */}
              <View style={styles.cardBottom}>
                <Text style={styles.amountText} adjustsFontSizeToFit numberOfLines={1}>
                  {displayAmount}
                </Text>
                {stockLogo && (
                  <Image source={stockLogo} style={styles.stockLogo} resizeMode="contain" />
                )}
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Gradient swatches */}
        <View style={styles.swatches}>
          {GRADIENTS.map((src, i) => {
            const isActive = i === activeGradient;
            return (
              <Pressable
                key={i}
                onPress={() => handleSwatchPress(i)}
                style={[styles.swatch, isActive && styles.swatchActive]}
              >
                <ImageBackground
                  source={src}
                  style={styles.swatchInner}
                  imageStyle={{ borderRadius: isActive ? SWATCH_SIZE / 2 - 2 : SWATCH_SIZE / 2 }}
                  resizeMode="cover"
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Docked share section */}
      <View style={[styles.cta, { paddingBottom: spacing.l }]}>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.shareBtn, pressed && styles.shareBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Share gift link"
        >
          <Text style={styles.shareBtnText}>Share gift link</Text>
        </Pressable>
        <Pressable
          onPress={handleCopy}
          style={styles.copyRow}
          accessibilityRole="button"
          accessibilityLabel="Copy link"
        >
          <Text style={styles.copyRowText} numberOfLines={1} ellipsizeMode="middle">
            {shareUrl}
          </Text>
          <Text style={styles.copyRowAction}>{copied ? 'Copied' : 'Copy'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    paddingBottom: 70,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  blurOverlay: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  messageText: {
    position: 'absolute',
    top: 138,
    left: 24,
    right: 24,
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 32,
    color: '#FFFFFF',
  },
  cardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 4,
    paddingHorizontal: 24,
  },
  amountText: {
    fontFamily: fonts.heading,
    fontSize: 40,
    lineHeight: 48,
    color: '#FFFFFF',
    flex: 1,
  },
  stockLogo: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
  },
  swatches: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    overflow: 'hidden',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: '#F2F5F7',
  },
  swatchInner: {
    flex: 1,
  },
  cta: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
    gap: spacing.m,
  },
  shareBtn: {
    height: 56,
    borderRadius: radius.l,
    backgroundColor: '#04B488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnPressed: {
    opacity: 0.85,
  },
  shareBtnText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.m,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  copyRowText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.55)',
  },
  copyRowAction: {
    fontFamily: fonts.heading,
    fontSize: 13,
    lineHeight: 18,
    color: '#04B488',
  },
});
