import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/theme';
import { type } from '@/constants/tokens';

export function SuccessAnimation({ label = 'Gift accepted' }: { label?: string }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.ring,
          { backgroundColor: colors.backgroundAccent, transform: [{ scale }] },
        ]}
      >
        <Text style={styles.check}>✓</Text>
      </Animated.View>
      <Animated.Text style={[type.headingBase, { color: colors.contentPrimary, opacity }]}>
        {label}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 16 },
  ring: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  check: { color: '#FFFFFF', fontSize: 48, lineHeight: 52, fontWeight: '700' },
});
