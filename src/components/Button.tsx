import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { fonts, makeStyles, useTheme } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  /** Ionicons name shown before the title. */
  icon?: string;
  /** `primary`: filled. `secondary`: outlined. */
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  style,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  const tint = isPrimary ? colors.onPrimary : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={tint} /> : null}
      <Text style={[styles.label, { color: tint }]}>{title}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles(colors => ({
  base: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    borderRadius: 26,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...fonts.semiBold,
    fontSize: 16,
  },
}));
