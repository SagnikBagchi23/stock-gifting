import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
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
import { DeviceMotion } from 'expo-sensors';

import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { CardGradient, GRADIENT_SPECS } from '@/components/gift/CardGradient';
import { findStock } from '@/data/stocks';
import { getStockLogo } from '@/data/stockLogos';
import { spacing, radius, fonts } from '@/constants/tokens';
import { formatINR } from '@/utils/format';
import { createGift } from '@/lib/gifts';
import { getDisplayName } from '@/lib/identity';

const EAS_PROJECT_ID = '3e962d09-1429-4ef5-a5ca-ffaeb85c4723';
const EAS_CHANNEL = 'preview';
const REDIRECT_ORIGIN = 'https://stock-gifting.vercel.app';

const GROWW_LOGO = require('@/assets/mds_ic_groww.png');

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const CARD_W = 320;
const CARD_H = 427;
const CARD_RADIUS = 24;
const SWATCH_SIZE = 40;
const MAX_TILT = 4; // degrees
const FLOAT_AMP = 8; // px
const FLOAT_MS = 2600;
const FADE_MS = 500;
const BLUR_PEAK = 35;
const GRAD_PARALLAX = 1.5; // px per degree of tilt — subtle, depth-only

// Emil's strong custom easings — the built-in CSS/RN ones are too weak
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export default function PreviewGift() {
  const { symbol, amount, unit, message, price } = useLocalSearchParams<{
    symbol: string;
    amount: string;
    unit: string;
    price: string;
    message: string;
  }>();
  const stock = findStock(symbol ?? '');
  const stockLogo = stock ? getStockLogo(stock.symbol) : null;
  const qty = parseFloat(amount ?? '0');
  const sharesQty = Number.isFinite(qty) ? qty : 0;
  const displayAmount =
    unit === 'rupees'
      ? formatINR(qty)
      : `${sharesQty} share${sharesQty === 1 ? '' : 's'}`;

  // ── Gradient cross-fade state ─────────────────────────────────────────────
  const [activeGradient, setActiveGradient] = useState(0);
  const fadeLocked = useRef(false);

  // ── Animated values ───────────────────────────────────────────────────────
  // One opacity per gradient — all images stay mounted so there's no decode delay on transition
  const gradOpacity0 = useSharedValue(1);
  const gradOpacity1 = useSharedValue(0);
  const gradOpacity2 = useSharedValue(0);
  const gradOpacity3 = useSharedValue(0);
  const gradOpacity4 = useSharedValue(0);
  const gradOpacities = [gradOpacity0, gradOpacity1, gradOpacity2, gradOpacity3, gradOpacity4];
  const blurIntensity = useSharedValue(0);   // swatch crossfade bridge
  const revealBlur = useSharedValue(0);      // initial content-reveal bridge
  const contentOpacity = useSharedValue(0);  // message + amount + logo
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const floatY = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  // Shareable URL — created lazily after we've inserted a real Supabase gift row.
  // Recipients tap the https link → tiny static redirect on our Vercel domain
  // → exp:// link → Expo Go opens → loads the `preview` channel bundle
  // → deep-links into /gift/<id> → existing claim screen writes receiver name
  // to Supabase → /holdings (which reads from Supabase) shows the new stock.
  const [giftId, setGiftId] = useState<string | null>(null);
  const creatingRef = useRef(false);
  // Promise that resolves once the Supabase gift row has been created.
  // Share button can be pressed immediately; if the row isn't ready yet,
  // we await this before opening the native share sheet.
  const giftIdPromiseRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    if (creatingRef.current) return;
    if (!symbol || !amount || !unit) return;
    const qty = parseFloat(amount);
    if (!Number.isFinite(qty) || qty <= 0) return;
    if (unit !== 'shares' && unit !== 'rupees') return;
    creatingRef.current = true;
    giftIdPromiseRef.current = (async () => {
      const senderName = (await getDisplayName()) ?? 'A friend';
      const pricePerShare = price ? parseFloat(price) : undefined;
      const res = await createGift({
        senderName,
        stockSymbol: symbol,
        unit,
        quantity: qty,
        pricePerShare:
          pricePerShare && Number.isFinite(pricePerShare) ? pricePerShare : undefined,
        note: message,
      });
      if ('id' in res) {
        setGiftId(res.id);
        return res.id;
      }
      // Allow a retry on next press if creation failed.
      creatingRef.current = false;
      giftIdPromiseRef.current = null;
      return null;
    })();
  }, [symbol, amount, unit, price, message]);

  const buildShareUrl = useCallback((id: string) => {
    const expUrl = `exp://u.expo.dev/${EAS_PROJECT_ID}/--/gift/${id}?channel-name=${EAS_CHANNEL}`;
    return `${REDIRECT_ORIGIN}/open.html?u=${encodeURIComponent(expUrl)}`;
  }, []);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let id = giftId;
    if (!id && giftIdPromiseRef.current) {
      id = await giftIdPromiseRef.current;
    }
    if (!id) return;
    const url = buildShareUrl(id);
    try {
      await Share.share({
        message: `You've got a stock gift! Tap to open: ${url}`,
        url,
      });
    } catch {
      // user cancelled — no-op
    }
  }, [giftId, buildShareUrl]);

  // ── Mount enter animation ─────────────────────────────────────────────────
  useEffect(() => {
    // 1. Card shell enters — timing, not spring, so it never overshoots
    cardOpacity.value = withTiming(1, { duration: 500, easing: EASE_OUT });
    cardScale.value = withTiming(1, { duration: 500, easing: EASE_OUT });

    // 2. Blur ramps up just before card is fully visible (bridges the empty→content swap)
    revealBlur.value = withSequence(
      withTiming(0, { duration: 280 }), // wait for card to mostly appear
      withTiming(BLUR_PEAK, { duration: 220, easing: EASE_OUT }),
      withTiming(0, { duration: 360, easing: EASE_IN_OUT })
    );

    // 3. Content fades in behind the blur peak — smooth not snappy
    contentOpacity.value = withSequence(
      withTiming(0, { duration: 380 }),
      withTiming(1, { duration: 240, easing: EASE_OUT })
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
      DeviceMotion.setUpdateInterval(16); // ~60Hz, snappier than 20Hz
      sub = DeviceMotion.addListener(({ rotation }) => {
        if (!rotation) return;
        // DeviceMotion.rotation values are in RADIANS.
        // beta = X-axis tilt (pitch), gamma = Y-axis tilt (roll).
        if (initialBeta.current === null) initialBeta.current = rotation.beta;
        const RAD2DEG = 180 / Math.PI;
        const GAIN = 0.5;
        const pitchDeg = (rotation.beta - initialBeta.current) * RAD2DEG * GAIN;
        const rollDeg = rotation.gamma * RAD2DEG * GAIN;
        const tx = Math.max(-MAX_TILT, Math.min(MAX_TILT, -pitchDeg));
        const ty = Math.max(-MAX_TILT, Math.min(MAX_TILT, rollDeg));
        tiltX.value = withSpring(tx, { damping: 28, stiffness: 160, mass: 1.0 });
        tiltY.value = withSpring(ty, { damping: 28, stiffness: 160, mass: 1.0 });
      });
    });

    return () => sub?.remove();
  }, []);

  // ── Gradient swap with cross-fade ─────────────────────────────────────────
  // All 5 gradients are always mounted. Swapping is just animating opacities,
  // so there's never a decode-delay frame that causes flicker.
  const unlockFade = useCallback(() => { fadeLocked.current = false; }, []);

  const handleSwatchPress = useCallback(
    (index: number) => {
      if (fadeLocked.current || index === activeGradient) return;
      fadeLocked.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const prev = activeGradient;
      setActiveGradient(index);

      gradOpacities[prev].value = withTiming(0, { duration: FADE_MS, easing: EASE_IN_OUT });
      gradOpacities[index].value = withTiming(
        1,
        { duration: FADE_MS, easing: EASE_IN_OUT },
        (finished) => { if (finished) runOnJS(unlockFade)(); }
      );

      blurIntensity.value = withSequence(
        withTiming(BLUR_PEAK, { duration: FADE_MS * 0.5, easing: EASE_IN_OUT }),
        withTiming(0, { duration: FADE_MS * 0.5, easing: EASE_IN_OUT })
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

  const gradStyle0 = useAnimatedStyle(() => ({ opacity: gradOpacity0.value }));
  const gradStyle1 = useAnimatedStyle(() => ({ opacity: gradOpacity1.value }));
  const gradStyle2 = useAnimatedStyle(() => ({ opacity: gradOpacity2.value }));
  const gradStyle3 = useAnimatedStyle(() => ({ opacity: gradOpacity3.value }));
  const gradStyle4 = useAnimatedStyle(() => ({ opacity: gradOpacity4.value }));
  const gradStyles = [gradStyle0, gradStyle1, gradStyle2, gradStyle3, gradStyle4];

  // Gradient parallax: gradient stack is slightly pre-scaled (1.06) so we can
  // translate it ±MAX_TILT*GRAD_PARALLAX (~6px) without ever exposing the card edge.
  // Sign matches tilt direction so the gradient feels anchored "behind" the surface.
  const gradStackStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1.06 },
      { translateX: tiltY.value * GRAD_PARALLAX },
      { translateY: -tiltX.value * GRAD_PARALLAX },
    ],
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
      />

      <View style={styles.body}>
        {/* Gift card — 3D tilt + levitation */}
        <Animated.View style={cardWrapStyle}>
          <View style={styles.card}>
            {/* Gradient stack: pre-scaled + counter-translated by tilt for subtle parallax */}
            <Animated.View style={[StyleSheet.absoluteFill, gradStackStyle]} pointerEvents="none">
              {GRADIENT_SPECS.map((spec, i) => (
                <Animated.View key={i} style={[StyleSheet.absoluteFill, gradStyles[i]]}>
                  <CardGradient spec={spec} width={CARD_W} height={CARD_H} />
                </Animated.View>
              ))}
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
              {/* Stock logo, top-left */}
              {stockLogo && (
                <Image source={stockLogo} style={styles.stockLogo} resizeMode="contain" />
              )}

              {/* Amount + message, bottom-left */}
              <View style={styles.cardBottomLeft}>
                <Text style={styles.amountText} adjustsFontSizeToFit numberOfLines={1}>
                  {displayAmount}
                </Text>
                {message ? (
                  <Text style={styles.messageText} numberOfLines={2}>
                    {message}
                  </Text>
                ) : null}
              </View>

              {/* Groww logo, bottom-right */}
              <Image source={GROWW_LOGO} style={styles.growwLogo} resizeMode="contain" />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Gradient swatches */}
        <View style={styles.swatches}>
          {GRADIENT_SPECS.map((spec, i) => {
            const isActive = i === activeGradient;
            return (
              <Pressable
                key={i}
                onPress={() => handleSwatchPress(i)}
                style={[styles.swatch, isActive && styles.swatchActive]}
              >
                <View style={styles.swatchInner}>
                  <CardGradient spec={spec} width={SWATCH_SIZE} height={SWATCH_SIZE} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Docked share section */}
      <View style={[styles.cta, { paddingBottom: spacing.l }]}>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.shareBtn,
            pressed && styles.shareBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Share gift link"
        >
          <Text style={styles.shareBtnText}>Share gift link</Text>
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
  stockLogo: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: radius.m,
  },
  cardBottomLeft: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 72, // leave room for the groww logo at bottom-right
    gap: 2,
  },
  amountText: {
    fontFamily: fonts.heading,
    fontSize: 36,
    lineHeight: 44,
    color: '#FFFFFF',
  },
  messageText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  growwLogo: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 24,
    height: 24,
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
});
