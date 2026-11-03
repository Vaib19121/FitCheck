import { Pressable, ScrollView, StyleProp, Text, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { fonts, makeStyles, spacing, useTheme } from '../theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected, onPress, icon, style }: ChipProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tint = selected ? colors.primary : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={tint} /> : null}
      <Text style={[styles.label, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

type Option<T> = { value: T; label: string };

type FilterChipsProps<T> = {
  options: Option<T>[];
  selected: T | null;
  onChange: (value: T | null) => void;
  /** Label for the "no filter" chip; omit to hide it. */
  allLabel?: string;
};

/** Horizontally scrolling single-select chip row. Tapping the active chip clears it. */
export function FilterChips<T extends string>({
  options,
  selected,
  onChange,
  allLabel = 'All',
}: FilterChipsProps<T>) {
  const styles = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {allLabel ? (
        <Chip
          label={allLabel}
          selected={selected === null}
          onPress={() => onChange(null)}
        />
      ) : null}
      {options.map(o => (
        <Chip
          key={o.value}
          label={o.label}
          selected={selected === o.value}
          onPress={() => onChange(selected === o.value ? null : o.value)}
        />
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles(colors => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    ...fonts.medium,
    fontSize: 13,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
}));
