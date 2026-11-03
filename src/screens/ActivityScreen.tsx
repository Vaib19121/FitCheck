import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button } from '../components/Button';
import { Card, SectionHeader } from '../components/Card';
import { FilterChips } from '../components/Chip';
import { ColumnChart } from '../components/charts/ColumnChart';
import { LineChart } from '../components/charts/LineChart';
import { EmptyState } from '../components/EmptyState';
import { prLabel } from '../components/SessionBreakdown';
import { SessionCard } from '../components/SessionCard';
import { StatTile } from '../components/StatTile';
import { WeekStrip } from '../components/WeekStrip';
import { getExercise } from '../data/exercises';
import { useNow } from '../hooks/useNow';
import { useProfileStore } from '../store/profileStore';
import {
  allPRs,
  exerciseProgress,
  frequentExercises,
  sessionsThisWeek,
  setsByBodyPart,
  weekStreak,
  weeklyTotals,
} from '../store/selectors';
import { useSessionStore } from '../store/sessionStore';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import {
  formatShortDate,
  formatVolume,
  formatWeight,
  titleCase,
} from '../utils/format';

const PAGE = 10;

export function ActivityScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const history = useSessionStore(s => s.history);
  const unit = useProfileStore(s => s.unit);
  const weeklyTarget = useProfileStore(s => s.weeklyTarget);
  const now = useNow(60_000);
  const [shown, setShown] = useState(PAGE);

  const stats = useMemo(
    () => ({
      thisWeek: sessionsThisWeek(history, now),
      streak: weekStreak(history, weeklyTarget, now),
      weeks: weeklyTotals(history, now, 8),
      muscles: setsByBodyPart(history, now),
      prs: allPRs(history).slice(0, 5),
      frequent: frequentExercises(history),
    }),
    [history, now, weeklyTarget],
  );

  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const progressId = exerciseId ?? stats.frequent[0] ?? null;
  const progress = useMemo(() => {
    if (!progressId) {
      return null;
    }
    const points = exerciseProgress(history, progressId);
    const weighted = points.some(p => p.maxWeight > 0);
    return {
      weighted,
      data: points.map(p => ({
        value: weighted ? p.best1RM : p.maxReps,
        label: formatShortDate(p.date),
      })),
    };
  }, [history, progressId]);

  if (!history.length) {
    return (
      <View style={styles.screen}>
        <Text style={[styles.title, styles.titlePad]} accessibilityRole="header">
          Activity
        </Text>
        <EmptyState
          icon="pulse-outline"
          title="No workouts yet"
          message="Finish your first workout to see history, charts and personal records here."
          actionTitle="Start a workout"
          onAction={() => navigation.navigate('Create')}
        />
      </View>
    );
  }

  const maxMuscle = Math.max(...stats.muscles.map(m => m.sets), 1);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        Activity
      </Text>

      <Card style={styles.gap}>
        <WeekStrip history={history} now={now} />
      </Card>

      <View style={styles.tiles}>
        <StatTile icon="calendar-outline" label="This week" value={`${stats.thisWeek}/${weeklyTarget}`} />
        <StatTile icon="flame-outline" label="Week streak" value={String(stats.streak)} />
        <StatTile icon="trophy-outline" label="Workouts" value={String(history.length)} />
      </View>

      <SectionHeader title="Weekly volume" />
      <Card>
        <ColumnChart
          data={stats.weeks.map(w => ({
            label: String(new Date(w.weekStart).getDate()),
            detail: `Week of ${formatShortDate(w.weekStart)} · ${w.sessions} workout${w.sessions === 1 ? '' : 's'}`,
            value: w.volume,
          }))}
          formatValue={v => formatVolume(v, unit)}
          accessibilityLabel={`Weekly volume for the last 8 weeks. This week: ${formatVolume(
            stats.weeks[stats.weeks.length - 1].volume,
            unit,
          )}`}
        />
      </Card>

      {progressId && progress ? (
        <>
          <SectionHeader title="Exercise progress" />
          <View style={styles.bleed}>
            <FilterChips
              options={stats.frequent.map(id => ({
                value: id,
                label: getExercise(id)?.name ?? id,
              }))}
              selected={progressId}
              onChange={id => id && setExerciseId(id)}
              allLabel=""
            />
          </View>
          <Card style={styles.gap}>
            <Text style={styles.chartCaption}>
              {progress.weighted ? 'Best estimated 1RM per session' : 'Most reps per session'}
            </Text>
            {progress.data.length >= 2 ? (
              <LineChart
                data={progress.data}
                formatValue={v => (progress.weighted ? formatWeight(v, unit) : `${v} reps`)}
                accessibilityLabel={`${getExercise(progressId)?.name} progress over ${progress.data.length} sessions`}
              />
            ) : (
              <Text style={styles.muted}>Log this exercise again to see a trend.</Text>
            )}
          </Card>
        </>
      ) : null}

      {stats.muscles.length ? (
        <>
          <SectionHeader title="Sets by muscle this week" />
          <Card style={styles.gap}>
            {stats.muscles.map(m => (
              <MuscleBar key={m.bodyPart} label={titleCase(m.bodyPart)} value={m.sets} max={maxMuscle} />
            ))}
          </Card>
        </>
      ) : null}

      {stats.prs.length ? (
        <>
          <SectionHeader title="Recent personal records" />
          <Card style={styles.gap}>
            {stats.prs.map(pr => (
              <View key={`${pr.date}-${pr.exerciseId}-${pr.kind}`} style={styles.prRow}>
                <Text style={styles.prName} numberOfLines={1}>
                  {getExercise(pr.exerciseId)?.name}
                </Text>
                <Text style={styles.muted}>
                  {prLabel(pr, unit)} · {formatShortDate(pr.date)}
                </Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title="History" />
      {history.slice(0, shown).map(s => (
        <SessionCard
          key={s.id}
          session={s}
          unit={unit}
          onPress={() => navigation.navigate('SessionDetail', { sessionId: s.id })}
        />
      ))}
      {history.length > shown ? (
        <Button title="Show more" variant="secondary" onPress={() => setShown(n => n + PAGE)} />
      ) : null}
    </ScrollView>
  );
}

/** Horizontal bar: rounded data-end, square baseline, value at the tip in text ink. */
function MuscleBar({ label, value, max }: { label: string; value: number; max: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.barRow} accessible accessibilityLabel={`${label}: ${value} sets`}>
      <Text style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.bar,
            { width: `${(value / max) * 100}%`, backgroundColor: colors.chart },
          ]}
        />
      </View>
      <Text style={styles.barValue}>{value}</Text>
    </View>
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
  title: {
    ...fonts.bold,
    fontSize: 32,
    color: colors.text,
  },
  titlePad: {
    padding: spacing.md,
  },
  gap: {
    gap: spacing.sm,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bleed: {
    marginHorizontal: -spacing.md,
  },
  chartCaption: {
    ...fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  muted: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    ...fonts.medium,
    width: 92,
    fontSize: 13,
    color: colors.text,
  },
  barTrack: {
    flex: 1,
    height: 12,
  },
  bar: {
    height: 12,
    minWidth: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  barValue: {
    ...fonts.semiBold,
    width: 28,
    textAlign: 'right',
    fontSize: 13,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  prRow: {
    gap: 2,
  },
  prName: {
    ...fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
}));
