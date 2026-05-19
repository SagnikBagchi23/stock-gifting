import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
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

const MAX_CHARS = 20;

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

  const keyboardPad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, (e) => {
      Animated.timing(keyboardPad, {
        toValue: e.endCoordinates.height - insets.bottom + 16,
        duration: e.duration > 0 ? e.duration : 250,
        easing: Easing.bezier(0.36, 0.66, 0.04, 1),
        useNativeDriver: false,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvt, (e) => {
      Animated.timing(keyboardPad, {
        toValue: 0,
        duration: e.duration > 0 ? e.duration : 250,
        useNativeDriver: false,
      }).start();
    });
    return () => { onShow.remove(); onHide.remove(); };
  }, [insets.bottom]);

  const charCount = message.length;
  const remaining = MAX_CHARS - charCount;
  const isNearLimit = remaining <= 10;
  const canContinue = message.trim().length > 0;

  return (
    <Screen padded={false}>
      <AppBar title="Write a message" showBack leftTitle />

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

        <Animated.View style={[styles.cta, { paddingBottom: keyboardPad }]}>
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
        </Animated.View>
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
