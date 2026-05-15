import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/constants/theme';
import { spacing, type, radius } from '@/constants/tokens';
import { setDisplayName } from '@/lib/identity';
import { getStockLogo, LOGO_SYMBOLS } from '@/data/stockLogos';

// 8 bubbles in a staggered 4+4 grid. All positions ensure:
//   • left >= 0, left+size <= 390 (no horizontal clip)
//   • top - amplitude >= 0 (no top clip when animated up)
//   • top + size <= 170 (no bottom clip)
//   • every circle pair has centre-distance > sum of radii (no overlap)
const CIRCLES = [
  // Row 1 — left-to-right across top half
  { size: 68, left:  8, top: 10, amplitude: 6, duration: 3400, delay:    0 },
  { size: 76, left: 98, top: 10, amplitude: 8, duration: 2900, delay:  400 },
  { size: 72, left:188, top: 12, amplitude: 7, duration: 3200, delay:  800 },
  { size: 64, left:278, top: 12, amplitude: 9, duration: 2700, delay:  200 },
  // Row 2 — staggered into the gaps between row-1 bubbles
  { size: 56, left: 50, top:100, amplitude:10, duration: 3000, delay:  600 },
  { size: 64, left:144, top: 96, amplitude: 7, duration: 3600, delay: 1000 },
  { size: 60, left:238, top:100, amplitude: 8, duration: 2800, delay:  300 },
  { size: 72, left:308, top: 90, amplitude: 6, duration: 3100, delay:  700 },
] as const;

const CLUSTER_H = 170;
const N_LOGOS = CIRCLES.length;

function pickSymbols(n: number): string[] {
  const pool = [...LOGO_SYMBOLS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

function FloatingBubble({
  size, left, top, amplitude, duration, delay, logoSrc,
}: { size: number; left: number; top: number; amplitude: number; duration: number; delay: number; logoSrc: any }) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.03, 1] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        left,
        top,
        backgroundColor: colors.backgroundSurfaceZ1,
        overflow: 'hidden',
        transform: [{ translateY }, { scale }],
      }}
    >
      <Image source={logoSrc} style={{ width: size, height: size }} resizeMode="contain" />
    </Animated.View>
  );
}

export default function Home() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [draftName, setDraftName] = useState('');
  const [inputFocused, setInputFocused] = useState(true);

  // Pick logos once on mount; locked by useMemo with [] deps
  const logos = useMemo(() => pickSymbols(N_LOGOS).map(sym => getStockLogo(sym)), []);

  return (
    <View style={[styles.root, { backgroundColor: colors.backgroundPrimary }]}>
      {/* App bar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarSlot}>
          <Image
            source={require('@/assets/groww-logo.png')}
            style={styles.growwLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.appBarSlot}>
          <Image
            source={require('@/assets/growwdp.png')}
            style={styles.avatarImage}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Hero: full-width bubble cluster + headline */}
        <View style={styles.hero}>
          {/* Bubble cluster spans edge-to-edge; clips overflow */}
          <View style={[styles.cluster, { backgroundColor: colors.backgroundPrimary }]}>
            {CIRCLES.map((c, i) => (
              <FloatingBubble key={i} {...c} logoSrc={logos[i]} />
            ))}
          </View>

          <View style={styles.heroText}>
            <Text style={[type.displaySmall, { color: colors.contentPrimary }]}>
              Gift a stock
            </Text>
            <Text style={[type.bodyBase, { color: colors.contentSecondary }]}>
              Send a stock to someone you care about
            </Text>
          </View>
        </View>

        {/* Input + CTA — 16 px gap between button bottom and keyboard top */}
        <View style={[styles.inputSection, { paddingBottom: spacing.l }]}>
          <View style={styles.fieldWrap}>
            <View
              style={[
                styles.textField,
                {
                  borderColor: inputFocused ? colors.borderNeutral : colors.borderPrimary,
                  backgroundColor: colors.backgroundPrimary,
                },
              ]}
            >
              <TextInput
                style={[type.bodyBaseHeavy, { color: colors.contentPrimary, flex: 1, padding: 0 }]}
                placeholder="e.g. Sagnik"
                placeholderTextColor={colors.contentTertiary}
                value={draftName}
                onChangeText={setDraftName}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                maxLength={40}
                autoCapitalize="words"
                autoCorrect={false}
                selectionColor={colors.contentAccent}
                autoFocus
              />
            </View>
          </View>
          <Button
            title="Continue"
            disabled={draftName.trim().length < 1}
            onPress={async () => {
              const v = draftName.trim();
              if (!v) return;
              await setDisplayName(v);
              router.replace('/send');
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  appBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  appBarSlot: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  growwLogo: { width: 32, height: 32 },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.m,
    // Vertical padding keeps the cluster container from touching the app bar
    // above or the input section below — bubbles can't escape overflow:hidden,
    // but the cluster view itself needs room.
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  cluster: {
    width: '100%',
    height: CLUSTER_H,
    overflow: 'hidden',
  },
  heroText: {
    gap: 2,
    paddingHorizontal: spacing.l,
  },
  inputSection: { paddingHorizontal: spacing.l, gap: spacing.m },
  fieldWrap: { gap: spacing.xs },
  textField: {
    height: 56,
    borderRadius: radius.l,
    borderWidth: 2,
    paddingHorizontal: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
