import React from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/constants/theme';
import { ActivityIndicator, View } from 'react-native';
import { darkColors } from '@/constants/tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'GrowwSans-Regular': require('@/assets/fonts/GrowwSans-Regular.otf'),
    'GrowwSans-Medium': require('@/assets/fonts/GrowwSans-Medium.otf'),
    'Sohne-Kraftig': require('@/assets/fonts/Sohne-Kraftig.otf'),
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: darkColors.backgroundPrimary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={darkColors.contentAccent} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: darkColors.backgroundPrimary },
        }}
      />
    </ThemeProvider>
  );
}
