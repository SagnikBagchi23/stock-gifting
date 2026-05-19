import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StatusBar, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { spacing } from '@/constants/tokens';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  scrollY?: Animated.Value;
  noBottomInset?: boolean;
};

export function Screen({ children, scroll = false, padded = true, style, scrollY, noBottomInset }: Props) {
  const { colors } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!scrollY) return;
    const id = scrollY.addListener(({ value }) => setScrolled(value >= 8));
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  const bgColor = scrolled ? colors.backgroundSurfaceZ1 : colors.backgroundPrimary;
  const edges = noBottomInset
    ? (['top', 'left', 'right'] as const)
    : (['top', 'left', 'right', 'bottom'] as const);
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]} edges={edges}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />
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
