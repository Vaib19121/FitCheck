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
  /** Inputs, set rows and other nested surfaces inside cards. */
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  /** Icons and hints only; not for body text. */
  textTertiary: string;
  border: string;
  danger: string;
  /** Completed sets, PRs, goals reached. */
  success: string;
  /** Streaks, rest timer. */
  warning: string;
  /** Single-series chart marks (validated vs. surface for each mode). */
  chart: string;
  /** Chart track / gridlines: one step off the surface. */
  chartGrid: string;
};

export const lightColors: ThemeColors = {
  primary: '#E8590C',
  onPrimary: '#FFFFFF',
  primaryContainer: '#FFE8D9',
  background: '#F6F5F3',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EFEC',
  text: '#1A1714',
  textSecondary: '#5C554E',
  textTertiary: '#9A928A',
  border: '#E4E0DB',
  danger: '#C62828',
  success: '#2E9D5B',
  warning: '#D99A00',
  chart: '#E8590C',
  chartGrid: '#ECE9E5',
};

export const darkColors: ThemeColors = {
  primary: '#FF7A33',
  onPrimary: '#1A0C04',
  primaryContainer: '#4A2512',
  background: '#121110',
  surface: '#1D1B19',
  surfaceAlt: '#282522',
  text: '#F4F1EE',
  textSecondary: '#BDB5AD',
  textTertiary: '#7E766F',
  border: '#33302C',
  danger: '#FF8A80',
  success: '#4CC97F',
  warning: '#F2B92E',
  chart: '#E8650F',
  chartGrid: '#2B2825',
};
