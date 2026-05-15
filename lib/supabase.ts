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

export const supabase = createClient(url ?? '', anon ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
