/** All weights are stored in kg; convert only for display. */

export type RoutineExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  restSec: number;
};

export type Routine = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: number;
  updatedAt: number;
};

export type SetEntry = {
  id: string;
  reps: number;
  weight: number;
  done: boolean;
};

export type SessionExercise = {
  id: string;
  exerciseId: string;
  restSec: number;
  sets: SetEntry[];
};

export type ActiveSession = {
  id: string;
  name: string;
  routineId: string | null;
  startedAt: number;
  exercises: SessionExercise[];
  /** Epoch ms when the current rest period ends; null when not resting. */
  restEndsAt: number | null;
};

export type PRKind = 'weight' | '1rm' | 'reps';

export type PersonalRecord = {
  exerciseId: string;
  kind: PRKind;
  value: number;
  previous: number;
};

export type CompletedSession = Omit<ActiveSession, 'restEndsAt'> & {
  endedAt: number;
  durationSec: number;
  /** Sum of weight × reps over completed sets, in kg. */
  volume: number;
  setCount: number;
  prs: PersonalRecord[];
};
