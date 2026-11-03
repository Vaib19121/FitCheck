import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Exercise, MEDIA_ATTRIBUTION, exerciseSteps, mediaUrl } from '../data/exercises';
import { fonts, makeStyles, spacing } from '../theme';

// Source files are 180×180 (dataset media terms limit the *files* to that
// resolution; we only ever load the originals). Displaying them larger is a
// plain on-screen scale-up, so they look slightly soft but fully legible.
const HERO_MAX = 440;
/** Media has a white background in both themes; keep its frame white too. */
const MEDIA_BG = '#FFFFFF';

type Props = { exercise: Exercise };

/** Large animated demo with tap-to-expand into a full-screen view with steps. */
export function ExerciseMedia({ exercise }: Props) {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const size = Math.min(width - spacing.md * 2, HERO_MAX);

  return (
    <View style={styles.heroWrap}>
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={`${exercise.name} demonstration. Tap to view full screen.`}
        style={({ pressed }) => [
          styles.hero,
          { width: size, height: size },
          pressed && styles.pressed,
        ]}
      >
        <AnimatedDemo uri={mediaUrl(exercise.gif)} size={size} />
      </Pressable>

    </View>
  );
}

/** GIF with loading spinner and offline fallback. */
function AnimatedDemo({ uri, size }: { uri: string; size: number }) {
  const styles = useStyles();
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <View style={[styles.demo, { width: size, height: size }]}>
      {state === 'error' ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color="#9A928A" />
          <Text style={styles.offline}>Demo unavailable offline</Text>
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          resizeMode="contain"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          accessibilityIgnoresInvertColors
        />
      )}
      {state === 'loading' ? (
        <View style={[styles.center, styles.overlay]}>
          <ActivityIndicator color="#E8590C" />
        </View>
      ) : null}
    </View>
  );
}


const useStyles = makeStyles(colors => ({
  heroWrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  hero: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: MEDIA_BG,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
  },
  demo: {
    backgroundColor: MEDIA_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  offline: {
    ...fonts.medium,
    fontSize: 13,
    color: '#5C554E',
  },
  expand: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#E4E0DB',
  },
  attribution: {
    ...fonts.regular,
    fontSize: 11,
    color: colors.textTertiary,
  },
  full: {
    flex: 1,
    backgroundColor: '#0B0A09',
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fullTitle: {
    ...fonts.bold,
    flex: 1,
    fontSize: 20,
    color: '#FFFFFF',
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  fullContent: {
    gap: spacing.sm,
  },
  fullMedia: {
    alignItems: 'center',
    backgroundColor: MEDIA_BG,
  },
  fullAttribution: {
    ...fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  fullSteps: {
    gap: spacing.md,
    padding: spacing.md,
  },
  fullStep: {
    flexDirection: 'row',
    gap: 12,
  },
  fullStepNumber: {
    ...fonts.bold,
    width: 22,
    fontSize: 16,
    color: '#FF7A33',
  },
  fullStepText: {
    ...fonts.regular,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#F4F1EE',
  },
}));
