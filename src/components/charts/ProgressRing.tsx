import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../../theme';

type Props = {
  /** 0..1; values above 1 render as a full ring. */
  progress: number;
  size?: number;
  stroke?: number;
  /** Fill colour; defaults to the chart colour. Track is a lighter step. */
  color?: string;
  children?: ReactNode;
  accessibilityLabel: string;
};

/** Meter ring: filled arc on a recessive track, content centred inside. */
export function ProgressRing({
  progress,
  size = 112,
  stroke = 10,
  color,
  children,
  accessibilityLabel,
}: Props) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[styles.box, { width: size, height: size }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.chartGrid}
          strokeWidth={stroke}
          fill="none"
        />
        {p > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color ?? colors.chart}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c * p} ${c}`}
            // Start at 12 o'clock.
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
