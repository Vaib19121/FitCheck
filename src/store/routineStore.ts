import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { makeId } from '../utils/id';
import { useProfileStore } from './profileStore';
import { zustandStorage } from './storage';
import { trainingDefaults } from './workoutMath';
import { Routine, RoutineExercise } from './workoutTypes';

type RoutineState = {
  routines: Routine[];
  /** Creates a routine and returns its id. */
  create: (name: string, exerciseIds?: string[]) => string;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  addExercises: (id: string, exerciseIds: string[]) => void;
  updateExercise: (id: string, itemId: string, patch: Partial<RoutineExercise>) => void;
  removeExercise: (id: string, itemId: string) => void;
  moveExercise: (id: string, itemId: string, direction: -1 | 1) => void;
  reset: () => void;
};

/** New routine rows use the user's goal-based defaults. */
function newItems(exerciseIds: string[]): RoutineExercise[] {
  const { goal, level } = useProfileStore.getState();
  const { sets, reps, restSec } = trainingDefaults(goal, level);
  return exerciseIds.map(exerciseId => ({
    id: makeId(),
    exerciseId,
    sets,
    reps,
    restSec,
  }));
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    set => {
      const edit = (id: string, fn: (r: Routine) => Partial<Routine>) =>
        set(s => ({
          routines: s.routines.map(r =>
            r.id === id ? { ...r, ...fn(r), updatedAt: Date.now() } : r,
          ),
        }));

      return {
        routines: [],
        create: (name, exerciseIds = []) => {
          const now = Date.now();
          const routine: Routine = {
            id: makeId(),
            name,
            exercises: newItems(exerciseIds),
            createdAt: now,
            updatedAt: now,
          };
          set(s => ({ routines: [routine, ...s.routines] }));
          return routine.id;
        },
        rename: (id, name) => edit(id, () => ({ name })),
        remove: id => set(s => ({ routines: s.routines.filter(r => r.id !== id) })),
        addExercises: (id, exerciseIds) =>
          edit(id, r => ({ exercises: [...r.exercises, ...newItems(exerciseIds)] })),
        updateExercise: (id, itemId, patch) =>
          edit(id, r => ({
            exercises: r.exercises.map(e => (e.id === itemId ? { ...e, ...patch } : e)),
          })),
        removeExercise: (id, itemId) =>
          edit(id, r => ({ exercises: r.exercises.filter(e => e.id !== itemId) })),
        moveExercise: (id, itemId, direction) =>
          edit(id, r => {
            const list = [...r.exercises];
            const from = list.findIndex(e => e.id === itemId);
            const to = from + direction;
            if (from < 0 || to < 0 || to >= list.length) {
              return {};
            }
            [list[from], list[to]] = [list[to], list[from]];
            return { exercises: list };
          }),
        reset: () => set({ routines: [] }),
      };
    },
    {
      name: 'routines',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ routines }) => ({ routines }),
    },
  ),
);
