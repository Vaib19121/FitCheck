import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from './Button';
import { fonts, makeStyles, spacing, useTheme } from '../theme';

type Props = {
  icon: string;
  title: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, message, actionTitle, onAction }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={44} color={colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionTitle && onAction ? (
        <Button title={actionTitle} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...fonts.semiBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
}));
