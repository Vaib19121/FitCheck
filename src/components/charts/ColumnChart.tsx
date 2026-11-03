import { useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { columnPath, formatTick, niceMax } from './scale';
import { fonts, makeStyles, useTheme } from '../../theme';

type Datum = { label: string; value: number; detail?: string };

type Props = {
  data: Datum[];
  /** Formats the selected value in the readout. */
  formatValue: (value: number) => string;
  height?: number;
  /** Summary for screen readers (charts are otherwise opaque to them). */
  accessibilityLabel: string;
};

const AXIS_W = 40;
const LABEL_H = 18;
const MAX_BAR = 24;

/**
 * Single-series column chart. Tapping a column selects it and shows its value
 * in the readout above (the touch equivalent of a hover tooltip). The latest
 * column is selected by default.
 */
export function ColumnChart({ data, formatValue, height = 160, accessibilityLabel }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(data.length - 1);
  const sel = data[Math.min(selected, data.length - 1)];

  const max = niceMax(Math.max(...data.map(d => d.value), 0));
  const plotW = Math.max(0, width - AXIS_W);
  const plotH = height - LABEL_H;
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.min(MAX_BAR, band * 0.6);
  const y = (v: number) => plotH - (v / max) * plotH;

  return (
    <View accessible accessibilityLabel={accessibilityLabel}>
      <View style={styles.readout}>
        <Text style={styles.readoutValue}>{sel ? formatValue(sel.value) : '—'}</Text>
        <Text style={styles.readoutLabel}>{sel?.detail ?? sel?.label}</Text>
      </View>
      <View
        style={{ height }}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 ? (
          <Svg width={width} height={height}>
            {[0, 0.5, 1].map(f => (
              <Line
                key={f}
                x1={AXIS_W}
                x2={width}
                y1={y(max * f)}
                y2={y(max * f)}
                stroke={colors.chartGrid}
                strokeWidth={1}
              />
            ))}
            {data.map((d, i) => {
              const x = AXIS_W + i * band + (band - barW) / 2;
              const top = y(d.value);
              return (
                <Path
                  key={d.label + i}
                  d={columnPath(x, top, barW, plotH - top)}
                  fill={colors.chart}
                  opacity={i === selected ? 1 : 0.45}
                />
              );
            })}
          </Svg>
        ) : null}

        {/* Y ticks: text tokens only, never the data color. */}
        {[0, 0.5, 1].map(f => (
          <Text key={f} style={[styles.tick, { top: y(max * f) - 7 }]}>
            {formatTick(max * f)}
          </Text>
        ))}

        {/* Hit targets: the whole column band, taller than the mark. */}
        <View style={[styles.hitRow, { left: AXIS_W }]}>
          {data.map((d, i) => (
            <Pressable
              key={d.label + i}
              style={styles.hit}
              onPress={() => setSelected(i)}
              accessibilityRole="button"
              accessibilityLabel={`${d.detail ?? d.label}: ${formatValue(d.value)}`}
            >
              <Text
                style={[styles.xLabel, i === selected && styles.xLabelActive]}
                numberOfLines={1}
              >
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>
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
  hitRow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  hit: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  xLabel: {
    ...fonts.regular,
    fontSize: 10,
    color: colors.textTertiary,
  },
  xLabelActive: {
    ...fonts.semiBold,
    color: colors.text,
  },
}));
