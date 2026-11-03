import { useCallback } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ExerciseBrowser } from '../components/ExerciseBrowser';
import { Exercise } from '../data/exercises';
import { fonts, makeStyles, spacing } from '../theme';

export function ExploreScreen() {
  const styles = useStyles();
  const navigation = useNavigation();

  const openExercise = useCallback(
    (exercise: Exercise) =>
      navigation.navigate('ExerciseDetail', { id: exercise.id }),
    [navigation],
  );

  return (
    <ExerciseBrowser
      onPressExercise={openExercise}
      header={
        <Text style={styles.title} accessibilityRole="header">
          Explore
        </Text>
      }
    />
  );
}

const useStyles = makeStyles(colors => ({
  title: {
    ...fonts.bold,
    fontSize: 32,
    color: colors.text,
    paddingHorizontal: spacing.md,
  },
}));
