import { ReactNode, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Card, SectionHeader } from '../components/Card';
import {
  EquipmentPicker,
  GoalPicker,
  LevelPicker,
  UnitPicker,
  WeeklyTargetPicker,
} from '../components/ProfileFields';
import { EQUIPMENT_GROUPS } from '../data/equipment';
import { MEDIA_ATTRIBUTION } from '../data/exercises';
import meta from '../data/meta.json';
import {
  GOAL_LABELS,
  LEVEL_LABELS,
  useProfileStore,
} from '../store/profileStore';
import { resetAllData } from '../store/resetAll';
import { fonts, makeStyles, spacing, useTheme } from '../theme';

const DATASET_URL = 'https://github.com/hasaneyldrm/exercises-dataset';
const GYM_VISUAL_URL = 'https://gymvisual.com/';

type Section = 'goal' | 'level' | 'equipment' | null;

export function ProfileScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const profile = useProfileStore();
  const { update } = profile;
  const [open, setOpen] = useState<Section>(null);
  const [name, setName] = useState(profile.name);

  const toggle = (section: Section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(o => (o === section ? null : section));
  };

  const equipmentSummary = profile.equipment.length
    ? EQUIPMENT_GROUPS.filter(g => profile.equipment.includes(g.key))
        .map(g => g.label)
        .join(', ')
    : 'Body weight only';

  const confirmReset = () =>
    Alert.alert(
      'Reset all data?',
      'This deletes your profile, routines and workout history from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetAllData },
      ],
    );

  const initial = (profile.name.trim()[0] ?? 'F').toUpperCase();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        Profile
      </Text>

      <Card style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.fill}>
          <TextInput
            value={name}
            onChangeText={setName}
            onEndEditing={() => update({ name: name.trim() })}
            placeholder="Your name"
            placeholderTextColor={colors.textTertiary}
            style={styles.nameInput}
            maxLength={40}
            accessibilityLabel="Your name"
          />
          <Text style={styles.muted}>
            {GOAL_LABELS[profile.goal]} · {LEVEL_LABELS[profile.level]}
          </Text>
        </View>
        <Ionicons name="create-outline" size={20} color={colors.textTertiary} />
      </Card>

      <SectionHeader title="Training" />
      <Card style={styles.group}>
        <ExpandableRow
          icon="flag-outline"
          label="Goal"
          value={GOAL_LABELS[profile.goal]}
          open={open === 'goal'}
          onPress={() => toggle('goal')}
        >
          <GoalPicker value={profile.goal} onChange={goal => update({ goal })} />
        </ExpandableRow>
        <ExpandableRow
          icon="stats-chart-outline"
          label="Experience"
          value={LEVEL_LABELS[profile.level]}
          open={open === 'level'}
          onPress={() => toggle('level')}
        >
          <LevelPicker
            value={profile.level}
            onChange={level => update({ level })}
          />
        </ExpandableRow>
        <ExpandableRow
          icon="barbell-outline"
          label="Equipment"
          value={equipmentSummary}
          open={open === 'equipment'}
          onPress={() => toggle('equipment')}
        >
          <EquipmentPicker
            value={profile.equipment}
            onChange={equipment => update({ equipment })}
          />
        </ExpandableRow>
        <View style={styles.rowPadded}>
          <WeeklyTargetPicker
            value={profile.weeklyTarget}
            onChange={weeklyTarget => update({ weeklyTarget })}
          />
        </View>
        <View style={[styles.rowPadded, styles.unitRow]}>
          <Text style={styles.rowLabel}>Weight unit</Text>
          <View style={styles.unitPicker}>
            <UnitPicker value={profile.unit} onChange={unit => update({ unit })} />
          </View>
        </View>
      </Card>

      <SectionHeader title="About & credits" />
      <Card style={styles.credits}>
        <Text style={styles.body}>
          Exercise data: {meta.total.toLocaleString()} exercises from the
          open exercises-dataset (MIT License).
        </Text>
        <LinkText url={DATASET_URL} label="github.com/hasaneyldrm/exercises-dataset" />
        <Text style={styles.body}>
          Exercise images and animations {MEDIA_ATTRIBUTION.split(' — ')[0]},
          used with attribution.
        </Text>
        <LinkText url={GYM_VISUAL_URL} label="gymvisual.com" />
      </Card>

      <Pressable
        onPress={confirmReset}
        accessibilityRole="button"
        style={({ pressed }) => [styles.reset, pressed && styles.pressed]}
      >
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
        <Text style={styles.resetText}>Reset all data</Text>
      </Pressable>
    </ScrollView>
  );
}

type ExpandableRowProps = {
  icon: string;
  label: string;
  value: string;
  open: boolean;
  onPress: () => void;
  children: ReactNode;
};

function ExpandableRow({ icon, label, value, open, onPress, children }: ExpandableRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.divider}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${label}: ${value}`}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textTertiary}
        />
      </Pressable>
      {open ? <View style={styles.expanded}>{children}</View> : null}
    </View>
  );
}

function LinkText({ url, label }: { url: string; label: string }) {
  const styles = useStyles();
  return (
    <Text
      style={styles.link}
      onPress={() => Linking.openURL(url)}
      accessibilityRole="link"
    >
      {label}
    </Text>
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
    paddingBottom: 120,
  },
  fill: {
    flex: 1,
  },
  title: {
    ...fonts.bold,
    fontSize: 32,
    color: colors.text,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  avatarText: {
    ...fonts.bold,
    fontSize: 24,
    color: colors.primary,
  },
  nameInput: {
    ...fonts.bold,
    fontSize: 20,
    color: colors.text,
    paddingVertical: 0,
  },
  muted: {
    ...fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  group: {
    padding: 0,
    overflow: 'hidden',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  rowPadded: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
  },
  unitPicker: {
    width: 140,
  },
  rowLabel: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  rowValue: {
    ...fonts.regular,
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: colors.textSecondary,
  },
  expanded: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  credits: {
    gap: spacing.xs,
  },
  body: {
    ...fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  link: {
    ...fonts.medium,
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  resetText: {
    ...fonts.semiBold,
    fontSize: 16,
    color: colors.danger,
  },
}));
