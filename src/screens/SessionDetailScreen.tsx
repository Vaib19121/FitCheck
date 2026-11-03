import { useLayoutEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { SectionHeader } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PRList, SessionBreakdown } from '../components/SessionBreakdown';
import { StatTile } from '../components/StatTile';
import { RootStackScreenProps } from '../navigation/types';
import { useProfileStore } from '../store/profileStore';
import { useSessionStore } from '../store/sessionStore';
import { fonts, makeStyles, spacing, useTheme } from '../theme';
import { formatDuration, formatVolume } from '../utils/format';

export function SessionDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<'SessionDetail'>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const unit = useProfileStore(s => s.unit);
  const session = useSessionStore(s => s.history.find(h => h.id === route.params.sessionId));

  useLayoutEffect(() => {
    navigation.setOptions({
      title: session?.name ?? 'Workout',
      headerRight: () => (
        <Pressable
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Delete workout"
          onPress={() =>
            Alert.alert('Delete this workout?', 'It will be removed from your history and stats.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  navigation.goBack();
                  useSessionStore.getState().deleteSession(route.params.sessionId);
                },
              },
            ])
          }
        >
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
      ),
    });
  }, [navigation, session?.name, colors, route.params.sessionId]);

  if (!session) {
    return <EmptyState icon="alert-circle-outline" title="Workout not found" />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.date}>
        {new Date(session.startedAt).toLocaleString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
      <View style={styles.stats}>
        <StatTile icon="time-outline" label="Duration" value={formatDuration(session.durationSec)} />
        <StatTile icon="barbell-outline" label="Volume" value={formatVolume(session.volume, unit)} />
        <StatTile icon="layers-outline" label="Sets" value={String(session.setCount)} />
      </View>
      {session.prs.length ? (
        <>
          <SectionHeader title="Personal records" />
          <PRList prs={session.prs} unit={unit} />
        </>
      ) : null}
      <SectionHeader title="Exercises" />
      <SessionBreakdown exercises={session.exercises} unit={unit} />
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
  date: {
    ...fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
}));
