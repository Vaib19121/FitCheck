import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ExerciseThumb } from './ExerciseThumb';
import { Exercise } from '../data/exercises';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import { titleCase } from '../utils/format';

type Props = {
  exercise: Exercise;
  onPress: (exercise: Exercise) => void;
  /** Shows a checkbox instead of a chevron (picker mode). */
  selected?: boolean;
  selectable?: boolean;
};

export const ExerciseRow = memo(function ExerciseRowItem({
  exercise,
  onPress,
  selected = false,
  selectable = false,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onPress(exercise)}
      accessibilityRole={selectable ? 'checkbox' : 'button'}
      accessibilityState={selectable ? { checked: selected } : undefined}
      accessibilityLabel={`${exercise.name}, ${exercise.target}, ${exercise.equipment}`}
      style={({ pressed }) => [
        styles.row,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <ExerciseThumb exercise={exercise} size={56} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={2}>
          {exercise.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {titleCase(exercise.target)} · {titleCase(exercise.equipment)}
        </Text>
      </View>
      {selectable ? (
        <Ionicons
          name={selected ? 'checkmark-circle' : 'add-circle-outline'}
          size={26}
          color={selected ? colors.primary : colors.textTertiary}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      )}
    </Pressable>
  );
});

const useStyles = makeStyles(colors => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  selected: {
    backgroundColor: colors.primaryContainer,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  meta: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
}));
