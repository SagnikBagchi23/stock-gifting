import React, { useCallback, useEffect, useRef } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DeviceMotion } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findStock } from '@/data/stocks';
import { getStockLogo } from '@/data/stockLogos';
import { spacing, fonts, radius, type } from '@/constants/tokens';
import { useTheme } from '@/constants/theme';
import { formatINR } from '@/utils/format';

// Metro bundler requires literal require() paths
const GRADIENTS = [
  require('@/assets/receive-card/receive 1.png'),
  require('@/assets/receive-card/receive 2.png'),
  require('@/assets/receive-card/receive 3.png'),
  require('@/assets/receive-card/receive 4.png'),
  require('@/assets/receive-card/receive 5.png'),
] as const;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const CARD_W = 320;
const CARD_H = 427;
const CARD_RADIUS = 24;
const MAX_TILT = 15;
const FLIP_PAUSE_MS = 1200;
const FLIP_MS = 700;
const SLIDE_UP = 80;
const BTN_H = 48;
const BLUR_PEAK = 55;

export default function ReceivePreview() {
  const { symbol, amount, unit, message, gradient } = useLocalSearchParams<{
    symbol: string;
    amount: string;
    unit: string;
    message: string;
    gradient: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const stock = findStock(symbol ?? '');
  const stockLogo = stock ? getStockLogo(stock.symbol) : null;
  const qty = parseFloat(amount ?? '0');
  const displayAmount =
    unit === 'rupees' ? formatINR(qty) : `${Number.isFinite(qty) ? qty : 0} shares`;
  const gradientIdx = Math.min(4, Math.max(0, parseInt(gradient ?? '0', 10) || 0));

  // ── Animated values ───────────────────────────────────────────────────────
  // flipProgress: 0 = front visible, 1 = back visible (maps to 0→180 deg rotateX)
  const flipProgress = useSharedValue(0);
  // cardY: 0 initially, becomes -SLIDE_UP when flipped
  const cardY = useSharedValue(0);
  // gyro tilt
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  // buttons
  const btnOpacity = useSharedValue(0);
  const btnTranslateY = useSharedValue(40);

  // ── Gyroscope tilt ────────────────────────────────────────────────────────
  const initialBeta = useRef<number | null>(null);

  useEffect(() => {
    let sub: ReturnType<typeof DeviceMotion.addListener> | undefined;
    DeviceMotion.isAvailableAsync().then((ok) => {
      if (!ok) return;
      DeviceMotion.setUpdateInterval(50);
      sub = DeviceMotion.addListener(({ rotation }) => {
        if (!rotation) return;
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

  // ── Reveal buttons (JS thread) ────────────────────────────────────────────
  const revealButtons = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    btnOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
    btnTranslateY.value = withSpring(0, { damping: 18, stiffness: 200 });
  }, []);

  // ── Flip + slide sequence (starts after FLIP_PAUSE_MS) ───────────────────
  useEffect(() => {
    // Slide up and flip together after the pause
    cardY.value = withDelay(
      FLIP_PAUSE_MS,
      withSpring(-SLIDE_UP, { damping: 18, stiffness: 160 })
    );

    flipProgress.value = withDelay(
      FLIP_PAUSE_MS,
      withTiming(1, { duration: FLIP_MS, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (finished) runOnJS(revealButtons)();
      })
    );
  }, []);

  // ── Animated styles ───────────────────────────────────────────────────────
  const cardWrapStyle = useAnimatedStyle(() => {
    // rotateX goes 0 → 180 (but we use a trick: at 90° we swap faces)
    const rotX = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1200 },
        { rotateX: `${rotX}deg` },
        { rotateY: `${tiltY.value}deg` },
        { translateY: cardY.value },
      ],
    };
  });

  // Front face opacity: visible [0,0.5], hidden [0.5,1]
  const frontStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.45, 0.5], [1, 1, 0], 'clamp'),
    // Counter-rotate so text isn't mirrored on front face
    transform: [{ rotateX: '0deg' }],
  }));

  // Back face opacity: hidden [0,0.5], visible [0.5,1]
  // Also counter-rotate 180° so the back face text reads correctly
  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0.5, 0.55, 1], [0, 1, 1], 'clamp'),
    transform: [{ rotateX: '180deg' }],
  }));

  // Blur bridge: peaks at flip midpoint (flipProgress=0.5) — bridges the face swap
  const blurProps = useAnimatedProps(() => ({
    intensity: interpolate(flipProgress.value, [0, 0.5, 1], [0, BLUR_PEAK, 0]),
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnTranslateY.value }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: '#060809' }]}>
      {/* App bar */}
      <View style={[styles.appBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.appBarTitle}>A gift for you</Text>
      </View>

      {/* Card stage — centred in remaining space */}
      <View style={styles.stage}>
        <Animated.View style={[styles.cardWrap, cardWrapStyle]}>
          {/* FRONT: Groww logo only — what recipient sees first */}
          <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
            <View style={[styles.card, styles.cardFront]}>
              <ImageBackground
                source={GRADIENTS[gradientIdx]}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={styles.growwLogoWrap}>
                <Image
                  source={require('@/assets/groww-logo.png')}
                  style={styles.growwLogo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Animated.View>

          {/* BACK: full gift details — revealed after flip */}
          <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>
            <View style={[styles.card, styles.cardBack]}>
              <ImageBackground
                source={GRADIENTS[gradientIdx]}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              {/* Top-left: logo + stock name */}
              <View style={styles.backTop}>
                {stockLogo && (
                  <Image source={stockLogo} style={styles.backLogo} resizeMode="contain" />
                )}
                <Text style={styles.stockName} numberOfLines={1}>
                  {stock?.symbol ?? symbol}
                </Text>
              </View>
              {/* Bottom: occasion message + amount */}
              <View style={styles.backBottom}>
                {!!message && (
                  <Text style={styles.occasionText} numberOfLines={2}>
                    {decodeURIComponent(message)}
                  </Text>
                )}
                <Text style={styles.amountText} adjustsFontSizeToFit numberOfLines={1}>
                  {displayAmount}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Blur bridge — peaks at flip midpoint to hide the face-swap crossover */}
          {/* Wrapping View is required: BlurView ignores borderRadius on iOS, the parent View clips it */}
          <View style={[StyleSheet.absoluteFill, styles.blurOverlay]} pointerEvents="none">
            <AnimatedBlurView
              animatedProps={blurProps}
              tint="default"
              style={StyleSheet.absoluteFill}
            />
          </View>
        </Animated.View>
      </View>

      {/* Reject / Accept buttons — fade+slide up after flip */}
      <Animated.View
        style={[
          styles.btnRow,
          { paddingBottom: insets.bottom + spacing.l },
          buttonsStyle,
        ]}
      >
        <Pressable
          style={[styles.btn, styles.btnReject]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Reject gift"
        >
          <Text style={[styles.btnText, { color: '#FFFFFF' }]}>Reject</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnAccept]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/holdings');
          }}
          accessibilityRole="button"
          accessibilityLabel="Accept gift"
        >
          <Text style={[styles.btnText, { color: '#FFFFFF' }]}>Accept</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  blurOverlay: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  appBar: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
  },
  appBarTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrap: {
    width: CARD_W,
    height: CARD_H,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  cardFront: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {},
  growwLogoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  growwLogo: {
    width: 48,
    height: 48,
  },
  backTop: {
    position: 'absolute',
    top: 24,
    left: 24,
    gap: spacing.s,
  },
  backLogo: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
  },
  stockName: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 32,
    color: '#FFFFFF',
  },
  backBottom: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    gap: 4,
  },
  occasionText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.8)',
  },
  amountText: {
    fontFamily: fonts.heading,
    fontSize: 40,
    lineHeight: 48,
    color: '#FFFFFF',
  },
  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    gap: spacing.m,
  },
  btn: {
    flex: 1,
    height: BTN_H,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReject: {
    backgroundColor: '#1C2224',
  },
  btnAccept: {
    backgroundColor: '#04B488',
  },
  btnText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 24,
  },
});
