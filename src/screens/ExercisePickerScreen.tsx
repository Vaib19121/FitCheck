import { useCallback, useLayoutEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import { ExerciseBrowser } from '../components/ExerciseBrowser';
import { Exercise } from '../data/exercises';
import { RootStackScreenProps } from '../navigation/types';
import { useRoutineStore } from '../store/routineStore';
import { useSessionStore } from '../store/sessionStore';
import { fonts, makeStyles } from '../theme';

/** Multi-select exercise picker that adds to a routine or the active workout. */
export function ExercisePickerScreen({
  route,
  navigation,
}: RootStackScreenProps<'ExercisePicker'>) {
  const styles = useStyles();
  const params = route.params;
  // Keep selection order so exercises are added in the order tapped.
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const toggle = useCallback(
    (exercise: Exercise) =>
      setSelected(prev => {
        const next = new Set(prev);
        if (!next.delete(exercise.id)) {
          next.add(exercise.id);
        }
        return next;
      }),
    [],
  );

  useLayoutEffect(() => {
    const ids = [...selected];
    const add = () => {
      if (params.target === 'routine') {
        useRoutineStore.getState().addExercises(params.routineId, ids);
      } else {
        useSessionStore.getState().addExercises(ids);
      }
      navigation.goBack();
    };
    navigation.setOptions({
      title: 'Add exercises',
      headerRight: () => (
        <Pressable
          onPress={add}
          disabled={!ids.length}
          hitSlop={10}
          accessibilityRole="button"
        >
          <Text style={[styles.add, !ids.length && styles.disabled]}>
            Add{ids.length ? ` (${ids.length})` : ''}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, selected, params, styles]);

  return <ExerciseBrowser onPressExercise={toggle} selectedIds={selected} />;
}

const useStyles = makeStyles(colors => ({
  add: {
    ...fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  disabled: {
    opacity: 0.4,
  },
}));
