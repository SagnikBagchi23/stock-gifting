import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View, ViewStyle } from 'react-native';
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.backgroundPrimary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
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
