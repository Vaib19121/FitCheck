import { ScrollView, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Card } from '../components/Card';
import { getExercise } from '../data/exercises';
import { RootStackScreenProps } from '../navigation/types';
import { useRoutineStore } from '../store/routineStore';
import { useSessionStore } from '../store/sessionStore';
import { fonts, makeStyles, spacing, useTheme } from '../theme';

/** Sheet: add one exercise to the active workout, an existing routine, or a new one. */
export function AddToRoutineScreen({
  route,
  navigation,
}: RootStackScreenProps<'AddToRoutine'>) {
  const { exerciseId } = route.params;
  const styles = useStyles();
  const { colors } = useTheme();
  const routines = useRoutineStore(s => s.routines);
  const activeSession = useSessionStore(s => s.activeSession);
  const exercise = getExercise(exerciseId);

  const addToRoutine = (id: string) => {
    const routine = useRoutineStore.getState().routines.find(r => r.id === id);
    if (!routine?.exercises.some(e => e.exerciseId === exerciseId)) {
      useRoutineStore.getState().addExercises(id, [exerciseId]);
    }
    navigation.replace('RoutineEditor', { id });
  };

  const addToWorkout = () => {
    useSessionStore.getState().addExercises([exerciseId]);
    navigation.replace('ActiveWorkout');
  };

  const newRoutine = () => {
    const id = useRoutineStore.getState().create(exercise?.name ?? 'New routine', [exerciseId]);
    navigation.replace('RoutineEditor', { id });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle} numberOfLines={2}>
        {exercise?.name}
      </Text>

      {activeSession ? (
        <Row
          icon="flash"
          title="Add to current workout"
          subtitle={activeSession.name}
          onPress={addToWorkout}
          highlight
        />
      ) : null}

      <Row icon="add-circle-outline" title="New routine" onPress={newRoutine} />

      {routines.map(r => {
        const already = r.exercises.some(e => e.exerciseId === exerciseId);
        return (
          <Row
            key={r.id}
            icon={already ? 'checkmark-circle' : 'list-outline'}
            title={r.name}
            subtitle={
              already ? 'Already in this routine' : `${r.exercises.length} exercises`
            }
            onPress={() => addToRoutine(r.id)}
          />
        );
      })}

      {routines.length === 0 ? (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textTertiary} />
          <Text style={styles.hintText}>You don’t have any routines yet.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  highlight,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Card onPress={onPress} style={[styles.row, highlight && styles.highlight]} accessibilityLabel={title}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <View style={styles.fill}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Card>
  );
}

const useStyles = makeStyles(colors => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  subtitle: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  highlight: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  fill: {
    flex: 1,
  },
  title: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  rowSub: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  hintText: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textTertiary,
  },
}));
