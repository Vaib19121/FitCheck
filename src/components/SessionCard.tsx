import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Card } from './Card';
import { summarizeExercises } from '../store/startWorkout';
import { CompletedSession } from '../store/workoutTypes';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import {
  WeightUnit,
  formatDuration,
  formatRelativeDay,
  formatVolume,
} from '../utils/format';

/** History row: name, when, duration/volume/sets, PR badge. */
export function SessionCard({
  session,
  unit,
  onPress,
}: {
  session: CompletedSession;
  unit: WeightUnit;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={`${session.name}, ${formatRelativeDay(session.startedAt)}`}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {session.name}
        </Text>
        <Text style={styles.when}>{formatRelativeDay(session.startedAt)}</Text>
      </View>
      <Text style={styles.exercises} numberOfLines={1}>
        {summarizeExercises(session.exercises.map(e => e.exerciseId))}
      </Text>
      <View style={styles.meta}>
        <Meta icon="time-outline" text={formatDuration(session.durationSec)} />
        <Meta icon="barbell-outline" text={formatVolume(session.volume, unit)} />
        <Meta icon="layers-outline" text={`${session.setCount} sets`} />
        {session.prs.length ? (
          <View style={styles.pr}>
            <Ionicons name="trophy" size={12} color={colors.warning} />
            <Text style={styles.prText}>{session.prs.length} PR</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function Meta({ icon, text }: { icon: string; text: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={colors.textTertiary} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  card: {
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  name: {
    ...fonts.semiBold,
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  when: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textTertiary,
  },
  exercises: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  pr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  prText: {
    ...fonts.semiBold,
    fontSize: 12,
    color: colors.text,
  },
}));
