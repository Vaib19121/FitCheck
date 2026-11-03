import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

import { darkColors, lightColors, ThemeColors } from './colors';

export type { ThemeColors } from './colors';

// System font weights. Swap for custom font faces if you add any to assets/.
export const fonts = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semiBold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return { isDark, colors: isDark ? darkColors : lightColors };
}

// Same constraint StyleSheet.create uses, so literal values like 'center' stay typed.
type NamedStyles = Parameters<typeof StyleSheet.create>[0];

/**
 * Creates a hook returning themed styles, rebuilt when light/dark mode changes.
 *
 *   const useStyles = makeStyles(colors => ({ title: { color: colors.text } }));
 */
export function makeStyles<T extends NamedStyles>(
  factory: (colors: ThemeColors) => T & NamedStyles,
) {
  return function useStyles() {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

function toNavigationTheme(base: Theme, colors: ThemeColors): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };
}

export const navigationThemes = {
  light: toNavigationTheme(DefaultTheme, lightColors),
  dark: toNavigationTheme(DarkTheme, darkColors),
};
