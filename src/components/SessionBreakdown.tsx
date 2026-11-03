import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Card } from './Card';
import { ExerciseThumb } from './ExerciseThumb';
import { getExercise } from '../data/exercises';
import { PersonalRecord, SessionExercise } from '../store/workoutTypes';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import { WeightUnit, formatWeight, toDisplayWeight } from '../utils/format';

/** "Bench Press — new best weight: 85 kg (was 80 kg)" */
export function prLabel(pr: PersonalRecord, unit: WeightUnit) {
  switch (pr.kind) {
    case 'weight':
      return `Heaviest weight: ${formatWeight(pr.value, unit)} (was ${formatWeight(pr.previous, unit)})`;
    case '1rm':
      return `Best est. 1RM: ${formatWeight(pr.value, unit)} (was ${formatWeight(pr.previous, unit)})`;
    case 'reps':
      return `Most reps: ${pr.value} (was ${pr.previous})`;
  }
}

export function PRList({ prs, unit }: { prs: PersonalRecord[]; unit: WeightUnit }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.list}>
      {prs.map(pr => (
        <Card key={`${pr.exerciseId}-${pr.kind}`} style={styles.pr}>
          <Ionicons name="trophy" size={22} color={colors.warning} />
          <View style={styles.fill}>
            <Text style={styles.name}>{getExercise(pr.exerciseId)?.name}</Text>
            <Text style={styles.sets}>{prLabel(pr, unit)}</Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

/** Per-exercise list of logged sets. */
export function SessionBreakdown({
  exercises,
  unit,
}: {
  exercises: SessionExercise[];
  unit: WeightUnit;
}) {
  const styles = useStyles();
  return (
    <View style={styles.list}>
      {exercises.map(e => {
        const exercise = getExercise(e.exerciseId);
        return (
          <Card key={e.id} style={styles.row}>
            {exercise ? <ExerciseThumb exercise={exercise} size={44} /> : null}
            <View style={styles.fill}>
              <Text style={styles.name} numberOfLines={1}>
                {exercise?.name ?? 'Unknown exercise'}
              </Text>
              <Text style={styles.sets}>
                {e.sets
                  .map(s =>
                    s.weight > 0 ? `${toDisplayWeight(s.weight, unit)}×${s.reps}` : `${s.reps} reps`,
                  )
                  .join(' · ')}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  list: {
    gap: spacing.sm,
  },
  fill: {
    flex: 1,
    gap: 2,
  },
  pr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: colors.warning,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
  },
  name: {
    ...fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  sets: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
}));
