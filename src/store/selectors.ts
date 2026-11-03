import { BodyPart, exercises, getExercise } from '../data/exercises';
import { estimate1RM } from './workoutMath';
import { CompletedSession, PersonalRecord } from './workoutTypes';

// Pure stats over workout history (newest first). Weeks start on Monday.

const DAY = 86_400_000;

export function startOfDay(t: number) {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function startOfWeek(t: number) {
  const d = new Date(startOfDay(t));
  const offset = (d.getDay() + 6) % 7; // Mon = 0
  d.setDate(d.getDate() - offset);
  return d.getTime();
}

function addDays(t: number, days: number) {
  const d = new Date(t);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** The 7 days (Mon–Sun) of the week containing `now`, with sessions per day. */
export function weekDays(history: readonly CompletedSession[], now: number) {
  const start = startOfWeek(now);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(start, i);
    const next = addDays(start, i + 1);
    return {
      day,
      isToday: day === startOfDay(now),
      isFuture: day > now,
      sessions: history.filter(s => s.startedAt >= day && s.startedAt < next).length,
    };
  });
}

export function sessionsThisWeek(history: readonly CompletedSession[], now: number) {
  const start = startOfWeek(now);
  return history.filter(s => s.startedAt >= start).length;
}

/**
 * Consecutive weeks that hit the weekly target. The current week counts once
 * it's met, but an unfinished current week doesn't break the streak.
 */
export function weekStreak(
  history: readonly CompletedSession[],
  weeklyTarget: number,
  now: number,
) {
  const counts = new Map<number, number>();
  for (const s of history) {
    const w = startOfWeek(s.startedAt);
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  let week = startOfWeek(now);
  let streak = 0;
  if ((counts.get(week) ?? 0) >= weeklyTarget) {
    streak += 1;
  }
  week = addDays(week, -7);
  while ((counts.get(week) ?? 0) >= weeklyTarget) {
    streak += 1;
    week = addDays(week, -7);
  }
  return streak;
}

/** Total volume and sessions for each of the last `weeks` weeks, oldest first. */
export function weeklyTotals(
  history: readonly CompletedSession[],
  now: number,
  weeks = 8,
) {
  const current = startOfWeek(now);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(current, -7 * (weeks - 1 - i));
    const end = addDays(start, 7);
    const inWeek = history.filter(s => s.startedAt >= start && s.startedAt < end);
    return {
      weekStart: start,
      volume: inWeek.reduce((sum, s) => sum + s.volume, 0),
      sessions: inWeek.length,
    };
  });
}

/** Completed sets per body part since the start of this week, largest first. */
export function setsByBodyPart(history: readonly CompletedSession[], now: number) {
  const start = startOfWeek(now);
  const counts = new Map<BodyPart, number>();
  for (const s of history) {
    if (s.startedAt < start) {
      break; // newest first
    }
    for (const ex of s.exercises) {
      const part = getExercise(ex.exerciseId)?.bodyPart;
      if (part) {
        counts.set(part, (counts.get(part) ?? 0) + ex.sets.length);
      }
    }
  }
  return [...counts.entries()]
    .map(([bodyPart, sets]) => ({ bodyPart, sets }))
    .sort((a, b) => b.sets - a.sets);
}

/** Exercises by number of sessions they appear in, most frequent first. */
export function frequentExercises(history: readonly CompletedSession[], limit = 8) {
  const counts = new Map<string, number>();
  for (const s of history) {
    for (const ex of s.exercises) {
      counts.set(ex.exerciseId, (counts.get(ex.exerciseId) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([exerciseId]) => exerciseId);
}

/** Per-session best for one exercise, oldest first. Weighted uses est. 1RM, bodyweight uses reps. */
export function exerciseProgress(history: readonly CompletedSession[], exerciseId: string) {
  const points: { date: number; maxWeight: number; best1RM: number; maxReps: number }[] = [];
  for (const s of history) {
    const ex = s.exercises.find(e => e.exerciseId === exerciseId);
    if (!ex) {
      continue;
    }
    points.push({
      date: s.startedAt,
      maxWeight: Math.max(...ex.sets.map(x => x.weight)),
      best1RM: Math.max(...ex.sets.map(x => estimate1RM(x.weight, x.reps))),
      maxReps: Math.max(...ex.sets.map(x => x.reps)),
    });
  }
  return points.reverse();
}

/** Every PR ever set, newest first. */
export function allPRs(history: readonly CompletedSession[]) {
  return history.flatMap(s =>
    s.prs.map((pr): PersonalRecord & { date: number } => ({ ...pr, date: s.startedAt })),
  );
}

/** A stable daily pick from exercises the user has equipment for. */
export function exerciseOfTheDay(available: readonly string[], now: number) {
  const owned = new Set(available);
  const pool = exercises.filter(e => owned.has(e.equipment));
  if (!pool.length) {
    return undefined;
  }
  const dayIndex = Math.floor(startOfDay(now) / DAY);
  // Multiplicative hash so consecutive days don't pick neighbouring entries.
  return pool[(dayIndex * 2654435761) % pool.length];
}
