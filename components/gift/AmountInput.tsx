import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { radius, spacing, type } from '@/constants/tokens';

type Props = {
  unit: 'shares' | 'rupees';
  value: string;
  onChange: (v: string) => void;
};

const QUICK_RUPEES = [
  { label: '₹100', value: '100' },
  { label: '₹500', value: '500' },
  { label: '₹1k', value: '1000' },
  { label: '₹5k', value: '5000' },
];

const QUICK_SHARES = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '5', value: '5' },
  { label: '10', value: '10' },
];

export function AmountInput({ unit, value, onChange }: Props) {
  const { colors } = useTheme();
  const prefix = unit === 'rupees' ? '₹' : '';
  const suffix = unit === 'shares' ? 'shares' : '';
  const chips = unit === 'rupees' ? QUICK_RUPEES : QUICK_SHARES;

  return (
    <View style={{ gap: spacing.s }}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.backgroundSurfaceZ1,
            borderColor: colors.borderPrimary,
            borderRadius: radius.l,
          },
        ]}
      >
        {prefix ? (
          <Text style={[type.displayBase, { color: colors.contentSecondary }]}>{prefix}</Text>
        ) : null}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.contentPrimary,
              fontFamily: type.displayBase.fontFamily,
              fontSize: type.displayBase.fontSize,
            },
          ]}
          keyboardType={unit === 'shares' ? 'number-pad' : 'decimal-pad'}
          value={value}
          onChangeText={(t) => {
            const cleaned = unit === 'shares'
              ? t.replace(/[^0-9]/g, '')
              : t.replace(/[^0-9.]/g, '');
            onChange(cleaned);
          }}
          placeholder="0"
          placeholderTextColor={colors.contentDisabled}
        />
        {suffix ? (
          <Text style={[type.bodyLarge, { color: colors.contentSecondary }]}>{suffix}</Text>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {chips.map((c) => {
          const selected = value === c.value;
          return (
            <Pressable
              key={c.value}
              onPress={() => onChange(c.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? colors.backgroundAccentSubtle
                    : colors.backgroundSurfaceZ2,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                style={[
                  type.bodySmallHeavy,
                  { color: selected ? colors.contentAccent : colors.contentSecondary },
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    padding: spacing.l,
    borderWidth: 1,
    minHeight: 96,
  },
  input: { minWidth: 80, textAlign: 'center', padding: 0 },
  chips: { flexDirection: 'row', gap: spacing.s, paddingHorizontal: spacing.xxs },
  chip: { paddingHorizontal: spacing.m, paddingVertical: spacing.s },
});
