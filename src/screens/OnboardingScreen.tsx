import { ReactNode, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  ScrollViewInstance,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '../components/Button';
import {
  EquipmentPicker,
  GoalPicker,
  LevelPicker,
  UnitPicker,
  WeeklyTargetPicker,
} from '../components/ProfileFields';
import { DEFAULT_PROFILE, Profile, useProfileStore } from '../store/profileStore';
import { fonts, makeStyles, spacing, useTheme } from '../theme';

type Step = { title: string; subtitle: string; render: () => ReactNode };

export function OnboardingScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const completeOnboarding = useProfileStore(s => s.completeOnboarding);
  const [draft, setDraft] = useState<Profile>(DEFAULT_PROFILE);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollViewInstance>(null);

  const set = <K extends keyof Profile>(key: K) =>
    (value: Profile[K]) => setDraft(d => ({ ...d, [key]: value }));

  const steps: Step[] = [
    {
      title: 'Welcome to FitCheck',
      subtitle: 'Let’s set up your training. What should we call you?',
      render: () => (
        <TextInput
          value={draft.name}
          onChangeText={set('name')}
          placeholder="Your name"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          autoFocus
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => go(1)}
          maxLength={40}
          accessibilityLabel="Your name"
        />
      ),
    },
    {
      title: 'What’s your main goal?',
      subtitle: 'We’ll tailor rep ranges and suggestions to it.',
      render: () => <GoalPicker value={draft.goal} onChange={set('goal')} />,
    },
    {
      title: 'Your experience',
      subtitle: 'Helps us pick starter routines that fit.',
      render: () => <LevelPicker value={draft.level} onChange={set('level')} />,
    },
    {
      title: 'What equipment do you have?',
      subtitle: 'We’ll only suggest exercises you can actually do.',
      render: () => (
        <EquipmentPicker value={draft.equipment} onChange={set('equipment')} />
      ),
    },
    {
      title: 'Almost done',
      subtitle: 'Pick your units and how often you want to train.',
      render: () => (
        <View style={styles.finalStep}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Weight unit</Text>
            <UnitPicker value={draft.unit} onChange={set('unit')} />
          </View>
          <WeeklyTargetPicker
            value={draft.weeklyTarget}
            onChange={set('weeklyTarget')}
          />
        </View>
      ),
    },
  ];

  const isLast = index === steps.length - 1;
  const step = steps[index];

  function go(next: number) {
    setIndex(Math.max(0, Math.min(steps.length - 1, next)));
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  const onContinue = () => {
    if (isLast) {
      completeOnboarding({ ...draft, name: draft.name.trim() });
    } else {
      go(index + 1);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => go(index - 1)}
            disabled={index === 0}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={index === 0 && styles.hidden}
          >
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <View
            style={styles.progress}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: steps.length, now: index + 1 }}
          >
            {steps.map((s, i) => (
              <View
                key={s.title}
                style={[styles.progressDot, i <= index && styles.progressDotActive]}
              />
            ))}
          </View>
          <View style={styles.backSpacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.fill}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title} accessibilityRole="header">
            {step.title}
          </Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
          {step.render()}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isLast ? 'Start training' : 'Continue'}
            icon={isLast ? 'checkmark' : undefined}
            onPress={onContinue}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(colors => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hidden: {
    opacity: 0,
  },
  backSpacer: {
    width: 26,
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...fonts.bold,
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    ...fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    ...fonts.medium,
    height: 54,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 18,
    color: colors.text,
  },
  finalStep: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
}));
