import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { fonts, makeStyles, spacing, useTheme } from '../theme';

type Props = { icon: string; title: string; subtitle?: string };

/** Centred icon + text, for screens that aren't built yet. */
export function PlaceholderScreen({ icon, title, subtitle }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...fonts.semiBold,
    fontSize: 18,
    color: colors.text,
  },
  subtitle: {
    ...fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
  },
}));
