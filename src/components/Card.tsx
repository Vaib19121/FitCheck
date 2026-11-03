import { ReactNode } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import { fonts, makeStyles, spacing } from '../theme';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({ children, onPress, style, accessibilityLabel }: CardProps) {
  const styles = useStyles();
  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

type SectionHeaderProps = {
  title: string;
  action?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={styles.headerAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(colors => ({
  card: {
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  headerAction: {
    ...fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
}));
