import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type BottomTabParamList = {
  Home: undefined;
  Explore: undefined;
  Activity: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<BottomTabParamList>;
  ExerciseDetail: { id: string };
  /** "Start workout" sheet opened by the tab bar's center button. */
  Create: undefined;
  RoutineEditor: { id: string };
  ExercisePicker: { target: 'session' } | { target: 'routine'; routineId: string };
  AddToRoutine: { exerciseId: string };
  ActiveWorkout: undefined;
  WorkoutSummary: { sessionId: string };
  SessionDetail: { sessionId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Types `useNavigation()` app-wide without passing generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
