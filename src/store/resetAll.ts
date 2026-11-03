import { useProfileStore } from './profileStore';
import { useRoutineStore } from './routineStore';
import { useSessionStore } from './sessionStore';

/**
 * Wipes all locally stored user data and returns the app to onboarding.
 * Add every persisted user-data store here as it is created.
 */
export function resetAllData() {
  useSessionStore.getState().reset();
  useRoutineStore.getState().reset();
  // Last: flipping `onboarded` swaps the navigator to onboarding.
  useProfileStore.getState().reset();
}
