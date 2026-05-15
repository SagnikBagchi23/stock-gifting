import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { GiftCard } from '@/components/gift/GiftCard';
import { SuccessAnimation } from '@/components/gift/SuccessAnimation';
import { useTheme } from '@/constants/theme';
import { spacing, type } from '@/constants/tokens';
import { claimGift, getGift } from '@/lib/gifts';
import { getDisplayName, setDisplayName } from '@/lib/identity';
import type { Gift } from '@/types';

export default function ReceiveGift() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([getGift(id), getDisplayName()]).then(([g, n]) => {
      setGift(g);
      if (n) setName(n);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <Screen>
        <AppBar title="Incoming gift" />
        <Text style={[type.bodyBase, { color: colors.contentSecondary }]}>Loading…</Text>
      </Screen>
    );
  }

  if (!gift) {
    return (
      <Screen>
        <AppBar title="Incoming gift" />
        <View style={{ gap: spacing.m }}>
          <Text style={[type.headingBase, { color: colors.contentPrimary }]}>
            This gift link is no longer valid.
          </Text>
          <Button title="Go home" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  if (gift.status === 'claimed' && !accepted) {
    return (
      <Screen>
        <AppBar title="Already claimed" />
        <View style={{ gap: spacing.m }}>
          <Text style={[type.headingBase, { color: colors.contentPrimary }]}>
            This gift was already claimed.
          </Text>
          <Button title="Go home" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  if (accepted) {
    return (
      <Screen>
        <AppBar title="Accepted" />
        <View style={styles.center}>
          <SuccessAnimation label="Stock added to your holdings" />
          <Button title="View holdings" onPress={() => router.replace('/holdings')} style={{ marginTop: spacing.xl }} />
        </View>
      </Screen>
    );
  }

  const canAccept = name.trim().length > 0 && !submitting;

  return (
    <Screen padded={false}>
      <AppBar title="Incoming gift" />
      <ScrollView contentContainerStyle={{ padding: spacing.l, gap: spacing.l }} keyboardShouldPersistTaps="handled">
        <Text style={[type.headingBase, { color: colors.contentPrimary }]}>
          🎁 {gift.sender_name} sent you a stock
        </Text>
        <GiftCard gift={gift} showFrom />
        <TextField
          label="Your name"
          placeholder="e.g. Aman"
          value={name}
          onChangeText={setName}
          maxLength={40}
        />
        <Button
          title={submitting ? 'Accepting…' : 'Accept gift'}
          loading={submitting}
          disabled={!canAccept}
          onPress={async () => {
            setSubmitting(true);
            await setDisplayName(name);
            const res = await claimGift(gift.id, name);
            setSubmitting(false);
            if ('error' in res) {
              Alert.alert('Could not accept', res.error);
              return;
            }
            setAccepted(true);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.l },
});
