import React, { useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { Button } from '@/components/ui/Button';
import { GiftCard } from '@/components/gift/GiftCard';
import { useTheme } from '@/constants/theme';
import { spacing, type, radius } from '@/constants/tokens';
import { getGift, subscribeToGift } from '@/lib/gifts';
import type { Gift } from '@/types';

export default function Sent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getGift(id).then((g) => {
      if (cancelled) return;
      setGift(g);
      setLoading(false);
    });
    const unsub = subscribeToGift(id, (g) => {
      if (!cancelled) setGift(g);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [id]);

  const link = id ? Linking.createURL(`/gift/${id}`) : '';

  const onShare = async () => {
    if (!gift) return;
    try {
      await Share.share({
        message: `${gift.sender_name} sent you a stock 🎁\n${link}`,
      });
    } catch {
      Alert.alert('Could not open share sheet');
    }
  };

  if (loading) {
    return (
      <Screen>
        <AppBar title="Gift sent" showBack />
        <Text style={[type.bodyBase, { color: colors.contentSecondary }]}>Loading…</Text>
      </Screen>
    );
  }

  if (!gift) {
    return (
      <Screen>
        <AppBar title="Gift sent" showBack />
        <Text style={[type.bodyBase, { color: colors.contentPrimary }]}>This gift link is no longer valid.</Text>
      </Screen>
    );
  }

  const isClaimed = gift.status === 'claimed';

  return (
    <Screen padded={false}>
      <AppBar title="Gift sent" showBack />
      <View style={{ padding: spacing.l, gap: spacing.l, flex: 1 }}>
        <View
          style={[
            styles.statusHero,
            {
              backgroundColor: isClaimed ? colors.backgroundAccentSubtle : colors.backgroundSurfaceZ2,
              borderRadius: radius.l,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isClaimed ? colors.backgroundAccent : colors.backgroundTertiary },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{isClaimed ? '✓' : '⏳'}</Text>
          </View>
          <Text
            style={[
              type.headingBase,
              { color: isClaimed ? colors.contentAccent : colors.contentPrimary, textAlign: 'center' },
            ]}
          >
            {isClaimed ? `Claimed by ${gift.receiver_name ?? '—'}` : 'Waiting for your friend'}
          </Text>
          {!isClaimed && (
            <Text style={[type.bodySmall, { color: colors.contentSecondary, textAlign: 'center' }]}>
              Share the link below. Status updates live when they accept.
            </Text>
          )}
        </View>
        <GiftCard gift={gift} />
        <Button title="Share gift link" onPress={onShare} disabled={isClaimed} />
        <Button title="Done" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusHero: {
    padding: spacing.l,
    alignItems: 'center',
    gap: spacing.m,
  },
  statusDot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
