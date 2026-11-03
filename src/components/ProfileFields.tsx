import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Chip } from './Chip';
import { NumberStepper } from './NumberStepper';
import {
  EQUIPMENT_GROUPS,
  EQUIPMENT_PRESETS,
  EquipmentGroupKey,
} from '../data/equipment';
import {
  GOAL_ICONS,
  GOAL_LABELS,
  Goal,
  LEVEL_HINTS,
  LEVEL_LABELS,
  Level,
} from '../store/profileStore';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import { WeightUnit } from '../utils/format';

// Shared between onboarding and the Profile tab so both edit the same way.

type OptionRowProps = {
  title: string;
  hint?: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  /** Checkbox look for multi-select lists. */
  multi?: boolean;
};

export function OptionRow({ title, hint, icon, selected, onPress, multi }: OptionRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const check = multi
    ? selected
      ? 'checkbox'
      : 'square-outline'
    : selected
    ? 'radio-button-on'
    : 'radio-button-off';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={22}
          color={selected ? colors.primary : colors.textSecondary}
        />
      ) : null}
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        {hint ? <Text style={styles.optionHint}>{hint}</Text> : null}
      </View>
      <Ionicons
        name={check}
        size={22}
        color={selected ? colors.primary : colors.textTertiary}
      />
    </Pressable>
  );
}

type Picker<T> = { value: T; onChange: (value: T) => void };

export function GoalPicker({ value, onChange }: Picker<Goal>) {
  const styles = useStyles();
  return (
    <View style={styles.list}>
      {(Object.keys(GOAL_LABELS) as Goal[]).map(goal => (
        <OptionRow
          key={goal}
          title={GOAL_LABELS[goal]}
          icon={GOAL_ICONS[goal]}
          selected={value === goal}
          onPress={() => onChange(goal)}
        />
      ))}
    </View>
  );
}

export function LevelPicker({ value, onChange }: Picker<Level>) {
  const styles = useStyles();
  return (
    <View style={styles.list}>
      {(Object.keys(LEVEL_LABELS) as Level[]).map(level => (
        <OptionRow
          key={level}
          title={LEVEL_LABELS[level]}
          hint={LEVEL_HINTS[level]}
          selected={value === level}
          onPress={() => onChange(level)}
        />
      ))}
    </View>
  );
}

export function EquipmentPicker({
  value,
  onChange,
}: Picker<EquipmentGroupKey[]>) {
  const styles = useStyles();
  const selected = new Set(value);
  const toggle = (key: EquipmentGroupKey) =>
    onChange(
      selected.has(key) ? value.filter(k => k !== key) : [...value, key],
    );
  const sameSet = (groups: EquipmentGroupKey[]) =>
    groups.length === value.length && groups.every(g => selected.has(g));

  return (
    <View style={styles.list}>
      <View style={styles.chipWrap}>
        {EQUIPMENT_PRESETS.map(p => (
          <Chip
            key={p.label}
            label={p.label}
            selected={sameSet(p.groups)}
            onPress={() => onChange([...p.groups])}
          />
        ))}
      </View>
      <OptionRow
        title="Body weight"
        hint="Always included"
        icon="body-outline"
        selected
        multi
        onPress={() => {}}
      />
      {EQUIPMENT_GROUPS.map(g => (
        <OptionRow
          key={g.key}
          title={g.label}
          icon={g.icon}
          selected={selected.has(g.key)}
          multi
          onPress={() => toggle(g.key)}
        />
      ))}
    </View>
  );
}

export function UnitPicker({ value, onChange }: Picker<WeightUnit>) {
  const styles = useStyles();
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {(['kg', 'lb'] as const).map(unit => (
        <Pressable
          key={unit}
          onPress={() => onChange(unit)}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === unit }}
          style={[styles.segment, value === unit && styles.segmentActive]}
        >
          <Text
            style={[
              styles.segmentLabel,
              value === unit && styles.segmentLabelActive,
            ]}
          >
            {unit}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function WeeklyTargetPicker({ value, onChange }: Picker<number>) {
  const styles = useStyles();
  return (
    <View style={styles.inline}>
      <Text style={styles.optionTitle}>Workouts per week</Text>
      <NumberStepper
        value={value}
        onChange={onChange}
        min={1}
        max={7}
        accessibilityLabel="workouts per week"
      />
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  list: {
    gap: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  pressed: {
    opacity: 0.85,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  optionHint: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  segment: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentLabel: {
    ...fonts.semiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  segmentLabelActive: {
    color: colors.primary,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
}));
