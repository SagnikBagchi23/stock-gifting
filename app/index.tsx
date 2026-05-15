import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/constants/theme';
import { spacing, type, radius } from '@/constants/tokens';
import { getDisplayName, setDisplayName } from '@/lib/identity';
import { listMyGifts, listMyHoldings } from '@/lib/gifts';
import type { Gift } from '@/types';
import { formatINR, formatShares } from '@/utils/format';
import { StockAvatar } from '@/components/ui/StockAvatar';

// Bubble config: size/position from Figma (node 1185:476-480)
// duration = one half-cycle in ms; delay = phase offset so bubbles drift independently
const CIRCLES = [
  { size: 63, left: 0,   top: 0,  amplitude: 7,  duration: 3200, delay: 0    },
  { size: 40, left: 22,  top: 83, amplitude: 10, duration: 2600, delay: 700  },
  { size: 50, left: 64,  top: 46, amplitude: 8,  duration: 3800, delay: 400  },
  { size: 90, left: 114, top: 58, amplitude: 5,  duration: 4200, delay: 1100 },
  { size: 30, left: 141, top: 16, amplitude: 12, duration: 2900, delay: 200  },
] as const;

const CLUSTER_W = 242;
const CLUSTER_H = 172;

// Each bubble manages its own looping float animation
function FloatingBubble({
  size, left, top, amplitude, duration, delay, color,
}: { size: number; left: number; top: number; amplitude: number; duration: number; delay: number; color: string }) {
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

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -amplitude],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.03, 1],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        left,
        top,
        backgroundColor: color,
        transform: [{ translateY }, { scale }],
      }}
    />
  );
}

export default function Home() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [sent, setSent] = useState<Gift[]>([]);
  const [holdings, setHoldings] = useState<Gift[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getDisplayName().then(setName);
  }, []);

  const refresh = useCallback(async () => {
    if (!name) return;
    setRefreshing(true);
    const [s, h] = await Promise.all([listMyGifts(name), listMyHoldings(name)]);
    setSent(s);
    setHoldings(h);
    setRefreshing(false);
  }, [name]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // ── Name entry screen ────────────────────────────────────────────────────────
  if (!name) {
    return (
      <View style={[styles.nameRoot, { backgroundColor: colors.backgroundPrimary }]}>
        {/* App bar: Groww logo left · avatar placeholder right */}
        <View style={[styles.appBar, { paddingTop: insets.top }]}>
          <View style={styles.appBarSlot}>
            <Image
              source={require('@/assets/groww-logo.png')}
              style={styles.growwLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.appBarSlot}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[type.bodySmallHeavy, { color: colors.contentSecondary }]}>?</Text>
            </View>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Hero: animated bubble cluster + headline */}
          <View style={styles.hero}>
            <View style={styles.cluster}>
              {CIRCLES.map((c, i) => (
                <FloatingBubble key={i} {...c} color={colors.backgroundTertiary} />
              ))}
            </View>

            <View style={styles.heroText}>
              <Text style={[type.displaySmall, { color: colors.contentPrimary, textAlign: 'center' }]}>
                Gift a stock
              </Text>
              <Text style={[type.bodyBase, { color: colors.contentSecondary, textAlign: 'center' }]}>
                Send a stock to someone you care about
              </Text>
            </View>
          </View>

          {/* Input + CTA */}
          <View style={[styles.inputSection, { paddingBottom: insets.bottom + spacing.l }]}>
            <View style={styles.fieldWrap}>
              <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>Enter your name</Text>
              <View
                style={[
                  styles.textField,
                  {
                    borderColor: inputFocused ? colors.contentAccent : colors.borderPrimary,
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
                />
              </View>
            </View>
            <Button
              title="Gift a stock"
              disabled={draftName.trim().length < 1}
              onPress={async () => {
                const v = draftName.trim();
                if (!v) return;
                await setDisplayName(v);
                setName(v);
                router.replace('/send');
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── Home dashboard (name already set) ────────────────────────────────────────
  return (
    <Screen padded={false}>
      <FlatList
        data={sent}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: spacing.l, gap: spacing.m }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.contentAccent}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing.l, marginBottom: spacing.m }}>
            <View style={styles.dashHeader}>
              <Image
                source={require('@/assets/groww-logo.png')}
                style={styles.logoSmall}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={[type.headingBase, { color: colors.contentPrimary }]}>
                  Hi {name} 👋
                </Text>
                <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
                  Send the gift of ownership.
                </Text>
              </View>
            </View>
            <Button title="Gift a stock" onPress={() => router.push('/send')} />
            {holdings.length > 0 && (
              <Pressable
                onPress={() => router.push('/holdings')}
                style={[
                  styles.holdingsRow,
                  { backgroundColor: colors.backgroundAccentSubtle, borderRadius: radius.m },
                ]}
              >
                <Text style={[type.bodyBaseHeavy, { color: colors.contentAccent }]}>
                  {holdings.length} stock{holdings.length === 1 ? '' : 's'} received →
                </Text>
              </Pressable>
            )}
            <Text style={[type.headingSmall, { color: colors.contentPrimary, marginTop: spacing.l }]}>
              Sent gifts
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={[type.bodyBase, { color: colors.contentSecondary }]}>
            No gifts sent yet.
          </Text>
        }
        renderItem={({ item }) => (
          <SentRow gift={item} onPress={() => router.push(`/send/sent?id=${item.id}`)} />
        )}
      />
    </Screen>
  );
}

function SentRow({ gift, onPress }: { gift: Gift; onPress: () => void }) {
  const { colors } = useTheme();
  const isClaimed = gift.status === 'claimed';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sentRow,
        {
          backgroundColor: pressed ? colors.backgroundSurfaceZ2 : colors.backgroundSurfaceZ1,
          borderColor: colors.borderPrimary,
          borderRadius: radius.m,
        },
      ]}
    >
      <StockAvatar symbol={gift.stock_symbol} />
      <View style={{ flex: 1 }}>
        <Text style={[type.bodyBaseHeavy, { color: colors.contentPrimary }]}>
          {gift.unit === 'shares'
            ? `${formatShares(gift.quantity)} × ${gift.stock_symbol}`
            : `${formatINR(gift.quantity)} of ${gift.stock_symbol}`}
        </Text>
        <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
          {isClaimed ? `Claimed by ${gift.receiver_name ?? '—'}` : 'Pending'}
        </Text>
      </View>
      <View
        style={{
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.xs,
          borderRadius: radius.pill,
          backgroundColor: isClaimed ? colors.backgroundAccentSubtle : colors.backgroundTertiary,
        }}
      >
        <Text
          style={[
            type.bodySmallHeavy,
            { color: isClaimed ? colors.contentAccent : colors.contentSecondary },
          ]}
        >
          {isClaimed ? 'Claimed' : 'Pending'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Name-entry screen
  nameRoot: { flex: 1 },
  appBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  appBarSlot: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  growwLogo: { width: 32, height: 32 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
    paddingHorizontal: spacing.l,
  },
  cluster: { width: CLUSTER_W, height: CLUSTER_H },
  heroText: { gap: 2, alignItems: 'center' },
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

  // Dashboard
  dashHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  logoSmall: { width: 36, height: 36 },
  holdingsRow: { padding: spacing.m, alignItems: 'center' },
  sentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    padding: spacing.m,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
