import { useEffect, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { formatTick, niceMax } from './scale';
import { fonts, makeStyles, useTheme } from '../../theme';

type Point = { value: number; label: string };

type Props = {
  data: Point[];
  formatValue: (value: number) => string;
  height?: number;
  accessibilityLabel: string;
};

const AXIS_W = 40;
const PAD_TOP = 10;
const LABEL_H = 18;

/**
 * Single-series line (2px) with a 10% area wash. Points are evenly spaced
 * (one per session). Touch/drag selects the nearest point; the latest point
 * is selected by default and marked with an end-dot.
 */
export function LineChart({ data, formatValue, height = 160, accessibilityLabel }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(data.length - 1);

  // New series (e.g. a different exercise) → select its latest point again.
  useEffect(() => setSelected(data.length - 1), [data]);

  const sel = data[Math.min(selected, data.length - 1)];
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const maxV = Math.max(...values);
  // Weights don't start at zero meaningfully; frame the range with headroom.
  const lo = data.length > 1 ? Math.max(0, min - (maxV - min) * 0.25) : 0;
  const hi = niceMax(maxV <= lo ? lo + 1 : maxV);
  const plotW = Math.max(0, width - AXIS_W - 12);
  const plotH = height - LABEL_H - PAD_TOP;

  const x = (i: number) =>
    AXIS_W + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => PAD_TOP + plotH - ((v - lo) / (hi - lo || 1)) * plotH;

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
  const area =
    data.length > 1
      ? `${line} L${x(data.length - 1)},${PAD_TOP + plotH} L${x(0)},${PAD_TOP + plotH} Z`
      : '';

  const selectAt = (e: GestureResponderEvent) => {
    if (data.length < 2) {
      return;
    }
    const rel = (e.nativeEvent.locationX - AXIS_W) / plotW;
    setSelected(Math.max(0, Math.min(data.length - 1, Math.round(rel * (data.length - 1)))));
  };

  return (
    <View accessible accessibilityLabel={accessibilityLabel}>
      <View style={styles.readout}>
        <Text style={styles.readoutValue}>{sel ? formatValue(sel.value) : '—'}</Text>
        <Text style={styles.readoutLabel}>{sel?.label}</Text>
      </View>
      <View
        style={{ height }}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={selectAt}
        onResponderMove={selectAt}
      >
        {width > 0 && data.length ? (
          <Svg width={width} height={height} pointerEvents="none">
            {[0, 0.5, 1].map(f => {
              const v = lo + (hi - lo) * f;
              return (
                <Line
                  key={f}
                  x1={AXIS_W}
                  x2={width}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={colors.chartGrid}
                  strokeWidth={1}
                />
              );
            })}
            {area ? <Path d={area} fill={colors.chart} opacity={0.1} /> : null}
            {data.length > 1 ? (
              <Path
                d={line}
                stroke={colors.chart}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
            {sel ? (
              <>
                {/* Crosshair for the selected point. */}
                <Line
                  x1={x(selected)}
                  x2={x(selected)}
                  y1={PAD_TOP}
                  y2={PAD_TOP + plotH}
                  stroke={colors.textTertiary}
                  strokeWidth={1}
                />
                {/* r=5 dot with a 2px surface ring. */}
                <Circle
                  cx={x(selected)}
                  cy={y(sel.value)}
                  r={5}
                  fill={colors.chart}
                  stroke={colors.surface}
                  strokeWidth={2}
                />
              </>
            ) : null}
          </Svg>
        ) : null}

        {[0, 0.5, 1].map(f => {
          const v = lo + (hi - lo) * f;
          return (
            <Text key={f} style={[styles.tick, { top: y(v) - 7 }]} pointerEvents="none">
              {formatTick(v)}
            </Text>
          );
        })}

        {data.length ? (
          <View style={[styles.xAxis, { left: AXIS_W }]} pointerEvents="none">
            <Text style={styles.xLabel}>{data[0].label}</Text>
            {data.length > 1 ? (
              <Text style={styles.xLabel}>{data[data.length - 1].label}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  readout: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  readoutValue: {
    ...fonts.bold,
    fontSize: 20,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  readoutLabel: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tick: {
    ...fonts.regular,
    position: 'absolute',
    left: 0,
    width: AXIS_W - 6,
    textAlign: 'right',
    fontSize: 10,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  xAxis: {
    position: 'absolute',
    right: 12,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    ...fonts.regular,
    fontSize: 10,
    color: colors.textTertiary,
  },
}));
