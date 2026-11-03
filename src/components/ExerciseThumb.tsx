import { useState } from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Exercise, mediaUrl } from '../data/exercises';
import { makeStyles, useTheme } from '../theme';

/** Thumbnails are list-sized; the large demo lives in ExerciseMedia. */
export const MAX_MEDIA_SIZE = 180;

type Props = {
  exercise: Pick<Exercise, 'image' | 'gif'>;
  size?: number;
  /** Play the animation GIF instead of the static thumbnail. */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Exercise thumbnail/GIF with a placeholder while loading or offline. */
export function ExerciseThumb({ exercise, size = 56, animated, style }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dim = Math.min(size, MAX_MEDIA_SIZE);
  const box = { width: dim, height: dim, borderRadius: dim / 6 };

  return (
    <View style={[styles.box, box, style]}>
      {!loaded || failed ? (
        <Ionicons
          name={failed ? 'cloud-offline-outline' : 'barbell-outline'}
          size={dim / 2.5}
          color={colors.textTertiary}
        />
      ) : null}
      {failed ? null : (
        <Image
          source={{ uri: mediaUrl(animated ? exercise.gif : exercise.image) }}
          style={[styles.image, box]}
          resizeMode="cover"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      )}
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Media has a white background; keep it white in dark mode too.
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
}));
