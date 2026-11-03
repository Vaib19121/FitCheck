import { StyleProp, Text, View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { fonts, makeStyles, spacing, useTheme } from '../theme';

type Props = {
  label: string;
  value: string;
  icon?: string;
  /** Defaults to the primary colour. */
  tint?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatTile({ label, value, icon, tint, style }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View
      style={[styles.tile, style]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={tint ?? colors.primary} />
      ) : null}
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  tile: {
    flex: 1,
    gap: 2,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {
    ...fonts.bold,
    fontSize: 22,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
}));
