import { equipmentForGroups, ALL_EQUIPMENT_GROUPS } from '../src/data/equipment';
import { getExercise } from '../src/data/exercises';
import { TEMPLATES, resolveTemplate } from '../src/data/templates';
import { useRoutineStore } from '../src/store/routineStore';
import { useSessionStore } from '../src/store/sessionStore';
import { completeSession, estimate1RM } from '../src/store/workoutMath';
import { ActiveSession } from '../src/store/workoutTypes';

const session = (sets: { weight: number; reps: number; done: boolean }[]): ActiveSession => ({
  id: 's',
  name: 'Test',
  routineId: null,
  startedAt: 0,
  restEndsAt: null,
  exercises: [
    { id: 'e', exerciseId: '0025', restSec: 90, sets: sets.map((s, i) => ({ id: `${i}`, ...s })) },
  ],
});

describe('workout math', () => {
  it('estimates 1RM with Epley', () => {
    expect(estimate1RM(100, 1)).toBe(100);
    expect(estimate1RM(100, 10)).toBeCloseTo(133.33, 1);
    expect(estimate1RM(0, 10)).toBe(0);
  });

  it('keeps only completed sets and computes volume', () => {
    const done = completeSession(
      session([
        { weight: 60, reps: 10, done: true },
        { weight: 60, reps: 8, done: false },
      ]),
      90_000,
      [],
    );
    expect(done).toMatchObject({ volume: 600, setCount: 1, durationSec: 90, prs: [] });
  });

  it('returns null when nothing was completed', () => {
    expect(completeSession(session([{ weight: 60, reps: 10, done: false }]), 1, [])).toBeNull();
  });

  it('detects a weight PR only against prior history', () => {
    const first = completeSession(session([{ weight: 60, reps: 10, done: true }]), 1, [])!;
    const second = completeSession(session([{ weight: 65, reps: 5, done: true }]), 2, [first])!;
    expect(second.prs).toEqual([{ exerciseId: '0025', kind: 'weight', value: 65, previous: 60 }]);
  });
});

describe('templates', () => {
  it('only reference real exercises', () => {
    for (const t of TEMPLATES) {
      for (const id of t.slots.flat()) {
        expect(getExercise(id)).toBeDefined();
      }
    }
  });

  it('resolve to body-weight options when the user has no equipment', () => {
    const bodyweight = equipmentForGroups([]);
    for (const t of TEMPLATES) {
      const ids = resolveTemplate(t, bodyweight);
      expect(ids.every(id => getExercise(id)?.equipment === 'body weight')).toBe(true);
    }
    expect(resolveTemplate(TEMPLATES[0], bodyweight).length).toBeGreaterThanOrEqual(5);
  });

  it('prefer gym equipment for a full gym', () => {
    const ids = resolveTemplate(TEMPLATES[0], equipmentForGroups(ALL_EQUIPMENT_GROUPS));
    expect(ids[0]).toBe('0043'); // barbell squat
  });
});

describe('session store', () => {
  beforeEach(() => useSessionStore.getState().reset());

  it('logs a workout, starts rest, and prefills next time', () => {
    const store = useSessionStore.getState;
    store().start({ name: 'Push', items: [{ exerciseId: '0025', sets: 2, reps: 8, restSec: 90 }] });

    const ex = store().activeSession!.exercises[0];
    store().updateSet(ex.id, ex.sets[0].id, { weight: 80 });
    store().toggleSet(ex.id, ex.sets[0].id);
    expect(store().activeSession!.restEndsAt).toBeGreaterThan(Date.now());

    const done = store().finish();
    expect(done?.setCount).toBe(1);
    expect(store().activeSession).toBeNull();
    expect(store().history).toHaveLength(1);

    store().start({ name: 'Push', items: [{ exerciseId: '0025', sets: 2, reps: 8, restSec: 90 }] });
    expect(store().activeSession!.exercises[0].sets.map(s => s.weight)).toEqual([80, 80]);
  });

  it('keeps the session when finishing with no completed sets', () => {
    const store = useSessionStore.getState;
    store().start({ name: 'Empty' });
    expect(store().finish()).toBeNull();
    expect(store().activeSession).not.toBeNull();
  });
});

describe('routine store', () => {
  it('creates, edits and reorders routines', () => {
    const store = useRoutineStore.getState;
    const id = store().create('Mine', ['0025', '0027']);
    const [a, b] = store().routines[0].exercises;
    store().moveExercise(id, b.id, -1);
    expect(store().routines[0].exercises.map(e => e.id)).toEqual([b.id, a.id]);
    store().updateExercise(id, a.id, { sets: 5 });
    expect(store().routines[0].exercises[1].sets).toBe(5);
    store().remove(id);
    expect(store().routines).toHaveLength(0);
  });
});
