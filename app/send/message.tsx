import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/ui/Screen';
import { AppBar } from '@/components/ui/AppBar';
import { Button } from '@/components/ui/Button';
import { findStock } from '@/data/stocks';
import { useTheme } from '@/constants/theme';
import { spacing, type, radius } from '@/constants/tokens';

const MAX_CHARS = 50;

export default function WriteMessage() {
  const { symbol, amount, unit, price } = useLocalSearchParams<{
    symbol: string;
    amount: string;
    unit: string;
    price: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const insets = useSafeAreaInsets();
  const stock = findStock(symbol ?? '');

  const charCount = message.length;
  const remaining = MAX_CHARS - charCount;
  const isNearLimit = remaining <= 10;
  const canContinue = message.trim().length > 0;

  return (
    <Screen padded={false}>
      <AppBar title="Write a message" showBack leftTitle />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.fieldSection}>
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
                style={[type.bodyBase, { color: colors.contentPrimary, flex: 1, padding: 0 }]}
                placeholder="Eg: Happy Birthday!"
                placeholderTextColor={colors.contentTertiary}
                value={message}
                onChangeText={setMessage}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                maxLength={MAX_CHARS}
                autoCapitalize="sentences"
                autoCorrect
                selectionColor={colors.contentAccent}
                autoFocus
              />
            </View>

            <View style={styles.helperRow}>
              <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
                Max {MAX_CHARS} characters
              </Text>
              {charCount > 0 && (
                <Text
                  style={[
                    type.bodySmall,
                    { color: isNearLimit ? colors.contentNegative : colors.contentSecondary },
                  ]}
                >
                  {charCount} / {MAX_CHARS}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.cta, { paddingBottom: spacing.l }]}>
          <Button
            title="Continue"
            disabled={!canContinue}
            onPress={() => {
              if (!canContinue) return;
              router.push(
                `/send/confirm?symbol=${symbol}&amount=${amount}&unit=${unit}&price=${price}&message=${encodeURIComponent(message.trim())}`
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldSection: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    gap: spacing.xs,
  },
  textField: {
    height: 56,
    borderRadius: radius.l,
    borderWidth: 2,
    paddingHorizontal: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: spacing.l,
    paddingRight: spacing.xs,
  },
  cta: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
  },
});
