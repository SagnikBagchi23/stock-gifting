import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'stockgifting:displayName';

export async function getDisplayName(): Promise<string | null> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v && v.trim().length > 0 ? v : null;
  } catch {
    return null;
  }
}

export async function setDisplayName(name: string): Promise<void> {
  const trimmed = name.trim().slice(0, 40);
  if (trimmed.length < 1) return;
  try {
    await AsyncStorage.setItem(KEY, trimmed);
  } catch {
    // intentionally swallow — non-critical
  }
}
