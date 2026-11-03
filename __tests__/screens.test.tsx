import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';

import { ExerciseDetailScreen } from '../src/screens/ExerciseDetailScreen';

const detailNav = { setOptions: jest.fn(), push: jest.fn(), goBack: jest.fn() };

function textContent(tree: ReactTestRenderer) {
  return tree.root.findAllByType(Text).map(t => [t.props.children].flat().join(''));
}

describe('ExerciseDetailScreen', () => {
  it('renders target, steps and attribution', async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(
        <ExerciseDetailScreen
          route={{ key: 'k', name: 'ExerciseDetail', params: { id: '0001' } } as any}
          navigation={detailNav as any}
        />,
      );
    });
    const texts = textContent(tree);
    expect(texts).toContain('3/4 Sit-Up');
    expect(texts).toContain('Abs');
    expect(texts.some(t => t.startsWith('Lie flat on your back'))).toBe(true);
    expect(texts.some(t => t.includes('Gym visual'))).toBe(true);

    // Tapping the demo opens the full-screen view.
    const { Modal } = require('react-native');
    expect(tree.root.findByType(Modal).props.visible).toBe(false);
    const hero = tree.root.findAll(n => n.props.accessibilityRole === 'imagebutton')[0];
    await act(async () => hero.props.onPress());
    expect(tree.root.findByType(Modal).props.visible).toBe(true);
    await act(async () => tree.unmount());
  });
});

import { Alert } from 'react-native';
import { ActiveWorkoutScreen } from '../src/screens/ActiveWorkoutScreen';
import { CreateScreen } from '../src/screens/CreateScreen';
import { RoutineEditorScreen } from '../src/screens/RoutineEditorScreen';
import { WorkoutSummaryScreen } from '../src/screens/WorkoutSummaryScreen';
import { useRoutineStore } from '../src/store/routineStore';
import { useSessionStore } from '../src/store/sessionStore';

const nav = () =>
  ({
    setOptions: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    popToTop: jest.fn(),
  } as any);

const mounted: ReactTestRenderer[] = [];

async function render(el: React.ReactElement) {
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(el);
  });
  mounted.push(tree);
  return tree;
}

// Unmount so store resets in later tests don't re-render stale screens.
afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(t => t.unmount()));
});

describe('workout screens', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    useRoutineStore.getState().reset();
  });

  it('start sheet lists templates and starts one', async () => {
    const navigation = nav();
    const tree = await render(<CreateScreen navigation={navigation} route={{} as any} />);
    expect(textContent(tree)).toContain('Starter templates');
    const start = tree.root.findAll(n => n.props.accessibilityLabel === 'Start Full Body')[0];
    await act(async () => start.props.onPress());
    expect(useSessionStore.getState().activeSession?.name).toBe('Full Body');
    expect(navigation.replace).toHaveBeenCalledWith('ActiveWorkout');
  });

  it('active workout logs a set and finishes to the summary', async () => {
    useSessionStore.getState().start({
      name: 'Push',
      items: [{ exerciseId: '0025', sets: 1, reps: 5, restSec: 60 }],
    });
    const navigation = nav();
    const tree = await render(<ActiveWorkoutScreen navigation={navigation} route={{} as any} />);
    expect(textContent(tree)).toContain('Barbell Bench Press');

    const check = tree.root.findAll(n => n.props.accessibilityLabel === 'Complete set 1')[0];
    await act(async () => check.props.onPress());
    expect(textContent(tree).some(t => t.startsWith('Rest '))).toBe(true);

    // Finish via the header button.
    const { headerRight } = navigation.setOptions.mock.calls.at(-1)[0];
    const header = await render(headerRight());
    jest.spyOn(Alert, 'alert');
    await act(async () => header.root.findByProps({ accessibilityRole: 'button' }).props.onPress());
    const saved = useSessionStore.getState().history[0];
    expect(saved.setCount).toBe(1);
    expect(navigation.replace).toHaveBeenCalledWith('WorkoutSummary', { sessionId: saved.id });

    const summary = await render(
      <WorkoutSummaryScreen navigation={nav()} route={{ params: { sessionId: saved.id } } as any} />,
    );
    expect(textContent(summary)).toContain('Workout complete');
  });

  it('routine editor renders exercises', async () => {
    const id = useRoutineStore.getState().create('Mine', ['0025']);
    const tree = await render(
      <RoutineEditorScreen navigation={nav()} route={{ params: { id } } as any} />,
    );
    expect(textContent(tree)).toContain('Barbell Bench Press');
  });
});

import { ActivityScreen } from '../src/screens/ActivityScreen';
import { HomeScreen } from '../src/screens/HomeScreen';
import { SessionDetailScreen } from '../src/screens/SessionDetailScreen';
import { useProfileStore } from '../src/store/profileStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

function logWorkout(weight: number) {
  const store = useSessionStore.getState;
  store().start({ name: 'Push', items: [{ exerciseId: '0025', sets: 1, reps: 5, restSec: 60 }] });
  const ex = store().activeSession!.exercises[0];
  store().updateSet(ex.id, ex.sets[0].id, { weight });
  store().toggleSet(ex.id, ex.sets[0].id);
  return store().finish()!;
}

describe('progress screens', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    useProfileStore.getState().completeOnboarding({
      name: 'Sam',
      goal: 'strength',
      level: 'beginner',
      equipment: ['barbell'],
      unit: 'kg',
      weeklyTarget: 3,
    });
  });

  it('activity shows an empty state with no history', async () => {
    const tree = await render(<ActivityScreen />);
    expect(textContent(tree)).toContain('No workouts yet');
  });

  it('activity renders stats, charts and history', async () => {
    logWorkout(60);
    const latest = logWorkout(70);
    expect(latest.prs).toHaveLength(1);

    const tree = await render(<ActivityScreen />);
    const texts = textContent(tree);
    expect(texts).toContain('Weekly volume');
    expect(texts).toContain('Exercise progress');
    expect(texts).toContain('Sets by muscle this week');
    expect(texts).toContain('Recent personal records');
    expect(texts).toContain('2/3');

    const card = tree.root.findAll(n => n.props.accessibilityLabel?.startsWith?.('Push, Today'))[0];
    await act(async () => card.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('SessionDetail', { sessionId: latest.id });

    const detail = await render(
      <SessionDetailScreen navigation={nav()} route={{ params: { sessionId: latest.id } } as any} />,
    );
    expect(textContent(detail)).toContain('Personal records');
  });

  it('home shows greeting, goal ring and last workout', async () => {
    logWorkout(60);
    const tree = await render(<HomeScreen />);
    const texts = textContent(tree);
    expect(texts.some(t => t.endsWith(', Sam'))).toBe(true);
    expect(texts).toContain('2 more workouts to hit your goal');
    expect(texts).toContain('Last workout');
    expect(texts).toContain('Exercise of the day');
  });
});
