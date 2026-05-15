import React, { createContext, useContext } from 'react';
import { darkColors, type ColorTokens } from './tokens';

type ThemeContextValue = { colors: ColorTokens; scheme: 'dark' };

const defaultValue: ThemeContextValue = { colors: darkColors, scheme: 'dark' };

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={defaultValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
