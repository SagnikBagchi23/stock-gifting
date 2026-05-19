import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { radius, spacing, fonts } from '@/constants/tokens';

type Props = {
  onKey: (key: string) => void;
  mode: 'amount' | 'quantity';
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

export function Numpad({ onKey, mode }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.numpad}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => {
            const isBackspace = key === '⌫';
            const isDecimal = key === '.';
            const disabled = isDecimal && mode === 'quantity';

            return (
              <Pressable
                key={key}
                onPress={
                  disabled
                    ? undefined
                    : () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onKey(key);
                      }
                }
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor:
                      pressed && !disabled ? colors.backgroundTertiary : 'transparent',
                    borderRadius: radius.l,
                    opacity: disabled ? 0.25 : 1,
                  },
                ]}
              >
                {isBackspace ? (
                  <Feather name="delete" size={24} color={colors.contentPrimary} />
                ) : (
                  <Text style={[styles.keyText, { color: colors.contentPrimary }]}>{key}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  numpad: {
    width: '100%',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: 40,
    gap: spacing.s,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.s,
    height: 56,
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 36,
  },
});
