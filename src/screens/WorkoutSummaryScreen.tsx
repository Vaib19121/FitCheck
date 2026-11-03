import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '../components/Button';
import { SectionHeader } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PRList, SessionBreakdown } from '../components/SessionBreakdown';
import { StatTile } from '../components/StatTile';
import { RootStackScreenProps } from '../navigation/types';
import { useProfileStore } from '../store/profileStore';
import { useRoutineStore } from '../store/routineStore';
import { useSessionStore } from '../store/sessionStore';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import { formatDuration, formatVolume } from '../utils/format';

export function WorkoutSummaryScreen({
  route,
  navigation,
}: RootStackScreenProps<'WorkoutSummary'>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const unit = useProfileStore(s => s.unit);
  const session = useSessionStore(s => s.history.find(h => h.id === route.params.sessionId));
  const createRoutine = useRoutineStore(s => s.create);

  if (!session) {
    return <EmptyState icon="alert-circle-outline" title="Workout not found" />;
  }

  const saveAsRoutine = () => {
    const id = createRoutine(
      session.name,
      session.exercises.map(e => e.exerciseId),
    );
    navigation.replace('RoutineEditor', { id });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={styles.title} accessibilityRole="header">
            Workout complete
          </Text>
          <Text style={styles.subtitle}>{session.name}</Text>
        </View>

        <View style={styles.stats}>
          <StatTile icon="time-outline" label="Duration" value={formatDuration(session.durationSec)} />
          <StatTile icon="barbell-outline" label="Volume" value={formatVolume(session.volume, unit)} />
          <StatTile icon="layers-outline" label="Sets" value={String(session.setCount)} />
        </View>

        {session.prs.length ? (
          <>
            <SectionHeader title={`New personal records (${session.prs.length})`} />
            <PRList prs={session.prs} unit={unit} />
          </>
        ) : null}

        <SectionHeader title="Exercises" />
        <SessionBreakdown exercises={session.exercises} unit={unit} />
      </ScrollView>

      <View style={styles.footer}>
        {session.routineId ? null : (
          <Button title="Save as routine" variant="secondary" icon="bookmark-outline" onPress={saveAsRoutine} />
        )}
        <Button title="Done" onPress={() => navigation.popToTop()} />
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(colors => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  title: {
    ...fonts.bold,
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    ...fonts.medium,
    fontSize: 16,
    color: colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
}));
