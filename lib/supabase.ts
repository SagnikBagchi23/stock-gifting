// SECURITY NOTE — DEMO ONLY:
// Supabase RLS policies for `gifts` are intentionally OPEN (anon can select/insert/update).
// This is acceptable for a 4-hour, throwaway prototype with a public anon key.
// Before any non-demo use: tighten RLS (per-row ownership, signed identity), add rate limiting,
// move to a proper auth flow.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const url = extra.supabaseUrl;
const anon = extra.supabaseAnonKey;

if (!url || !anon) {
  // Fail loudly at import if env vars are missing — surface a clear dev-time error.
  // Generic user-facing handling lives in lib/gifts.ts; this assert is for the developer.
  // eslint-disable-next-line no-console
  console.error('[supabase] Missing SUPABASE_URL / SUPABASE_ANON_KEY in app config extra.');
}

// Web SSR (Node 20) has no global WebSocket; supabase-js realtime checks for
// it at construction time and throws. Polyfill before createClient runs.
// Hide the require from Metro's static analyzer so `ws` (and its Node `stream`
// dep) never get pulled into the React Native bundle.
if (typeof globalThis.WebSocket === 'undefined' && typeof process !== 'undefined' && process.versions?.node) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeRequire = (0, eval)('require') as NodeRequire;
    (globalThis as unknown as { WebSocket: unknown }).WebSocket = nodeRequire('ws');
  } catch {
    // realtime won't work here, but createClient will still succeed
  }
}

// Use a syntactically-valid placeholder URL when env vars are missing so
// `new URL(url)` inside supabase-js doesn't throw at module-import time
// (which would crash any screen that imports this file).
export const supabase = createClient(
  url || 'https://placeholder.invalid',
  anon || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);
