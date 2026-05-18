import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Groww Gift',
  slug: 'stock-gifting',
  owner: 'growwdesign',
  version: '1.0.0',
  runtimeVersion: 'exposdk:54.0.0',
  updates: {
    url: 'https://u.expo.dev/3e962d09-1429-4ef5-a5ca-ffaeb85c4723',
  },
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'stockgifting',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  ios: { supportsTablet: true, bundleIdentifier: 'com.sagnikb.stockgifting' },
  android: {
    package: 'com.sagnikb.stockgifting',
    adaptiveIcon: {
      backgroundColor: '#0D0D0D',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: { output: 'static', favicon: './assets/images/favicon.png' },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#0D0D0D',
      },
    ],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: '3e962d09-1429-4ef5-a5ca-ffaeb85c4723',
    },
  },
};

export default config;
