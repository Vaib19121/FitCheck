import { niceMax, formatTick, columnPath } from '../src/components/charts/scale';
import {
  allPRs,
  exerciseOfTheDay,
  exerciseProgress,
  sessionsThisWeek,
  setsByBodyPart,
  startOfWeek,
  weekDays,
  weekStreak,
  weeklyTotals,
} from '../src/store/selectors';
import { CompletedSession } from '../src/store/workoutTypes';

// Wednesday, Nov 4 2026, noon local time.
const NOW = new Date(2026, 10, 4, 12).getTime();
const day = (offset: number) => new Date(2026, 10, 4 + offset, 9).getTime();

const session = (
  startedAt: number,
  sets: { weight: number; reps: number }[] = [{ weight: 50, reps: 10 }],
  exerciseId = '0025', // barbell bench press (chest)
): CompletedSession => ({
  id: String(startedAt),
  name: 'W',
  routineId: null,
  startedAt,
  endedAt: startedAt + 3600_000,
  durationSec: 3600,
  volume: sets.reduce((s, x) => s + x.weight * x.reps, 0),
  setCount: sets.length,
  prs: [],
  exercises: [
    {
      id: 'e',
      exerciseId,
      restSec: 90,
      sets: sets.map((s, i) => ({ id: String(i), ...s, done: true })),
    },
  ],
});

describe('selectors', () => {
  it('weeks start on Monday', () => {
    expect(new Date(startOfWeek(NOW)).getDay()).toBe(1);
    expect(new Date(startOfWeek(NOW)).getDate()).toBe(2);
  });

  it('marks trained days in the current week', () => {
    const days = weekDays([session(day(0)), session(day(-2))], NOW);
    expect(days.map(d => d.sessions)).toEqual([1, 0, 1, 0, 0, 0, 0]);
    expect(days[2].isToday).toBe(true);
    expect(days[3].isFuture).toBe(true);
  });

  it('counts week streaks without breaking on an unfinished week', () => {
    // Newest first: Sun 1 + Thu 29 (last week), Sun 25 + Thu 22 (week before), none this week.
    const history = [day(-3), day(-6), day(-10), day(-13)].map(t => session(t));
    expect(sessionsThisWeek(history, NOW)).toBe(0);
    expect(weekStreak(history, 2, NOW)).toBe(2);
    expect(weekStreak(history, 3, NOW)).toBe(0);
    expect(weekStreak([session(day(0)), session(day(-1)), ...history], 2, NOW)).toBe(3);
  });

  it('totals weekly volume oldest first', () => {
    const weeks = weeklyTotals([session(day(0)), session(day(-7))], NOW, 3);
    expect(weeks.map(w => w.volume)).toEqual([0, 500, 500]);
  });

  it('counts sets by body part this week only', () => {
    const history = [
      session(day(0), [{ weight: 50, reps: 10 }, { weight: 50, reps: 8 }]),
      session(day(-7)),
    ];
    expect(setsByBodyPart(history, NOW)).toEqual([{ bodyPart: 'chest', sets: 2 }]);
  });

  it('builds per-session progress oldest first', () => {
    const history = [session(day(0), [{ weight: 60, reps: 5 }]), session(day(-7), [{ weight: 50, reps: 5 }])];
    expect(exerciseProgress(history, '0025').map(p => p.maxWeight)).toEqual([50, 60]);
  });

  it('flattens PRs with their date', () => {
    const s = { ...session(day(0)), prs: [{ exerciseId: '0025', kind: 'weight' as const, value: 60, previous: 50 }] };
    expect(allPRs([s])[0]).toMatchObject({ value: 60, date: day(0) });
  });

  it('picks a stable exercise of the day from owned equipment', () => {
    const a = exerciseOfTheDay(['body weight'], NOW);
    expect(a?.equipment).toBe('body weight');
    expect(exerciseOfTheDay(['body weight'], NOW + 3600_000)?.id).toBe(a?.id);
    expect(exerciseOfTheDay([], NOW)).toBeUndefined();
  });
});

describe('chart scale', () => {
  it('rounds axis maxima to clean numbers', () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(7)).toBe(10);
    expect(niceMax(1800)).toBe(2000);
    expect(niceMax(2100)).toBe(2500);
  });

  it('formats ticks in full below 10,000 and compact above', () => {
    expect(formatTick(2500)).toBe((2500).toLocaleString());
    expect(formatTick(12000)).toBe('12K');
    expect(formatTick(12500)).toBe('12.5K');
  });

  it('draws nothing for zero-height columns', () => {
    expect(columnPath(0, 10, 20, 0)).toBe('');
    expect(columnPath(0, 0, 20, 40)).toMatch(/^M0,40/);
  });
});
