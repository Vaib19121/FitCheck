import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '../components/Button';
import { Card, SectionHeader } from '../components/Card';
import { TEMPLATES, resolveTemplate } from '../data/templates';
import { RootStackScreenProps } from '../navigation/types';
import { useAvailableEquipment, useProfileStore } from '../store/profileStore';
import { useRoutineStore } from '../store/routineStore';
import { useSessionStore } from '../store/sessionStore';
import { startWorkout, summarizeExercises } from '../store/startWorkout';
import { trainingDefaults } from '../store/workoutMath';
import { fonts, makeStyles, spacing, useTheme } from '../theme';

/** "Start workout" sheet: resume, start empty, start a routine or a template. */
export function CreateScreen({ navigation }: RootStackScreenProps<'Create'>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const activeSession = useSessionStore(s => s.activeSession);
  const routines = useRoutineStore(s => s.routines);
  const createRoutine = useRoutineStore(s => s.create);
  const equipment = useAvailableEquipment();
  const goal = useProfileStore(s => s.goal);
  const level = useProfileStore(s => s.level);

  const templates = useMemo(
    () =>
      TEMPLATES.map(t => ({ ...t, exerciseIds: resolveTemplate(t, equipment) })).filter(
        t => t.exerciseIds.length >= 3,
      ),
    [equipment],
  );

  const openWorkout = () => navigation.replace('ActiveWorkout');

  const startTemplate = (name: string, exerciseIds: string[]) => {
    const defaults = trainingDefaults(goal, level);
    startWorkout(
      { name, items: exerciseIds.map(exerciseId => ({ exerciseId, ...defaults })) },
      openWorkout,
    );
  };

  const newRoutine = () => {
    const id = createRoutine('New routine');
    navigation.replace('RoutineEditor', { id });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {activeSession ? (
        <Card onPress={openWorkout} style={styles.resume} accessibilityLabel="Resume workout">
          <Ionicons name="play-circle" size={36} color={colors.onPrimary} />
          <View style={styles.fill}>
            <Text style={styles.resumeTitle}>Resume workout</Text>
            <Text style={styles.resumeSub}>{activeSession.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.onPrimary} />
        </Card>
      ) : (
        <Button
          title="Start empty workout"
          icon="flash-outline"
          onPress={() => startWorkout({ name: 'Workout' }, openWorkout)}
        />
      )}

      <SectionHeader title="My routines" action="New" onAction={newRoutine} />
      {routines.length ? (
        routines.map(r => (
          <Card key={r.id} style={styles.routine}>
            <Pressable
              style={styles.fill}
              onPress={() => navigation.replace('RoutineEditor', { id: r.id })}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${r.name}`}
            >
              <Text style={styles.cardTitle}>{r.name}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>
                {r.exercises.length
                  ? summarizeExercises(r.exercises.map(e => e.exerciseId))
                  : 'No exercises yet'}
              </Text>
            </Pressable>
            <StartButton
              disabled={!r.exercises.length}
              label={`Start ${r.name}`}
              onPress={() =>
                startWorkout({ name: r.name, routineId: r.id, items: r.exercises }, openWorkout)
              }
            />
          </Card>
        ))
      ) : (
        <Card onPress={newRoutine} style={styles.emptyRoutine}>
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.cardSub}>
            Create your first routine, or start from a template below.
          </Text>
        </Card>
      )}

      <SectionHeader title="Starter templates" />
      <Text style={styles.hint}>Adapted to your equipment.</Text>
      {templates.map(t => (
        <Card key={t.key} style={styles.routine}>
          <Ionicons name={t.icon} size={26} color={colors.primary} />
          <View style={styles.fill}>
            <Text style={styles.cardTitle}>{t.name}</Text>
            <Text style={styles.cardSub} numberOfLines={2}>
              {summarizeExercises(t.exerciseIds)}
            </Text>
            <Pressable
              onPress={() => {
                const id = createRoutine(t.name, t.exerciseIds);
                navigation.replace('RoutineEditor', { id });
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Save ${t.name} as a routine`}
            >
              <Text style={styles.link}>Save as routine</Text>
            </Pressable>
          </View>
          <StartButton
            label={`Start ${t.name}`}
            onPress={() => startTemplate(t.name, t.exerciseIds)}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

function StartButton({
  onPress,
  label,
  disabled,
}: {
  onPress: () => void;
  label: string;
  disabled?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.play,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="play" size={20} color={colors.onPrimary} />
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
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  resumeTitle: {
    ...fonts.bold,
    fontSize: 17,
    color: colors.onPrimary,
  },
  resumeSub: {
    ...fonts.regular,
    fontSize: 14,
    color: colors.onPrimary,
    opacity: 0.85,
  },
  routine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyRoutine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  cardSub: {
    ...fonts.regular,
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hint: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: -spacing.sm,
  },
  link: {
    ...fonts.semiBold,
    fontSize: 13,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.8,
  },
}));
