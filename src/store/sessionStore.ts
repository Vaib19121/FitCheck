import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { makeId } from '../utils/id';
import { useProfileStore } from './profileStore';
import { zustandStorage } from './storage';
import { completeSession, lastSetsFor, trainingDefaults } from './workoutMath';
import {
  ActiveSession,
  CompletedSession,
  RoutineExercise,
  SessionExercise,
  SetEntry,
} from './workoutTypes';

type StartOptions = {
  name: string;
  routineId?: string | null;
  /** Routine rows to prefill; omit for an empty workout. */
  items?: Pick<RoutineExercise, 'exerciseId' | 'sets' | 'reps' | 'restSec'>[];
};

type SessionState = {
  activeSession: ActiveSession | null;
  /** Completed workouts, newest first. */
  history: CompletedSession[];
  start: (options: StartOptions) => void;
  addExercises: (exerciseIds: string[]) => void;
  removeExercise: (sessionExerciseId: string) => void;
  addSet: (sessionExerciseId: string) => void;
  removeSet: (sessionExerciseId: string, setId: string) => void;
  updateSet: (sessionExerciseId: string, setId: string, patch: Partial<SetEntry>) => void;
  toggleSet: (sessionExerciseId: string, setId: string) => void;
  adjustRest: (deltaSec: number) => void;
  skipRest: () => void;
  /** Saves completed sets to history. Returns null (and keeps the session) if none were completed. */
  finish: () => CompletedSession | null;
  discard: () => void;
  deleteSession: (id: string) => void;
  reset: () => void;
};

/** Builds set rows, prefilling weights (and reps when no target) from last time. */
function buildExercise(
  history: CompletedSession[],
  item: { exerciseId: string; sets: number; reps: number; restSec: number },
): SessionExercise {
  const last = lastSetsFor(history, item.exerciseId);
  return {
    id: makeId(),
    exerciseId: item.exerciseId,
    restSec: item.restSec,
    sets: Array.from({ length: item.sets }, (_, i) => {
      const prev = last?.[Math.min(i, last.length - 1)];
      return { id: makeId(), reps: item.reps, weight: prev?.weight ?? 0, done: false };
    }),
  };
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => {
      const editExercise = (
        sessionExerciseId: string,
        fn: (e: SessionExercise) => SessionExercise,
      ) =>
        set(s =>
          s.activeSession
            ? {
                activeSession: {
                  ...s.activeSession,
                  exercises: s.activeSession.exercises.map(e =>
                    e.id === sessionExerciseId ? fn(e) : e,
                  ),
                },
              }
            : s,
        );

      const editSession = (patch: Partial<ActiveSession>) =>
        set(s => (s.activeSession ? { activeSession: { ...s.activeSession, ...patch } } : s));

      return {
        activeSession: null,
        history: [],

        start: ({ name, routineId = null, items = [] }) => {
          const { history } = get();
          set({
            activeSession: {
              id: makeId(),
              name,
              routineId,
              startedAt: Date.now(),
              exercises: items.map(item => buildExercise(history, item)),
              restEndsAt: null,
            },
          });
        },

        addExercises: exerciseIds => {
          const { activeSession, history } = get();
          if (!activeSession) {
            return;
          }
          const { goal, level } = useProfileStore.getState();
          const defaults = trainingDefaults(goal, level);
          editSession({
            exercises: [
              ...activeSession.exercises,
              ...exerciseIds.map(exerciseId => {
                const last = lastSetsFor(history, exerciseId);
                return buildExercise(history, {
                  exerciseId,
                  ...defaults,
                  sets: last?.length ?? defaults.sets,
                  reps: last?.[0]?.reps ?? defaults.reps,
                });
              }),
            ],
          });
        },

        removeExercise: sessionExerciseId => {
          const { activeSession } = get();
          if (activeSession) {
            editSession({
              exercises: activeSession.exercises.filter(e => e.id !== sessionExerciseId),
            });
          }
        },

        addSet: sessionExerciseId =>
          editExercise(sessionExerciseId, e => {
            const last = e.sets[e.sets.length - 1];
            return {
              ...e,
              sets: [
                ...e.sets,
                { id: makeId(), reps: last?.reps ?? 10, weight: last?.weight ?? 0, done: false },
              ],
            };
          }),

        removeSet: (sessionExerciseId, setId) =>
          editExercise(sessionExerciseId, e => ({
            ...e,
            sets: e.sets.filter(s => s.id !== setId),
          })),

        updateSet: (sessionExerciseId, setId, patch) =>
          editExercise(sessionExerciseId, e => ({
            ...e,
            sets: e.sets.map(s => (s.id === setId ? { ...s, ...patch } : s)),
          })),

        toggleSet: (sessionExerciseId, setId) => {
          const exercise = get().activeSession?.exercises.find(e => e.id === sessionExerciseId);
          const target = exercise?.sets.find(s => s.id === setId);
          if (!exercise || !target) {
            return;
          }
          const done = !target.done;
          editExercise(sessionExerciseId, e => ({
            ...e,
            sets: e.sets.map(s => (s.id === setId ? { ...s, done } : s)),
          }));
          // Completing a set starts the rest timer.
          if (done && exercise.restSec > 0) {
            editSession({ restEndsAt: Date.now() + exercise.restSec * 1000 });
          }
        },

        adjustRest: deltaSec => {
          const ends = get().activeSession?.restEndsAt;
          if (ends) {
            editSession({ restEndsAt: Math.max(Date.now(), ends + deltaSec * 1000) });
          }
        },

        skipRest: () => editSession({ restEndsAt: null }),

        finish: () => {
          const { activeSession, history } = get();
          if (!activeSession) {
            return null;
          }
          const completed = completeSession(activeSession, Date.now(), history);
          if (completed) {
            set({ activeSession: null, history: [completed, ...history] });
          }
          return completed;
        },

        discard: () => set({ activeSession: null }),

        deleteSession: id => set(s => ({ history: s.history.filter(h => h.id !== id) })),

        reset: () => set({ activeSession: null, history: [] }),
      };
    },
    {
      name: 'sessions',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ activeSession, history }) => ({ activeSession, history }),
    },
  ),
);
