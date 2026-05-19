import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { spacing } from '@/constants/tokens';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, scroll = false, padded = true, style }: Props) {
  const { colors } = useTheme();

  const Container = scroll ? ScrollView : View;
  return (
    // 'top' is excluded — AppBar extends into the status bar area and owns that background.
    // 'bottom' is included so SafeAreaView pads the home indicator area with backgroundPrimary,
    // which never changes (no scroll-aware color here).
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.backgroundPrimary }]}
      edges={['left', 'right', 'bottom']}
    >
      <Container
        style={[styles.container, style]}
        contentContainerStyle={padded && scroll ? { padding: spacing.l } : undefined}
      >
        {scroll ? children : <View style={padded ? { flex: 1, padding: spacing.l } : { flex: 1 }}>{children}</View>}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
});
