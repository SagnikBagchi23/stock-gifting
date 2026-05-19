import React, { useEffect, useRef, useState } from 'react';
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
import { spacing, type, radius, fonts } from '@/constants/tokens';
import { setDisplayName } from '@/lib/identity';
import { getStockLogo } from '@/data/stockLogos';

// 7-bubble layout matching Figma node 1188-2205.
// Amplitude is 20% higher than v1 for more levitation energy.
// Bubbles are positioned within a fixed CLUSTER_W×CLUSTER_H canvas that is
// centered on screen, so layout is screen-width-independent.
const CLUSTER_W = 320;
const CIRCLES = [
  { size: 64, left:   6, top:  80, amplitude:  9, duration: 3000, delay:    0, symbol: 'HDFCBANK'  },
  { size: 64, left:  88, top:  35, amplitude:  9, duration: 2800, delay:  600, symbol: 'SWIGGY'    },
  { size: 64, left: 192, top:  78, amplitude:  6, duration: 3200, delay:  300, symbol: 'BHARTIARTL'},
  { size: 56, left: 130, top: 122, amplitude: 10, duration: 2700, delay:  800, symbol: 'TITAN'     },
  { size: 56, left: 244, top:  18, amplitude: 10, duration: 3100, delay:  400, symbol: 'ETERNAL'   },
  { size: 32, left: 268, top: 118, amplitude: 12, duration: 2900, delay:  900, symbol: 'RELIANCE'  },
  { size: 24, left:  50, top:  12, amplitude: 13, duration: 2600, delay:  200, symbol: 'TCS'       },
] as const;

const CLUSTER_H = 190;

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
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.036, 1] });

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
          <View style={[styles.cluster, { backgroundColor: colors.backgroundPrimary }]}>
            {CIRCLES.map((c, i) => (
              <FloatingBubble key={i} {...c} logoSrc={getStockLogo(c.symbol)} />
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
                style={[{ fontFamily: fonts.bodyMedium, fontSize: 14 }, { color: colors.contentPrimary, flex: 1, padding: 0 }]}
                placeholder="Your name"
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
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  cluster: {
    width: CLUSTER_W,
    height: CLUSTER_H,
    alignSelf: 'center',
    marginTop: -12,
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
