import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { fonts, makeStyles, useTheme } from '../theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** Allow one decimal place (weights). */
  decimal?: boolean;
  accessibilityLabel: string;
};

/** Compact −/value/+ control with an editable number field. */
export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  decimal = false,
  accessibilityLabel,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [text, setText] = useState(String(value));

  // Keep the field in sync when the value changes from outside (steppers, prefill).
  useEffect(() => setText(String(value)), [value]);

  const clamp = (n: number) => {
    const rounded = decimal ? Math.round(n * 10) / 10 : Math.round(n);
    return Math.min(max, Math.max(min, rounded));
  };

  const commit = () => {
    const parsed = parseFloat(text.replace(',', '.'));
    const next = Number.isFinite(parsed) ? clamp(parsed) : value;
    setText(String(next));
    if (next !== value) {
      onChange(next);
    }
  };

  const stepButton = (dir: -1 | 1) => (
    <Pressable
      onPress={() => onChange(clamp(value + dir * step))}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`${dir < 0 ? 'Decrease' : 'Increase'} ${accessibilityLabel}`}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={dir < 0 ? 'remove' : 'add'}
        size={16}
        color={colors.textSecondary}
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {stepButton(-1)}
      <TextInput
        value={text}
        onChangeText={setText}
        onEndEditing={commit}
        onBlur={commit}
        keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
        selectTextOnFocus
        style={styles.input}
        accessibilityLabel={accessibilityLabel}
      />
      {stepButton(1)}
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  button: {
    width: 30,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  input: {
    ...fonts.semiBold,
    minWidth: 44,
    fontSize: 16,
    textAlign: 'center',
    color: colors.text,
    paddingVertical: 0,
    fontVariant: ['tabular-nums'],
  },
}));
