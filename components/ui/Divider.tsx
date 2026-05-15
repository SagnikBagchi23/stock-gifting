import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/constants/theme';

export function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.d, { backgroundColor: colors.borderPrimary }]} />;
}

const styles = StyleSheet.create({
  d: { height: StyleSheet.hairlineWidth, width: '100%' },
});
