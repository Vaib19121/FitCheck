import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, Vibration, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ExerciseThumb } from '../components/ExerciseThumb';
import { NumberStepper } from '../components/NumberStepper';
import { getExercise } from '../data/exercises';
import { useNow } from '../hooks/useNow';
import { RootStackScreenProps } from '../navigation/types';
import { useProfileStore } from '../store/profileStore';
import { useSessionStore } from '../store/sessionStore';
import { lastSetsFor } from '../store/workoutMath';
import { SessionExercise, SetEntry } from '../store/workoutTypes';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import {
  WeightUnit,
  formatClock,
  fromDisplayWeight,
  toDisplayWeight,
} from '../utils/format';

export function ActiveWorkoutScreen({ navigation }: RootStackScreenProps<'ActiveWorkout'>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const session = useSessionStore(s => s.activeSession);
  const { finish, discard } = useSessionStore.getState();

  useLayoutEffect(() => {
    const onFinish = () => {
      const current = useSessionStore.getState().activeSession;
      if (!current) {
        return;
      }
      const sets = current.exercises.flatMap(e => e.sets);
      const done = sets.filter(s => s.done).length;
      if (done === 0) {
        Alert.alert('No completed sets', 'Tick off at least one set to save this workout.');
        return;
      }
      const complete = () => {
        const saved = finish();
        if (saved) {
          navigation.replace('WorkoutSummary', { sessionId: saved.id });
        }
      };
      if (done < sets.length) {
        Alert.alert(
          'Finish workout?',
          `${sets.length - done} unfinished set(s) won’t be saved.`,
          [
            { text: 'Keep going', style: 'cancel' },
            { text: 'Finish', onPress: complete },
          ],
        );
      } else {
        complete();
      }
    };

    navigation.setOptions({
      title: session?.name ?? 'Workout',
      headerRight: () => (
        <Pressable onPress={onFinish} hitSlop={10} accessibilityRole="button">
          <Text style={styles.finish}>Finish</Text>
        </Pressable>
      ),
    });
  }, [navigation, session?.name, finish, styles]);

  if (!session) {
    return (
      <EmptyState
        icon="barbell-outline"
        title="No workout in progress"
        actionTitle="Close"
        onAction={navigation.goBack}
      />
    );
  }

  const confirmDiscard = () =>
    Alert.alert('Discard workout?', 'Nothing from this session will be saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          discard();
          navigation.goBack();
        },
      },
    ]);

  return (
    <View style={styles.screen}>
      <View style={styles.statusBar}>
        <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
        <ElapsedTimer startedAt={session.startedAt} />
        <View style={styles.fill} />
        <Text style={styles.statusText}>
          {session.exercises.flatMap(e => e.sets).filter(s => s.done).length} sets done
        </Text>
      </View>
      <RestBanner />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {session.exercises.length === 0 ? (
          <EmptyState
            icon="add-circle-outline"
            title="Empty workout"
            message="Add exercises to start logging sets."
          />
        ) : null}

        {session.exercises.map(e => (
          <ExerciseCard
            key={e.id}
            item={e}
            onOpen={() => navigation.navigate('ExerciseDetail', { id: e.exerciseId })}
          />
        ))}

        <Button
          title="Add exercises"
          icon="add"
          variant="secondary"
          onPress={() => navigation.navigate('ExercisePicker', { target: 'session' })}
        />
        <Pressable
          onPress={confirmDiscard}
          accessibilityRole="button"
          style={styles.discard}
          hitSlop={8}
        >
          <Text style={styles.discardText}>Discard workout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const styles = useStyles();
  const now = useNow(1000);
  return (
    <Text style={styles.statusClock} accessibilityLabel="Elapsed time">
      {formatClock((now - startedAt) / 1000)}
    </Text>
  );
}

/** Countdown after a completed set. Vibrates once when it runs out. */
function RestBanner() {
  const styles = useStyles();
  const restEndsAt = useSessionStore(s => s.activeSession?.restEndsAt ?? null);
  const { adjustRest, skipRest } = useSessionStore.getState();
  const now = useNow(250, restEndsAt !== null);
  const remaining = restEndsAt ? Math.ceil((restEndsAt - now) / 1000) : 0;

  useEffect(() => {
    if (restEndsAt && now >= restEndsAt) {
      // Only buzz if we were watching; skip if the app comes back long after.
      if (now - restEndsAt < 3000) {
        Vibration.vibrate([0, 300, 150, 300]);
      }
      skipRest();
    }
  }, [now, restEndsAt, skipRest]);

  if (!restEndsAt || remaining <= 0) {
    return null;
  }

  return (
    <View style={styles.rest} accessibilityLiveRegion="polite">
      <Ionicons name="hourglass-outline" size={18} color={styles.restText.color} />
      <Text style={styles.restText}>Rest {formatClock(remaining)}</Text>
      <View style={styles.fill} />
      <RestAction label="−15s" onPress={() => adjustRest(-15)} />
      <RestAction label="+15s" onPress={() => adjustRest(15)} />
      <RestAction label="Skip" onPress={skipRest} />
    </View>
  );
}

function RestAction({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      style={({ pressed }) => [styles.restAction, pressed && styles.pressed]}
    >
      <Text style={styles.restActionText}>{label}</Text>
    </Pressable>
  );
}

const ExerciseCard = memo(function ExerciseCardItem({
  item,
  onOpen,
}: {
  item: SessionExercise;
  onOpen: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const unit = useProfileStore(s => s.unit);
  const exercise = getExercise(item.exerciseId);
  const isBodyweight = exercise?.equipment === 'body weight';
  // Snapshot "previous" once, so it doesn't shift while logging.
  const previous = useRef(lastSetsFor(useSessionStore.getState().history, item.exerciseId));
  const { addSet, removeExercise } = useSessionStore.getState();

  const menu = () =>
    Alert.alert(exercise?.name ?? 'Exercise', undefined, [
      { text: 'View instructions', onPress: onOpen },
      {
        text: 'Remove from workout',
        style: 'destructive',
        onPress: () => removeExercise(item.id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        {exercise ? <ExerciseThumb exercise={exercise} size={44} /> : null}
        <Pressable style={styles.fill} onPress={onOpen} accessibilityRole="button">
          <Text style={styles.exerciseName} numberOfLines={2}>
            {exercise?.name ?? 'Unknown exercise'}
          </Text>
          <Text style={styles.exerciseMeta}>Rest {formatClock(item.restSec)}</Text>
        </Pressable>
        <Pressable onPress={menu} hitSlop={10} accessibilityRole="button" accessibilityLabel="Exercise options">
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.th, styles.colSet]}>Set</Text>
        <Text style={[styles.th, styles.colInput]}>{isBodyweight ? `+${unit}` : unit}</Text>
        <Text style={[styles.th, styles.colInput]}>Reps</Text>
        <View style={styles.colCheck} />
      </View>

      {item.sets.map((set, i) => (
        <SetRow
          key={set.id}
          index={i}
          set={set}
          sessionExerciseId={item.id}
          previous={previous.current?.[i]}
          unit={unit}
        />
      ))}

      <Pressable
        onPress={() => addSet(item.id)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.addSet, pressed && styles.pressed]}
      >
        <Ionicons name="add" size={18} color={colors.primary} />
        <Text style={styles.addSetText}>Add set</Text>
      </Pressable>
    </Card>
  );
});

function SetRow({
  index,
  set,
  sessionExerciseId,
  previous,
  unit,
}: {
  index: number;
  set: SetEntry;
  sessionExerciseId: string;
  previous?: SetEntry;
  unit: WeightUnit;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { updateSet, toggleSet, removeSet } = useSessionStore.getState();

  const confirmRemove = () =>
    Alert.alert(`Remove set ${index + 1}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeSet(sessionExerciseId, set.id),
      },
    ]);

  return (
    <View style={[styles.setRow, set.done && styles.setRowDone]}>
      <Pressable
        onLongPress={confirmRemove}
        style={styles.colSet}
        accessibilityHint="Long press to remove this set"
      >
        <Text style={styles.setNumber}>{index + 1}</Text>
        {previous ? (
          <Text style={styles.previous} numberOfLines={1}>
            {toDisplayWeight(previous.weight, unit)}×{previous.reps}
          </Text>
        ) : null}
      </Pressable>
      <View style={styles.colInput}>
        <NumberStepper
          value={toDisplayWeight(set.weight, unit)}
          onChange={v => updateSet(sessionExerciseId, set.id, { weight: fromDisplayWeight(v, unit) })}
          step={unit === 'kg' ? 2.5 : 5}
          max={unit === 'kg' ? 500 : 1100}
          decimal
          accessibilityLabel={`set ${index + 1} weight`}
        />
      </View>
      <View style={styles.colInput}>
        <NumberStepper
          value={set.reps}
          onChange={reps => updateSet(sessionExerciseId, set.id, { reps })}
          max={200}
          accessibilityLabel={`set ${index + 1} reps`}
        />
      </View>
      <Pressable
        onPress={() => toggleSet(sessionExerciseId, set.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.done }}
        accessibilityLabel={`Complete set ${index + 1}`}
        hitSlop={6}
        style={[styles.colCheck, styles.check, set.done && styles.checkDone]}
      >
        <Ionicons
          name="checkmark"
          size={20}
          color={set.done ? colors.onPrimary : colors.textTertiary}
        />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  finish: {
    ...fonts.bold,
    fontSize: 16,
    color: colors.success,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusClock: {
    ...fonts.bold,
    fontSize: 16,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statusText: {
    ...fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  rest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.primaryContainer,
  },
  restText: {
    ...fonts.bold,
    fontSize: 16,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  restAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  restActionText: {
    ...fonts.semiBold,
    fontSize: 13,
    color: colors.primary,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    gap: spacing.sm,
    paddingHorizontal: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  exerciseName: {
    ...fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  exerciseMeta: {
    ...fonts.regular,
    fontSize: 12,
    color: colors.textTertiary,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  th: {
    ...fonts.semiBold,
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  colSet: {
    width: 52,
    alignItems: 'center',
  },
  colInput: {
    flex: 1,
  },
  colCheck: {
    width: 40,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
    borderRadius: 10,
  },
  setRowDone: {
    backgroundColor: colors.primaryContainer,
  },
  setNumber: {
    ...fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  previous: {
    ...fonts.regular,
    fontSize: 10,
    color: colors.textTertiary,
  },
  check: {
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  checkDone: {
    backgroundColor: colors.success,
  },
  addSet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  addSetText: {
    ...fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  discard: {
    alignSelf: 'center',
    padding: spacing.sm,
  },
  discardText: {
    ...fonts.semiBold,
    fontSize: 15,
    color: colors.danger,
  },
}));
