// Mint DS tokens — Groww Invest. Dark-first per project spec.
// Light values lifted verbatim from _inputs/mint-ds-groww-invest-v0.19.md (CSS Starter Block).
// Dark values are sensible inversions per the doc's "Steps 1–12 run lightest to darkest in light mode,
// and darkest to lightest in dark mode" rule.

export const lightColors = {
  backgroundPrimary: '#FFFFFF',
  backgroundSurfaceZ1: '#FFFFFF',
  backgroundSurfaceZ2: '#F7F7F7',
  backgroundSecondary: '#F7F7F7',
  backgroundTertiary: '#EFF0F1',
  backgroundAccent: '#04B488',
  backgroundNegative: '#ED5533',
  backgroundPositive: '#04B488',
  backgroundWarning: '#E7A71E',
  backgroundAccentSubtle: '#E9FAF3',
  backgroundNegativeSubtle: '#FFF1ED',
  backgroundPositiveSubtle: '#E9FAF3',
  backgroundWarningSubtle: '#FFF7DE',
  backgroundDisabled: '#F7F7F7',
  contentPrimary: '#353839',
  contentSecondary: '#7F8283',
  contentTertiary: '#898C8E',
  contentDisabled: '#BABBBC',
  contentAccent: '#04B488',
  contentPositive: '#04B488',
  contentNegative: '#ED5533',
  contentWarning: '#E7A71E',
  contentOnColour: '#FFFFFF',
  borderPrimary: '#E5E6E7',
  borderDisabled: '#EFF0F1',
  borderNeutral: '#353839',
} as const;

export const darkColors = {
  backgroundPrimary: '#0D0D0D',
  backgroundSurfaceZ1: '#161616',
  backgroundSurfaceZ2: '#1E1E1E',
  backgroundSecondary: '#161616',
  backgroundTertiary: '#252525',
  backgroundAccent: '#04B488',
  backgroundNegative: '#ED5533',
  backgroundPositive: '#04B488',
  backgroundWarning: '#E7A71E',
  backgroundAccentSubtle: '#0F2A22',
  backgroundNegativeSubtle: '#2C1612',
  backgroundPositiveSubtle: '#0F2A22',
  backgroundWarningSubtle: '#2A2010',
  backgroundDisabled: '#1E1E1E',
  contentPrimary: '#F2F2F2',
  contentSecondary: '#9A9D9F',
  contentTertiary: '#7A7D7F',
  contentDisabled: '#4A4D4F',
  contentAccent: '#22D7A2',
  contentPositive: '#22D7A2',
  contentNegative: '#FF6B49',
  contentWarning: '#F0B83E',
  contentOnColour: '#FFFFFF',
  borderPrimary: '#2A2A2A',
  borderDisabled: '#1E1E1E',
  borderNeutral: '#F2F2F2',
} as const;

export type ColorTokens = typeof darkColors;

export const spacing = {
  xxs: 2,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  pill: 999,
} as const;

export const fonts = {
  body: 'GrowwSans-Regular',
  bodyMedium: 'GrowwSans-Medium',
  heading: 'Sohne-Kraftig',
} as const;

// Typography styles per Mint DS doc CSS Starter Block.
export const type = {
  bodySmall: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  bodySmallHeavy: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 18 },
  bodyBase: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  bodyBaseHeavy: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
  bodyLarge: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyLargeHeavy: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 24 },
  headingEyebrow: {
    fontFamily: fonts.heading,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  headingXSmall: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 20 },
  headingSmall: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 24 },
  headingBase: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 28 },
  headingLarge: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 32 },
  displaySmall: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 32 },
  displayBase: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 36 },
} as const;
