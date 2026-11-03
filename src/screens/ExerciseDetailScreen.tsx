import { useLayoutEffect, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '../components/Button';
import { Card, SectionHeader } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { ExerciseThumb } from '../components/ExerciseThumb';
import { StatTile } from '../components/StatTile';
import { exerciseSteps, exercises, getExercise } from '../data/exercises';
import { RootStackScreenProps } from '../navigation/types';
import { useAvailableEquipment, useProfileStore } from '../store/profileStore';
import { useSessionStore } from '../store/sessionStore';
import { bestFor, lastSetsFor } from '../store/workoutMath';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import { formatWeight, titleCase, toDisplayWeight } from '../utils/format';

const SIMILAR_LIMIT = 10;

export function ExerciseDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<'ExerciseDetail'>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const exercise = getExercise(route.params.id);
  const myEquipment = useAvailableEquipment();
  const unit = useProfileStore(s => s.unit);
  const history = useSessionStore(s => s.history);
  const best = useMemo(() => bestFor(history, route.params.id), [history, route.params.id]);
  const lastSets = useMemo(
    () => lastSetsFor(history, route.params.id),
    [history, route.params.id],
  );

  // The name is shown large in the body; the header just carries the back button.
  useLayoutEffect(() => {
    navigation.setOptions({ title: '' });
  }, [navigation]);

  // Same target muscle, preferring equipment the user owns.
  const similar = useMemo(() => {
    if (!exercise) {
      return [];
    }
    const owned = new Set(myEquipment);
    return exercises
      .filter(e => e.target === exercise.target && e.id !== exercise.id)
      .sort((a, b) => Number(owned.has(b.equipment)) - Number(owned.has(a.equipment)))
      .slice(0, SIMILAR_LIMIT);
  }, [exercise, myEquipment]);

  if (!exercise) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Exercise not found"
        actionTitle="Go back"
        onAction={navigation.goBack}
      />
    );
  }

  const steps = exerciseSteps(exercise);
  const owned = myEquipment.includes(exercise.equipment);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ExerciseMedia exercise={exercise} />

        <View style={styles.titleBlock}>
          <Text style={styles.name} accessibilityRole="header">
            {exercise.name}
          </Text>
          {!owned ? (
            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.noticeText}>Needs equipment not in your profile</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.facts}>
          <Fact icon="locate-outline" label="Target" value={titleCase(exercise.target)} />
          <Fact icon="body-outline" label="Body part" value={titleCase(exercise.bodyPart)} />
          <Fact icon="barbell-outline" label="Equipment" value={titleCase(exercise.equipment)} />
        </View>

        {exercise.secondaryMuscles.length ? (
          <View style={styles.section}>
            <Text style={styles.label}>Also works</Text>
            <View style={styles.chips}>
              {exercise.secondaryMuscles.map(m => (
                <Chip key={m} label={titleCase(m)} />
              ))}
            </View>
          </View>
        ) : null}

        <SectionHeader title="How to do it" />
        <Card style={styles.steps}>
          {steps.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.rail}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                {i < steps.length - 1 ? <View style={styles.railLine} /> : null}
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card>

        {best ? (
          <>
            <SectionHeader title="Your history" />
            <View style={styles.tiles}>
              {best.maxWeight > 0 ? (
                <>
                  <StatTile icon="trophy-outline" label="Best weight" value={formatWeight(best.maxWeight, unit)} tint={colors.warning} />
                  <StatTile icon="trending-up-outline" label="Est. 1RM" value={formatWeight(best.best1RM, unit)} />
                </>
              ) : (
                <StatTile icon="trophy-outline" label="Most reps" value={String(best.maxReps)} tint={colors.warning} />
              )}
            </View>
            {lastSets ? (
              <Card style={styles.lastTime}>
                <Text style={styles.label}>Last time</Text>
                <Text style={styles.lastSets}>
                  {lastSets
                    .map(s =>
                      s.weight > 0 ? `${toDisplayWeight(s.weight, unit)} ${unit} × ${s.reps}` : `${s.reps} reps`,
                    )
                    .join('   ·   ')}
                </Text>
              </Card>
            ) : null}
          </>
        ) : null}

        {similar.length ? (
          <>
            <SectionHeader title={`More for ${titleCase(exercise.target)}`} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.bleed}
              contentContainerStyle={styles.similar}
            >
              {similar.map(e => (
                <Pressable
                  key={e.id}
                  onPress={() => navigation.push('ExerciseDetail', { id: e.id })}
                  accessibilityRole="button"
                  accessibilityLabel={e.name}
                  style={({ pressed }) => [styles.similarCard, pressed && styles.pressed]}
                >
                  <ExerciseThumb exercise={e} size={124} />
                  <Text style={styles.similarName} numberOfLines={2}>
                    {e.name}
                  </Text>
                  <Text style={styles.similarMeta} numberOfLines={1}>
                    {titleCase(e.equipment)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          title="Add to routine or workout"
          icon="add"
          onPress={() => navigation.navigate('AddToRoutine', { exerciseId: exercise.id })}
        />
      </View>
    </View>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.factIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={2}>
        {value}
      </Text>
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
    paddingTop: spacing.sm,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  name: {
    ...fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeText: {
    ...fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  facts: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fact: {
    flex: 1,
    gap: 4,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    marginBottom: 2,
  },
  factLabel: {
    ...fonts.medium,
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  factValue: {
    ...fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    ...fonts.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  steps: {
    paddingVertical: spacing.md,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  rail: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  stepNumberText: {
    ...fonts.bold,
    fontSize: 13,
    color: colors.onPrimary,
  },
  railLine: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    borderRadius: 1,
    backgroundColor: colors.primaryContainer,
  },
  stepText: {
    ...fonts.regular,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    paddingTop: 3,
    paddingBottom: spacing.md,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  lastTime: {
    gap: 4,
  },
  lastSets: {
    ...fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  bleed: {
    marginHorizontal: -spacing.md,
  },
  similar: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  similarCard: {
    width: 124,
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  similarName: {
    ...fonts.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  similarMeta: {
    ...fonts.regular,
    fontSize: 12,
    color: colors.textTertiary,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
}));
