import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { radius, type } from '@/constants/tokens';
import { getStockLogo } from '@/data/stockLogos';

// Mint DS rule: fallback is 2-char ticker in 40×40 rounded square (radius.m, backgroundTertiary, contentSecondary body-small-heavy)
export function StockAvatar({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const { colors } = useTheme();
  const logo = getStockLogo(symbol);
  const br = radius.m;

  if (logo) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: br,
            backgroundColor: colors.backgroundSurfaceZ1,
            overflow: 'hidden',
          },
        ]}
      >
        <Image source={logo} style={{ width: size, height: size }} resizeMode="contain" />
      </View>
    );
  }

  const initials = symbol.slice(0, 2).toUpperCase();
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: br,
          backgroundColor: colors.backgroundTertiary,
        },
      ]}
    >
      <Text style={[type.bodySmallHeavy, { color: colors.contentSecondary }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
