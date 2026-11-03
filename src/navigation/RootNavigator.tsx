import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateScreen } from '../screens/CreateScreen';
import { ActiveWorkoutScreen } from '../screens/ActiveWorkoutScreen';
import { AddToRoutineScreen } from '../screens/AddToRoutineScreen';
import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';
import { ExercisePickerScreen } from '../screens/ExercisePickerScreen';
import { RoutineEditorScreen } from '../screens/RoutineEditorScreen';
import { SessionDetailScreen } from '../screens/SessionDetailScreen';
import { WorkoutSummaryScreen } from '../screens/WorkoutSummaryScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useProfileStore } from '../store/profileStore';
import { navigationThemes, useTheme } from '../theme';
import { BottomTabs } from './BottomTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isDark } = useTheme();
  const onboarded = useProfileStore(s => s.onboarded);

  return (
    <NavigationContainer
      theme={isDark ? navigationThemes.dark : navigationThemes.light}
    >
      <Stack.Navigator>
        {/* Conditional screens: finishing onboarding swaps in the app, and
            "Reset data" swaps back, without manual navigation. */}
        {onboarded ? (
          <>
            <Stack.Screen
              name="Tabs"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
            {/* Pushed screens keep the header, so they get a back button. */}
            <Stack.Screen
              name="ExerciseDetail"
              component={ExerciseDetailScreen}
              options={{ headerBackButtonDisplayMode: 'minimal' }}
            />
            <Stack.Screen
              name="Create"
              component={CreateScreen}
              options={{ presentation: 'modal', title: 'Start workout' }}
            />
            <Stack.Screen name="RoutineEditor" component={RoutineEditorScreen} />
            <Stack.Screen
              name="ActiveWorkout"
              component={ActiveWorkoutScreen}
              options={{ headerBackButtonDisplayMode: 'minimal' }}
            />
            <Stack.Screen
              name="WorkoutSummary"
              component={WorkoutSummaryScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="SessionDetail"
              component={SessionDetailScreen}
              options={{ headerBackButtonDisplayMode: 'minimal' }}
            />
            <Stack.Screen
              name="ExercisePicker"
              component={ExercisePickerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="AddToRoutine"
              component={AddToRoutineScreen}
              options={{ presentation: 'modal', title: 'Add to…' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
