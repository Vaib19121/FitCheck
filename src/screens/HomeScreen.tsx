import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '../components/Button';
import { Card, SectionHeader } from '../components/Card';
import { ProgressRing } from '../components/charts/ProgressRing';
import { ExerciseThumb } from '../components/ExerciseThumb';
import { SessionCard } from '../components/SessionCard';
import { WeekStrip } from '../components/WeekStrip';
import { useNow } from '../hooks/useNow';
import { useAvailableEquipment, useProfileStore } from '../store/profileStore';
import { useRoutineStore } from '../store/routineStore';
import { exerciseOfTheDay, sessionsThisWeek, weekStreak } from '../store/selectors';
import { useSessionStore } from '../store/sessionStore';
import { startWorkout, summarizeExercises } from '../store/startWorkout';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import { formatClock, titleCase } from '../utils/format';

function greeting(now: number) {
  const h = new Date(now).getHours();
  if (h < 12) {
    return 'Good morning';
  }
  return h < 18 ? 'Good afternoon' : 'Good evening';
}

export function HomeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const name = useProfileStore(s => s.name);
  const unit = useProfileStore(s => s.unit);
  const weeklyTarget = useProfileStore(s => s.weeklyTarget);
  const history = useSessionStore(s => s.history);
  const activeSession = useSessionStore(s => s.activeSession);
  const routines = useRoutineStore(s => s.routines);
  const equipment = useAvailableEquipment();
  const now = useNow(activeSession ? 1000 : 60_000);

  const done = useMemo(() => sessionsThisWeek(history, now), [history, now]);
  const streak = useMemo(() => weekStreak(history, weeklyTarget, now), [history, weeklyTarget, now]);
  const today = new Date(now).toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute once per day
  const featured = useMemo(() => exerciseOfTheDay(equipment, now), [equipment, today]);
  const remaining = Math.max(0, weeklyTarget - done);

  const openWorkout = () => navigation.navigate('ActiveWorkout');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.greeting}>{greeting(now)}{name ? `, ${name}` : ''}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {remaining === 0 ? 'Weekly goal reached' : 'Let’s train'}
        </Text>
      </View>

      {activeSession ? (
        <Card onPress={openWorkout} style={styles.resume} accessibilityLabel="Resume workout">
          <Ionicons name="play-circle" size={36} color={colors.onPrimary} />
          <View style={styles.fill}>
            <Text style={styles.resumeTitle}>{activeSession.name} in progress</Text>
            <Text style={styles.resumeSub}>
              {formatClock((now - activeSession.startedAt) / 1000)} elapsed · tap to resume
            </Text>
          </View>
        </Card>
      ) : null}

      <Card style={styles.goal}>
        <ProgressRing
          progress={done / weeklyTarget}
          color={remaining === 0 ? colors.success : undefined}
          accessibilityLabel={`${done} of ${weeklyTarget} workouts this week`}
        >
          <Text style={styles.ringValue}>
            {done}
            <Text style={styles.ringTotal}>/{weeklyTarget}</Text>
          </Text>
          <Text style={styles.ringLabel}>this week</Text>
        </ProgressRing>
        <View style={styles.goalText}>
          <Text style={styles.goalTitle}>
            {remaining === 0
              ? 'Nice work — goal hit!'
              : `${remaining} more workout${remaining === 1 ? '' : 's'} to hit your goal`}
          </Text>
          <View style={styles.streak}>
            <Ionicons name="flame" size={18} color={colors.warning} />
            <Text style={styles.streakText}>
              {streak} week streak
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <WeekStrip history={history} now={now} />
      </Card>

      {!activeSession ? (
        <>
          <SectionHeader
            title="Quick start"
            action="All"
            onAction={() => navigation.navigate('Create')}
          />
          {routines.length ? (
            routines.slice(0, 3).map(r => (
              <Card
                key={r.id}
                style={styles.quick}
                onPress={() =>
                  startWorkout({ name: r.name, routineId: r.id, items: r.exercises }, openWorkout)
                }
                accessibilityLabel={`Start ${r.name}`}
              >
                <View style={styles.fill}>
                  <Text style={styles.cardTitle}>{r.name}</Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {summarizeExercises(r.exercises.map(e => e.exerciseId))}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={32} color={colors.primary} />
              </Card>
            ))
          ) : (
            <Button
              title="Pick a routine or template"
              icon="add"
              onPress={() => navigation.navigate('Create')}
            />
          )}
        </>
      ) : null}

      {featured ? (
        <>
          <SectionHeader title="Exercise of the day" />
          <Card
            style={styles.quick}
            onPress={() => navigation.navigate('ExerciseDetail', { id: featured.id })}
            accessibilityLabel={`Exercise of the day: ${featured.name}`}
          >
            <ExerciseThumb exercise={featured} size={64} />
            <View style={styles.fill}>
              <Text style={styles.cardTitle}>{featured.name}</Text>
              <Text style={styles.cardSub}>
                {titleCase(featured.target)} · {titleCase(featured.equipment)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Card>
        </>
      ) : null}

      {history[0] ? (
        <>
          <SectionHeader
            title="Last workout"
            action="History"
            onAction={() => navigation.navigate('Tabs', { screen: 'Activity' })}
          />
          <SessionCard
            session={history[0]}
            unit={unit}
            onPress={() => navigation.navigate('SessionDetail', { sessionId: history[0].id })}
          />
        </>
      ) : null}

      <Pressable
        onPress={() => navigation.navigate('Tabs', { screen: 'Explore' })}
        accessibilityRole="button"
        style={styles.browse}
      >
        <Ionicons name="compass-outline" size={18} color={colors.primary} />
        <Text style={styles.browseText}>Browse 1,324 exercises</Text>
      </Pressable>
    </ScrollView>
  );
}

const useStyles = makeStyles(colors => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  fill: {
    flex: 1,
  },
  greeting: {
    ...fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
  },
  title: {
    ...fonts.bold,
    fontSize: 30,
    color: colors.text,
  },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  resumeTitle: {
    ...fonts.bold,
    fontSize: 16,
    color: colors.onPrimary,
  },
  resumeSub: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.onPrimary,
    opacity: 0.85,
    fontVariant: ['tabular-nums'],
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  ringValue: {
    ...fonts.bold,
    fontSize: 26,
    color: colors.text,
  },
  ringTotal: {
    ...fonts.medium,
    fontSize: 16,
    color: colors.textTertiary,
  },
  ringLabel: {
    ...fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  goalText: {
    flex: 1,
    gap: spacing.sm,
  },
  goalTitle: {
    ...fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    ...fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  quick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTitle: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  cardSub: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  browse: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  browseText: {
    ...fonts.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
}));
