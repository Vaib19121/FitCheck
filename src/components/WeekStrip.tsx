import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { weekDays } from '../store/selectors';
import { CompletedSession } from '../store/workoutTypes';
import { fonts, makeStyles, useTheme } from '../theme';
import { formatWeekdayLetter } from '../utils/format';

/** Mon–Sun for the current week; a check marks days with a workout. */
export function WeekStrip({
  history,
  now,
}: {
  history: readonly CompletedSession[];
  now: number;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const days = weekDays(history, now);

  return (
    <View style={styles.row}>
      {days.map(d => {
        const trained = d.sessions > 0;
        return (
          <View
            key={d.day}
            style={styles.day}
            accessible
            accessibilityLabel={`${new Date(d.day).toLocaleDateString(undefined, {
              weekday: 'long',
            })}: ${trained ? `${d.sessions} workout${d.sessions > 1 ? 's' : ''}` : 'no workout'}`}
          >
            <Text style={[styles.letter, d.isToday && styles.today]}>
              {formatWeekdayLetter(d.day)}
            </Text>
            <View
              style={[
                styles.dot,
                trained && styles.dotDone,
                d.isToday && !trained && styles.dotToday,
                d.isFuture && styles.dotFuture,
              ]}
            >
              {trained ? (
                <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
              ) : (
                <Text style={styles.date}>{new Date(d.day).getDate()}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    alignItems: 'center',
    gap: 6,
  },
  letter: {
    ...fonts.medium,
    fontSize: 12,
    color: colors.textTertiary,
  },
  today: {
    ...fonts.bold,
    color: colors.text,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  dotToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dotFuture: {
    opacity: 0.5,
  },
  date: {
    ...fonts.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
}));
