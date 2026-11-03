import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ExerciseThumb } from '../components/ExerciseThumb';
import { NumberStepper } from '../components/NumberStepper';
import { getExercise } from '../data/exercises';
import { RootStackScreenProps } from '../navigation/types';
import { useRoutineStore } from '../store/routineStore';
import { startWorkout } from '../store/startWorkout';
import { RoutineExercise } from '../store/workoutTypes';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import { formatClock } from '../utils/format';

/** Edits are saved to the store as you go; there is no separate Save step. */
export function RoutineEditorScreen({
  route,
  navigation,
}: RootStackScreenProps<'RoutineEditor'>) {
  const { id } = route.params;
  const styles = useStyles();
  const { colors } = useTheme();
  const routine = useRoutineStore(s => s.routines.find(r => r.id === id));
  const { rename, remove, updateExercise, removeExercise, moveExercise } =
    useRoutineStore.getState();
  const [name, setName] = useState(routine?.name ?? '');

  // Drop routines left empty, so abandoned "New routine"s don't pile up.
  useEffect(
    () => () => {
      const r = useRoutineStore.getState().routines.find(x => x.id === id);
      if (r && r.exercises.length === 0) {
        useRoutineStore.getState().remove(id);
      }
    },
    [id],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Edit routine',
      headerRight: () => (
        <Pressable
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Delete routine"
          onPress={() =>
            Alert.alert('Delete routine?', 'Your workout history is kept.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  remove(id);
                  navigation.goBack();
                },
              },
            ])
          }
        >
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
      ),
    });
  }, [navigation, colors, id, remove]);

  if (!routine) {
    return <EmptyState icon="alert-circle-outline" title="Routine not found" />;
  }

  const update = (item: RoutineExercise) => (patch: Partial<RoutineExercise>) =>
    updateExercise(id, item.id, patch);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <TextInput
          value={name}
          onChangeText={setName}
          onEndEditing={() => rename(id, name.trim() || 'Untitled routine')}
          placeholder="Routine name"
          placeholderTextColor={colors.textTertiary}
          style={styles.nameInput}
          selectTextOnFocus={routine.name === 'New routine'}
          maxLength={40}
          accessibilityLabel="Routine name"
        />

        {routine.exercises.length === 0 ? (
          <EmptyState
            icon="barbell-outline"
            title="No exercises yet"
            message="Add exercises from the library to build this routine."
          />
        ) : null}

        {routine.exercises.map((item, index) => {
          const exercise = getExercise(item.exerciseId);
          const set = update(item);
          return (
            <Card key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                {exercise ? <ExerciseThumb exercise={exercise} size={44} /> : null}
                <Pressable
                  style={styles.fill}
                  onPress={() =>
                    navigation.navigate('ExerciseDetail', { id: item.exerciseId })
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.exerciseName} numberOfLines={2}>
                    {exercise?.name ?? 'Unknown exercise'}
                  </Text>
                </Pressable>
                <IconButton
                  icon="chevron-up"
                  label="Move up"
                  disabled={index === 0}
                  onPress={() => moveExercise(id, item.id, -1)}
                />
                <IconButton
                  icon="chevron-down"
                  label="Move down"
                  disabled={index === routine.exercises.length - 1}
                  onPress={() => moveExercise(id, item.id, 1)}
                />
                <IconButton
                  icon="close"
                  label="Remove exercise"
                  onPress={() => removeExercise(id, item.id)}
                />
              </View>
              <View style={styles.fields}>
                <Field label="Sets">
                  <NumberStepper
                    value={item.sets}
                    onChange={sets => set({ sets })}
                    min={1}
                    max={10}
                    accessibilityLabel="sets"
                  />
                </Field>
                <Field label="Reps">
                  <NumberStepper
                    value={item.reps}
                    onChange={reps => set({ reps })}
                    min={1}
                    max={100}
                    accessibilityLabel="reps"
                  />
                </Field>
                <Field label={`Rest ${formatClock(item.restSec)}`}>
                  <NumberStepper
                    value={item.restSec}
                    onChange={restSec => set({ restSec })}
                    step={15}
                    min={0}
                    max={600}
                    accessibilityLabel="rest seconds"
                  />
                </Field>
              </View>
            </Card>
          );
        })}

        <Button
          title="Add exercises"
          icon="add"
          variant="secondary"
          onPress={() =>
            navigation.navigate('ExercisePicker', { target: 'routine', routineId: id })
          }
        />
      </ScrollView>

      {routine.exercises.length ? (
        <View style={styles.footer}>
          <Button
            title="Start workout"
            icon="play"
            onPress={() =>
              startWorkout(
                { name: routine.name, routineId: id, items: routine.exercises },
                () => navigation.replace('ActiveWorkout'),
              )
            }
          />
        </View>
      ) : null}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function IconButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.iconButton, disabled && styles.iconButtonDisabled]}
    >
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
    </Pressable>
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
    paddingBottom: spacing.xl,
  },
  fill: {
    flex: 1,
  },
  nameInput: {
    ...fonts.bold,
    fontSize: 26,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  card: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseName: {
    ...fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  fields: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    ...fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  iconButton: {
    padding: 4,
  },
  iconButtonDisabled: {
    opacity: 0.3,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
}));
