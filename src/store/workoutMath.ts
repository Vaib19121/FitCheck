import type { Goal, Level } from './profileStore';
import {
  ActiveSession,
  CompletedSession,
  PersonalRecord,
  SetEntry,
} from './workoutTypes';

// Pure helpers: no store access, so they are easy to unit test.

export type TrainingDefaults = { sets: number; reps: number; restSec: number };

export function trainingDefaults(goal: Goal, level: Level): TrainingDefaults {
  const sets = level === 'advanced' ? 4 : 3;
  switch (goal) {
    case 'strength':
      return { sets, reps: 5, restSec: 180 };
    case 'muscle':
      return { sets, reps: 10, restSec: 90 };
    case 'fatLoss':
      return { sets, reps: 12, restSec: 60 };
    default:
      return { sets, reps: 10, restSec: 90 };
  }
}

/** Estimated one-rep max (Epley). */
export function estimate1RM(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

export type ExerciseBest = { maxWeight: number; best1RM: number; maxReps: number };

/** Best results for one exercise across completed sessions. */
export function bestFor(
  history: readonly CompletedSession[],
  exerciseId: string,
): ExerciseBest | null {
  let best: ExerciseBest | null = null;
  for (const session of history) {
    for (const ex of session.exercises) {
      if (ex.exerciseId !== exerciseId) {
        continue;
      }
      for (const s of ex.sets) {
        best ??= { maxWeight: 0, best1RM: 0, maxReps: 0 };
        best.maxWeight = Math.max(best.maxWeight, s.weight);
        best.best1RM = Math.max(best.best1RM, estimate1RM(s.weight, s.reps));
        best.maxReps = Math.max(best.maxReps, s.reps);
      }
    }
  }
  return best;
}

/** Sets from the most recent session containing the exercise (history is newest first). */
export function lastSetsFor(
  history: readonly CompletedSession[],
  exerciseId: string,
): SetEntry[] | null {
  for (const session of history) {
    const ex = session.exercises.find(e => e.exerciseId === exerciseId);
    if (ex) {
      return ex.sets;
    }
  }
  return null;
}

/**
 * Turns an active session into a history record: keeps only completed sets,
 * drops exercises with none, and detects PRs against prior history.
 * Returns null when nothing was completed.
 */
export function completeSession(
  session: ActiveSession,
  endedAt: number,
  priorHistory: readonly CompletedSession[],
): CompletedSession | null {
  const exercises = session.exercises
    .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.done) }))
    .filter(ex => ex.sets.length > 0);

  if (!exercises.length) {
    return null;
  }

  let volume = 0;
  let setCount = 0;
  const prs: PersonalRecord[] = [];

  for (const ex of exercises) {
    let maxWeight = 0;
    let best1RM = 0;
    let maxReps = 0;
    for (const s of ex.sets) {
      volume += s.weight * s.reps;
      setCount += 1;
      maxWeight = Math.max(maxWeight, s.weight);
      best1RM = Math.max(best1RM, estimate1RM(s.weight, s.reps));
      maxReps = Math.max(maxReps, s.reps);
    }

    // A first attempt sets a baseline; it isn't a PR.
    const prior = bestFor(priorHistory, ex.exerciseId);
    if (!prior) {
      continue;
    }
    if (maxWeight > 0) {
      if (maxWeight > prior.maxWeight) {
        prs.push({ exerciseId: ex.exerciseId, kind: 'weight', value: maxWeight, previous: prior.maxWeight });
      } else if (best1RM > prior.best1RM) {
        prs.push({ exerciseId: ex.exerciseId, kind: '1rm', value: best1RM, previous: prior.best1RM });
      }
    } else if (maxReps > prior.maxReps) {
      prs.push({ exerciseId: ex.exerciseId, kind: 'reps', value: maxReps, previous: prior.maxReps });
    }
  }

  return {
    id: session.id,
    name: session.name,
    routineId: session.routineId,
    startedAt: session.startedAt,
    exercises,
    endedAt,
    durationSec: Math.max(0, Math.round((endedAt - session.startedAt) / 1000)),
    volume,
    setCount,
    prs,
  };
}
