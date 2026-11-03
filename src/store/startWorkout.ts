import { Alert } from 'react-native';

import { getExercise } from '../data/exercises';
import { useSessionStore } from './sessionStore';
import { RoutineExercise } from './workoutTypes';

type StartArgs = {
  name: string;
  routineId?: string | null;
  items?: Pick<RoutineExercise, 'exerciseId' | 'sets' | 'reps' | 'restSec'>[];
};

/**
 * Starts a workout, asking first if one is already in progress.
 * `onReady` runs once a session is active (new or resumed), to navigate to it.
 */
export function startWorkout(args: StartArgs, onReady: () => void) {
  const { activeSession, start, discard } = useSessionStore.getState();
  if (!activeSession) {
    start(args);
    onReady();
    return;
  }
  Alert.alert(
    'Workout in progress',
    `“${activeSession.name}” is still running. Resume it or discard it and start “${args.name}”?`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Resume', onPress: onReady },
      {
        text: 'Discard & start',
        style: 'destructive',
        onPress: () => {
          discard();
          start(args);
          onReady();
        },
      },
    ],
  );
}

/** "Bench Press, Row, Squat +2" */
export function summarizeExercises(exerciseIds: string[], max = 3) {
  const names = exerciseIds
    .slice(0, max)
    .map(id => getExercise(id)?.name ?? 'Unknown');
  const extra = exerciseIds.length - max;
  return names.join(', ') + (extra > 0 ? ` +${extra}` : '');
}
