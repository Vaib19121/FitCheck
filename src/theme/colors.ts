export type ThemeColors = {
  /** Brand colour for active tabs, links and buttons. */
  primary: string;
  /** Text/icons drawn on top of `primary`. */
  onPrimary: string;
  /** Soft tint for selected rows and chips. */
  primaryContainer: string;
  /** Screen background. */
  background: string;
  /** Cards, rows and the tab bar. */
  surface: string;
  text: string;
  textSecondary: string;
  /** Icons and hints only; not for body text. */
  textTertiary: string;
  border: string;
  danger: string;
};

export const lightColors: ThemeColors = {
  primary: '#1D5BD8',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E3ECFD',
  background: '#F3F6FC',
  surface: '#FFFFFF',
  text: '#0E1B33',
  textSecondary: '#4B5B76',
  textTertiary: '#8593AB',
  border: '#D5DEEC',
  danger: '#C62828',
};

export const darkColors: ThemeColors = {
  primary: '#6EA8FF',
  onPrimary: '#0A1222',
  primaryContainer: '#1B3566',
  background: '#0A1222',
  surface: '#131F36',
  text: '#E7EEFA',
  textSecondary: '#A3B2CC',
  textTertiary: '#6F7F9C',
  border: '#24365A',
  danger: '#FF8A80',
};
