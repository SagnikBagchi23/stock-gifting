import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { radius, spacing, type } from '@/constants/tokens';
import { StockAvatar } from '@/components/ui/StockAvatar';
import type { Gift } from '@/types';
import { formatINR, formatShares } from '@/utils/format';

type Props = {
  gift: Gift;
  showFrom?: boolean;
};

export function GiftCard({ gift, showFrom }: Props) {
  const { colors } = useTheme();
  const qtyLine =
    gift.unit === 'shares'
      ? `${formatShares(gift.quantity)} share${gift.quantity === 1 ? '' : 's'} of ${gift.stock_symbol}`
      : `${formatINR(gift.quantity)} of ${gift.stock_symbol}`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundSurfaceZ1,
          borderColor: colors.borderPrimary,
          borderRadius: radius.l,
          overflow: 'hidden',
        },
      ]}
    >
      <View style={[styles.headerStrip, { backgroundColor: colors.backgroundAccentSubtle }]}>
        <Text style={[type.headingEyebrow, { color: colors.contentAccent }]}>Stock Gift</Text>
        {showFrom ? (
          <Text style={[type.bodySmall, { color: colors.contentSecondary }]}>
            from {gift.sender_name}
          </Text>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.stockRow}>
          <StockAvatar symbol={gift.stock_symbol} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={[type.headingBase, { color: colors.contentPrimary }]}>
              {gift.stock_symbol}
            </Text>
            <Text
              style={[type.bodySmall, { color: colors.contentSecondary }]}
              numberOfLines={1}
            >
              {gift.stock_name}
            </Text>
          </View>
        </View>

        <View style={{ gap: spacing.xxs }}>
          <Text style={[type.displaySmall, { color: colors.contentPrimary }]}>{qtyLine}</Text>
          <Text style={[type.bodyLarge, { color: colors.contentAccent }]}>
            ≈ {formatINR(gift.total_value)}
          </Text>
        </View>

        {gift.note ? (
          <View
            style={[
              styles.noteBox,
              { backgroundColor: colors.backgroundSurfaceZ2, borderRadius: radius.m },
            ]}
          >
            <Text style={[type.bodySmall, { color: colors.contentTertiary }]}>Note</Text>
            <Text style={[type.bodyBase, { color: colors.contentPrimary }]}>
              "{gift.note}"
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  headerStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  body: { padding: spacing.l, gap: spacing.l },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  noteBox: { padding: spacing.m, gap: spacing.xxs },
});
